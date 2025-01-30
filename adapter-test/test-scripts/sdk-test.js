// Import the SDK functions (assuming the SDK is installed)
const { createAuthorizationHeader, isHeaderValid, createVLookupSignature } = require("ondc-crypto-sdk-nodejs");

// Mock private and public keys (replace with actual keys if available)
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6... (truncated for brevity)
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6... (truncated for brevity)
-----END PUBLIC KEY-----`;

// Mock data for the request body
const mockBody = {
  context: {
    domain: "ONDC:RET10",
    country: "IND",
    city: "std:080",
    action: "search",
    core_version: "1.0.0",
    bap_id: "buyer-app.com",
    bap_uri: "https://buyer-app.com/ondc",
    transaction_id: "1234567890",
    message_id: "9876543210",
    timestamp: "2023-10-01T12:00:00Z",
  },
  message: {
    intent: {
      item: {
        descriptor: {
          name: "Test Product",
        },
      },
    },
  },
};

// Mock subscriber details
const subscriberId = "buyer-app.com/ondc";
const subscriberUniqueKeyId = "123";

// Test createAuthorizationHeader
const testCreateAuthorizationHeader = async () => {
  try {
    const header = await createAuthorizationHeader({
      body: mockBody,
      privateKey: privateKey,
      subscriberId: subscriberId,
      subscriberUniqueKeyId: subscriberUniqueKeyId,
    });
    console.log("Authorization Header:", header);
    return header;
  } catch (error) {
    console.error("Error creating authorization header:", error);
  }
};

// Test isHeaderValid
const testIsHeaderValid = async (header) => {
  try {
    const isValid = await isHeaderValid({
      header: header,
      body: mockBody,
      publicKey: publicKey,
    });
    console.log("Is Header Valid?", isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying header:", error);
  }
};

// Test createVLookupSignature
const testCreateVLookupSignature = async () => {
  try {
    const signature = await createVLookupSignature({
      country: "IND",
      domain: "ONDC:RET10",
      type: "sellerApp",
      city: "std:080",
      subscriber_id: subscriberId,
      privateKey: privateKey,
    });
    console.log("VLookup Signature:", signature);
    return signature;
  } catch (error) {
    console.error("Error creating vLookup signature:", error);
  }
};

// Run the tests
const runTests = async () => {
  console.log("Testing createAuthorizationHeader...");
  const header = await testCreateAuthorizationHeader();

  if (header) {
    console.log("\nTesting isHeaderValid...");
    await testIsHeaderValid(header);
  }

  console.log("\nTesting createVLookupSignature...");
  await testCreateVLookupSignature();
};

runTests();