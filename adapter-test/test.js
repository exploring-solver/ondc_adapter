let currentMode = 'buyer';
let adapter = null;

// Mock the adapter for testing purposes
class MockAdapter {
    constructor(config, context) {
        this.config = config;
        this.context = context;
    }

    async searchCatalog(params) {
        return {
            message: {
                catalog: {
                    items: [
                        {
                            id: "1",
                            name: "Test Product",
                            price: 100
                        }
                    ]
                }
            }
        };
    }

    async placeOrder(orderDetails) {
        return {
            message: {
                order: {
                    id: "order_123",
                    status: "created",
                    items: orderDetails.items
                }
            }
        };
    }

    async updateOrderStatus(orderId, status) {
        return {
            message: {
                order: {
                    id: orderId,
                    status: status
                }
            }
        };
    }

    async updateInventory(productId, quantity) {
        return {
            success: true,
            product: {
                id: productId,
                stock_quantity: quantity
            }
        };
    }
}

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('buyerOps').style.display = mode === 'buyer' ? 'block' : 'none';
    document.getElementById('sellerOps').style.display = mode === 'seller' ? 'block' : 'none';
    initializeAdapter();
}

function initializeAdapter() {
    const config = getConfig();
    adapter = new MockAdapter(config, { type: currentMode });
}

function getConfig() {
    return {
        woocommerce: {
            storeUrl: document.getElementById('storeUrl').value,
            consumerKey: document.getElementById('consumerKey').value,
            consumerSecret: document.getElementById('consumerSecret').value
        },
        ondc: {
            subscriberId: document.getElementById('subscriberId').value,
            subscriberUrl: document.getElementById('subscriberUrl').value
        }
    };
}

function displayResponse(response) {
    const panel = document.getElementById('responsePanel');
    panel.innerHTML = JSON.stringify(response, null, 2);
}

// Event Handlers
async function searchCatalog() {
    try {
        const query = document.getElementById('searchQuery').value;
        const location = document.getElementById('location').value;
        const response = await adapter.searchCatalog({ query, location });
        displayResponse(response);
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

async function placeOrder() {
    try {
        const orderDetails = JSON.parse(document.getElementById('orderDetails').value);
        const response = await adapter.placeOrder(orderDetails);
        displayResponse(response);
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

async function updateOrderStatus() {
    try {
        const orderId = document.getElementById('orderId').value;
        const status = document.getElementById('orderStatus').value;
        const response = await adapter.updateOrderStatus(orderId, status);
        displayResponse(response);
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

async function updateInventory() {
    try {
        const productId = document.getElementById('productId').value;
        const quantity = document.getElementById('quantity').value;
        const response = await adapter.updateInventory(productId, quantity);
        displayResponse(response);
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

// Form submission handler
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    initializeAdapter();
    displayResponse({ message: "Configuration updated successfully" });
});

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeAdapter();
});