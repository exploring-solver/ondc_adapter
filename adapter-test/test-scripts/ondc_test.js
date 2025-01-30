const ONDCProtocolHandler = require('../../main/woocommerce-npm-package/src/handlers/protocol-handler');

// Test configuration based on provided subscription details
const config = {
  subscriberId: 'woocommerce-test-adaptor.ondc.org',
  uniqueKeyId: 'unique',
  // Note: In production, these would be your actual keys
  signingPrivateKey: process.env.SIGNING_PRIVATE_KEY || 'your-private-key',
  signingPublicKey: 'signing',
  subscriberUrl: 'https://woocommerce-test-adaptor.ondc.org/sellers',
  domain: 'ONDC:RET10',
  city: '*',
  // Using staging URLs
  gatewayUrl: 'https://staging.gateway.ondc.org',
  registryUrl: 'https://staging.registry.ondc.org'
};

async function runTests() {
  try {
    console.log('Starting ONDC Protocol Tests...\n');
    
    // Initialize protocol handler
    const protocolHandler = new ONDCProtocolHandler(config);
    
    // Test 1: Registry Lookup
    console.log('Test 1: Registry Lookup');
    try {
      const lookupResult = await protocolHandler.lookupRegistry(config.subscriberId);
      console.log('Registry Lookup Success:', lookupResult);
    } catch (error) {
      console.error('Registry Lookup Failed:', error.message);
    }
    console.log('-'.repeat(50), '\n');

    // Test 2: Search Request
    console.log('Test 2: Search Request');
    try {
      const searchParams = {
        category: 'Grocery',
        city: 'std:080'
      };
      const searchResult = await protocolHandler.search(searchParams);
      console.log('Search Success:', searchResult);
    } catch (error) {
      console.error('Search Failed:', error.message);
    }
    console.log('-'.repeat(50), '\n');

    // Test 3: Auth Header Creation
    console.log('Test 3: Auth Header Creation');
    try {
      const testBody = {
        context: {
          domain: 'ONDC:RET10',
          action: 'search',
          country: 'IND',
          city: 'std:080'
        },
        message: {
          intent: {}
        }
      };
      const authHeader = await protocolHandler.createAuthHeader(testBody);
      console.log('Auth Header Created:', authHeader);
    } catch (error) {
      console.error('Auth Header Creation Failed:', error.message);
    }
    console.log('-'.repeat(50), '\n');

  } catch (error) {
    console.error('Test Suite Failed:', error);
  }
}

// Function to run a single test
async function runSingleTest(testName, testFn) {
  console.log(`Running test: ${testName}`);
  try {
    const result = await testFn();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Failed:', error.message);
    return null;
  }
}

// If running directly (not required as a module)
if (require.main === module) {
  // Load environment variables if using dotenv
  require('dotenv').config();
  
  // Run the tests
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  runSingleTest,
  config
};