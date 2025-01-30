import base64
import time
import json
import hashlib
from nacl.signing import SigningKey, VerifyKey
from nacl.encoding import Base64Encoder
from typing import Dict, Tuple

class OndcCrypto:
    def __init__(self):
        self.blake = hashlib.blake2b(digest_size=64)
        
    def generate_key_pairs(self) -> Tuple[str, str]:
        """Generate ed25519 key pairs for signing"""
        # Generate a new random signing key
        signing_key = SigningKey.generate()
        # Get the verify key
        verify_key = signing_key.verify_key
        
        # Encode the keys in base64
        private_key = base64.b64encode(bytes(signing_key)).decode()
        public_key = base64.b64encode(bytes(verify_key)).decode()
        
        return private_key, public_key

    def create_signing_string(self, created: int, expires: int, digest: str) -> str:
        """Create the string to be signed"""
        return f"(created): {created}\n(expires): {expires}\ndigest: BLAKE-512={digest}"

    def generate_digest(self, request_body: Dict) -> str:
        """Generate BLAKE-512 digest of the request body"""
        # Reset blake hash object
        self.blake = hashlib.blake2b(digest_size=64)
        json_str = json.dumps(request_body, separators=(',', ':'))
        self.blake.update(json_str.encode())
        return base64.b64encode(self.blake.digest()).decode()

    def create_signature(self, signing_string: str, private_key: str) -> str:
        """Create signature using ed25519 private key"""
        # Decode the private key from base64
        key_bytes = base64.b64decode(private_key)
        # Create signing key object
        signing_key = SigningKey(key_bytes)
        # Sign the message
        signature = signing_key.sign(signing_string.encode())
        return base64.b64encode(signature.signature).decode()

    def create_authorization_header(self, request_body: Dict, private_key: str, 
                                 subscriber_id: str, unique_key_id: str) -> Tuple[str, str, str]:
        """Create the complete authorization header"""
        created = int(time.time())
        expires = created + 3600  # 1 hour validity
        
        # Generate digest
        digest = self.generate_digest(request_body)
        
        # Create signing string
        signing_string = self.create_signing_string(created, expires, digest)
        
        # Generate signature
        signature = self.create_signature(signing_string, private_key)
        
        # Create header
        auth_header = (
            f'Signature keyId="{subscriber_id}|{unique_key_id}|ed25519",'
            f'algorithm="ed25519",created="{created}",'
            f'expires="{expires}",headers="(created) (expires) digest",'
            f'signature="{signature}"'
        )
        
        return auth_header, signing_string, digest

    def verify_signature(self, signing_string: str, signature: str, public_key: str) -> bool:
        """Verify the signature using ed25519 public key"""
        try:
            # Decode the public key from base64
            verify_key = VerifyKey(base64.b64decode(public_key))
            # Verify the signature
            verify_key.verify(signing_string.encode(), base64.b64decode(signature))
            return True
        except Exception as e:
            print(f"Signature verification failed: {str(e)}")
            return False

def run_tests():
    # Initialize the crypto class
    ondc = OndcCrypto()
    
    # Test data
    request_body = {
        "context": {
            "domain": "nic2004:60212",
            "country": "IND",
            "city": "Kochi",
            "action": "search",
            "core_version": "0.9.1",
            "bap_id": "bap.stayhalo.in",
            "bap_uri": "https://8f9f-49-207-209-131.ngrok.io/protocol/",
            "transaction_id": "e6d9f908-1d26-4ff3-a6d1-3af3d3721054",
            "message_id": "a2fe6d52-9fe4-4d1a-9d0b-dccb8b48522d",
            "timestamp": "2022-01-04T09:17:55.971Z",
            "ttl": "P1M"
        },
        "message": {
            "intent": {
                "fulfillment": {
                    "start": {
                        "location": {
                            "gps": "10.108768, 76.347517"
                        }
                    },
                    "end": {
                        "location": {
                            "gps": "10.102997, 76.353480"
                        }
                    }
                }
            }
        }
    }

    print("1. Generating key pairs...")
    private_key, public_key = ondc.generate_key_pairs()
    print(f"Private key: {private_key}")
    print(f"Public key: {public_key}")

    print("\n2. Creating authorization header...")
    subscriber_id = "http://woocommerce-test-adaptor.ondc.org"
    unique_key_id = "bap1234"
    
    auth_header, signing_string, digest = ondc.create_authorization_header(
        request_body, private_key, subscriber_id, unique_key_id
    )
    print(f"Authorization header: {auth_header}")
    print(f"Signing string: {signing_string}")
    print(f"Digest: {digest}")

    print("\n3. Extracting signature from header...")
    # Extract signature from header
    signature = auth_header.split('signature="')[1].split('"')[0]
    print(f"Extracted signature: {signature}")

    print("\n4. Verifying signature...")
    is_valid = ondc.verify_signature(signing_string, signature, public_key)
    print(f"Signature valid: {is_valid}")

if __name__ == "__main__":
    run_tests()