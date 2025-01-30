// ONDC to WooCommerce Adapter Functions
class OndcWooAdapter {
    constructor(wcApiKey, wcApiSecret, wcApiUrl) {
        this.wcApiKey = wcApiKey;
        this.wcApiSecret = wcApiSecret;
        this.wcApiUrl = wcApiUrl;
    }

    // Helper function to make WooCommerce API calls
    async callWooCommerceApi(endpoint, method, data = null) {
        try {
            const headers = {
                'Authorization': 'Basic ' + Buffer.from(this.wcApiKey + ':' + this.wcApiSecret).toString('base64'),
                'Content-Type': 'application/json'
            };

            const options = {
                method,
                headers,
                body: data ? JSON.stringify(data) : null
            };

            const response = await fetch(`${this.wcApiUrl}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('WooCommerce API Error:', error);
            throw error;
        }
    }

    // Handler for /on_status - Convert WooCommerce status to ONDC format
    async handleOnStatus(orderId) {
        try {
            const wooOrder = await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${orderId}`, 'GET');
            
            const statusMapping = {
                'pending': 'Pending',
                'processing': 'Accepted',
                'completed': 'Completed',
                'cancelled': 'Cancelled',
                'refunded': 'Cancelled',
                'failed': 'Cancelled',
                'on-hold': 'Pending'
            };

            return {
                context: {
                    action: 'on_status',
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: orderId,
                        state: statusMapping[wooOrder.status],
                        items: wooOrder.line_items.map(item => ({
                            id: item.product_id,
                            quantity: item.quantity,
                            status: statusMapping[wooOrder.status]
                        }))
                    }
                }
            };
        } catch (error) {
            return this.createNackResponse('30018', 'Order not found');
        }
    }

    // Handler for /on_cancel - Process cancellation in WooCommerce
    async handleOnCancel(ondcPayload) {
        try {
            const { order_id, cancellation_reason_id } = ondcPayload.message;
            
            // Update WooCommerce order status
            const updateData = {
                status: 'cancelled',
                meta_data: [
                    {
                        key: 'ondc_cancellation_reason',
                        value: cancellation_reason_id
                    }
                ]
            };

            await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${order_id}`, 'PUT', updateData);

            return {
                context: {
                    action: 'on_cancel',
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: order_id,
                        state: 'Cancelled',
                        cancellation_reason_id: cancellation_reason_id
                    }
                }
            };
        } catch (error) {
            return this.createNackResponse('30012', 'Invalid cancellation reason');
        }
    }

    // Handler for /on_update - Process returns and partial cancellations
    async handleOnUpdate(ondcPayload) {
        const { order_id, update_type, items } = ondcPayload.message;

        try {
            const wooOrder = await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${order_id}`, 'GET');

            if (update_type === 'return') {
                return await this.processReturn(wooOrder, items);
            } else if (update_type === 'cancel') {
                return await this.processPartialCancel(wooOrder, items);
            }
        } catch (error) {
            return this.createNackResponse('30018', 'Order update failed');
        }
    }

    // Process return request
    async processReturn(wooOrder, items) {
        // Create refund in WooCommerce
        const refundData = {
            line_items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                refund_total: true
            }))
        };

        await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${wooOrder.id}/refunds`, 'POST', refundData);

        return {
            context: {
                action: 'on_update',
                timestamp: new Date().toISOString()
            },
            message: {
                order: {
                    id: wooOrder.id,
                    state: 'Return_Initiated',
                    items: items.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        state: 'Return_Initiated'
                    }))
                }
            }
        };
    }

    // Process partial cancellation
    async processPartialCancel(wooOrder, items) {
        // Create partial refund in WooCommerce
        const refundData = {
            line_items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                refund_total: true
            }))
        };

        await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${wooOrder.id}/refunds`, 'POST', refundData);

        return {
            context: {
                action: 'on_update',
                timestamp: new Date().toISOString()
            },
            message: {
                order: {
                    id: wooOrder.id,
                    state: 'Updated',
                    items: items.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                        state: 'Cancelled'
                    }))
                }
            }
        };
    }

    // Handler for /on_track - Provide order tracking details
    async handleOnTrack(orderId) {
        try {
            const wooOrder = await this.callWooCommerceApi(`/wp-json/wc/v3/orders/${orderId}`, 'GET');
            
            // Get tracking info from WooCommerce shipping plugins if available
            const trackingInfo = wooOrder.meta_data.find(meta => meta.key === 'tracking_number');
            
            return {
                context: {
                    action: 'on_track',
                    timestamp: new Date().toISOString()
                },
                message: {
                    tracking: {
                        status: wooOrder.status,
                        url: trackingInfo ? trackingInfo.value : null
                    }
                }
            };
        } catch (error) {
            return this.createNackResponse('30018', 'Order not found');
        }
    }

    // Helper function to create NACK responses
    createNackResponse(code, message) {
        return {
            context: {
                action: 'NACK',
                timestamp: new Date().toISOString()
            },
            error: {
                code: code,
                message: message
            }
        };
    }

    // Handler for /on_confirm - Process new orders
    async handleOnConfirm(ondcPayload) {
        try {
            const { order } = ondcPayload.message;
            
            // Convert ONDC order to WooCommerce format
            const wooOrderData = {
                status: 'processing',
                line_items: order.items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                billing: order.billing,
                shipping: order.delivery,
                meta_data: [
                    {
                        key: 'ondc_order_id',
                        value: order.id
                    }
                ]
            };

            const wooOrder = await this.callWooCommerceApi('/wp-json/wc/v3/orders', 'POST', wooOrderData);

            return {
                context: {
                    action: 'on_confirm',
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: order.id,
                        state: 'Accepted',
                        provider_id: wooOrder.id
                    }
                }
            };
        } catch (error) {
            return this.createNackResponse('23002', 'Order validation failure');
        }
    }
}

// Usage example:
/*
const adapter = new OndcWooAdapter(
    'your_wc_key',
    'your_wc_secret',
    'your_wordpress_url'
);

// Handle ONDC API calls
app.post('/ondc/on_status', async (req, res) => {
    const response = await adapter.handleOnStatus(req.body.message.order_id);
    res.json(response);
});

app.post('/ondc/on_cancel', async (req, res) => {
    const response = await adapter.handleOnCancel(req.body);
    res.json(response);
});

// ... other endpoint handlers
*/