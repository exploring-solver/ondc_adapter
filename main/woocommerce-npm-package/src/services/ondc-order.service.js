class ONDCOrderService {
  constructor(wooCommerce, protocolHandler) {
    this.wc = wooCommerce;
    this.protocol = protocolHandler;
  }

  async handleInit(initRequest) {
    try {
      // Validate the init request
      this.validateInitRequest(initRequest);

      // Create quote
      const quote = await this.createQuote(initRequest.order);

      // Create cancellation terms
      const cancellationTerms = this.createCancellationTerms();

      return {
        order: {
          provider: initRequest.order.provider,
          items: initRequest.order.items,
          billing: initRequest.order.billing,
          fulfillments: initRequest.order.fulfillments,
          quote,
          payment: {
            "@ondc/org/buyer_app_finder_fee_type": "percent",
            "@ondc/org/buyer_app_finder_fee_amount": "3"
          },
          cancellation_terms: cancellationTerms
        }
      };
    } catch (error) {
      throw new Error(`Init handling failed: ${error.message}`);
    }
  }

  async handleConfirm(confirmRequest) {
    try {
      // Create WooCommerce order
      const wcOrder = await this.createWooCommerceOrder(confirmRequest);

      // Create ONDC response
      return {
        order: {
          id: wcOrder.id,
          state: "Created",
          provider: confirmRequest.order.provider,
          items: confirmRequest.order.items,
          billing: confirmRequest.order.billing,
          fulfillments: confirmRequest.order.fulfillments,
          quote: confirmRequest.order.quote,
          payment: confirmRequest.order.payment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Confirm handling failed: ${error.message}`);
    }
  }

  async handleUpdate(updateRequest) {
    try {
      const { order_id, update_type, items } = updateRequest;

      switch (update_type) {
        case 'return':
          return await this.handleReturn(order_id, items);
        case 'cancel':
          return await this.handlePartialCancel(order_id, items);
        default:
          throw new Error(`Unknown update type: ${update_type}`);
      }
    } catch (error) {
      throw new Error(`Update handling failed: ${error.message}`);
    }
  }

  async handleCancel(cancelRequest) {
    try {
      const { order_id, cancellation_reason_id, force } = cancelRequest;

      // Check cancellation eligibility
      await this.validateCancellation(order_id, cancellation_reason_id);

      // Process cancellation in WooCommerce
      const wcOrder = await this.wc.put(`orders/${order_id}`, {
        status: 'cancelled',
        meta_data: [
          {
            key: 'ondc_cancellation_reason',
            value: cancellation_reason_id
          }
        ]
      });

      // Calculate refund amount based on cancellation terms
      const refundAmount = await this.calculateRefundAmount(wcOrder, cancellation_reason_id);

      // Process refund if applicable
      if (refundAmount > 0) {
        await this.processRefund(order_id, refundAmount);
      }

      return {
        order: {
          id: order_id,
          state: "Cancelled",
          tags: [
            {
              code: "cancellation",
              list: [
                {
                  code: "reason",
                  value: cancellation_reason_id
                },
                {
                  code: "refund_amount",
                  value: refundAmount.toString()
                }
              ]
            }
          ]
        }
      };
    } catch (error) {
      throw new Error(`Cancel handling failed: ${error.message}`);
    }
  }

}

module.exports = ONDCOrderService; 