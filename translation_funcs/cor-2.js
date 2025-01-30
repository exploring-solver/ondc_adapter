const ONDCProtocolHandler = require('./ondc-protocol-handler');
const WooCommerceAPI = require('@woocommerce/woocommerce-rest-api');

class WooCommerceONDCAdapter {
  constructor(config) {
    this.ondcHandler = new ONDCProtocolHandler(config.ondcConfig);
    this.wooCommerce = new WooCommerceAPI({
      url: config.wooCommerceUrl,
      consumerKey: config.wooCommerceKey,
      consumerSecret: config.wooCommerceSecret,
      version: 'wc/v3'
    });
  }

  // Helper method to transform ONDC order status to WooCommerce status
  mapONDCStatusToWoo(ondcStatus) {
    const statusMap = {
      'Created': 'pending',
      'Accepted': 'processing',
      'In-progress': 'processing',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
      // Add more mappings as needed
    };
    return statusMap[ondcStatus] || 'pending';
  }

  // Helper method to transform WooCommerce status to ONDC status
  mapWooStatusToONDC(wooStatus) {
    const statusMap = {
      'pending': 'Created',
      'processing': 'In-progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
      // Add more mappings as needed
    };
    return statusMap[wooStatus] || 'Created';
  }

  // Handler for incoming ONDC status requests
  async handleStatusRequest(ondcStatusRequest) {
    try {
      // Extract order ID from ONDC request
      const orderId = ondcStatusRequest.message.order_id;
      
      // Get order status from WooCommerce
      const wooOrder = await this.wooCommerce.get(`orders/${orderId}`);
      
      // Transform WooCommerce response to ONDC format
      const ondcResponse = {
        context: ondcStatusRequest.context,
        message: {
          order: {
            id: wooOrder.id,
            state: this.mapWooStatusToONDC(wooOrder.status),
            items: [] // Transform WooCommerce items to ONDC format
            // Add other required ONDC fields
          }
        }
      };

      return ondcResponse;
    } catch (error) {
      throw new Error(`Status request failed: ${error.message}`);
    }
  }

  // Handler for incoming ONDC cancel requests
  async handleCancelRequest(ondcCancelRequest) {
    try {
      const orderId = ondcCancelRequest.message.order_id;
      const cancelReason = ondcCancelRequest.message.cancellation_reason;
      
      // Update order in WooCommerce
      await this.wooCommerce.put(`orders/${orderId}`, {
        status: 'cancelled',
        customer_note: `ONDC Cancellation: ${cancelReason}`
      });

      // Prepare ONDC response
      const ondcResponse = {
        context: ondcCancelRequest.context,
        message: {
          order: {
            id: orderId,
            state: 'Cancelled',
            cancellation_reason: cancelReason
            // Add other required ONDC fields
          }
        }
      };

      return ondcResponse;
    } catch (error) {
      throw new Error(`Cancel request failed: ${error.message}`);
    }
  }

  // Handler for incoming ONDC return/update requests
  async handleUpdateRequest(ondcUpdateRequest) {
    try {
      const orderId = ondcUpdateRequest.message.order_id;
      const updateType = ondcUpdateRequest.message.update_type;

      // Handle different types of updates
      switch(updateType) {
        case 'return':
          // Create return order in WooCommerce
          const returnOrder = await this.createWooCommerceReturn(orderId, ondcUpdateRequest.message);
          break;
        case 'partial_cancel':
          // Handle partial cancellation
          const updatedOrder = await this.handlePartialCancellation(orderId, ondcUpdateRequest.message);
          break;
        // Add other update types as needed
      }

      // Transform WooCommerce response to ONDC format
      const ondcResponse = {
        context: ondcUpdateRequest.context,
        message: {
          order: {
            id: orderId,
            // Add update-specific fields
          }
        }
      };

      return ondcResponse;
    } catch (error) {
      throw new Error(`Update request failed: ${error.message}`);
    }
  }

  // Helper method to create return order in WooCommerce
  async createWooCommerceReturn(orderId, returnDetails) {
    // Implementation for creating return order
    // This would involve creating a new order with negative quantities
    // or using a returns management plugin if available
  }

  // Helper method to handle partial cancellation
  async handlePartialCancellation(orderId, cancellationDetails) {
    // Implementation for partial cancellation
    // This would involve updating specific line items in the order
  }

  // Handler for tracking requests
  async handleTrackRequest(ondcTrackRequest) {
    try {
      const orderId = ondcTrackRequest.message.order_id;
      
      // Get tracking info from WooCommerce
      // This might require integration with shipping providers
      const trackingInfo = await this.getWooCommerceTracking(orderId);

      // Transform to ONDC format
      const ondcResponse = {
        context: ondcTrackRequest.context,
        message: {
          tracking: {
            url: trackingInfo.tracking_url,
            status: trackingInfo.status
            // Add other required tracking fields
          }
        }
      };

      return ondcResponse;
    } catch (error) {
      throw new Error(`Track request failed: ${error.message}`);
    }
  }

  // Helper method to get tracking information
  async getWooCommerceTracking(orderId) {
    // Implementation to get tracking details
    // This might involve integration with shipping providers
  }

  // Webhook handler for WooCommerce order status changes
  async handleWooCommerceStatusUpdate(wooOrder) {
    try {
      // Transform WooCommerce status to ONDC format
      const ondcStatus = this.mapWooStatusToONDC(wooOrder.status);

      // Send status update to ONDC network
      await this.ondcHandler.sendToNetwork('on_status', {
        order: {
          id: wooOrder.id,
          state: ondcStatus,
          // Add other required ONDC fields
        }
      });
    } catch (error) {
      throw new Error(`WooCommerce status update failed: ${error.message}`);
    }
  }

  // Method to register webhooks with WooCommerce
  async registerWooCommerceWebhooks(callbackUrl) {
    try {
      // Register webhooks for order updates
      await this.wooCommerce.post('webhooks', {
        name: 'ONDC Order Status Update',
        topic: 'order.updated',
        delivery_url: callbackUrl,
        status: 'active'
      });
      // Add other webhooks as needed
    } catch (error) {
      throw new Error(`Webhook registration failed: ${error.message}`);
    }
  }
}

module.exports = WooCommerceONDCAdapter;