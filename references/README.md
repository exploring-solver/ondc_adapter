## References
The details about the adapter's expected outcome and various approaches can be found on: 
- https://github.com/orgs/ONDC-Official

1. **WooCommerce Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/woocommerce-adaptor](https://github.com/orgs/ONDC-Official/woocommerce-adaptor)

2. **Vinculum Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/vinculum-adaptor](https://github.com/orgs/ONDC-Official/vinculum-adaptor)

3. **ONDC AGR Specifications**  
   Link: [https://github.com/orgs/ONDC-Official/ONDC-AGR-Specifications](https://github.com/orgs/ONDC-Official/ONDC-AGR-Specifications)

4. **Shopify Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/shopify-adaptor](https://github.com/orgs/ONDC-Official/shopify-adaptor)

5. **Magento Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/magento-adaptor](https://github.com/orgs/ONDC-Official/magento-adaptor)

6. **OpenCart Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/opencart-adaptor](https://github.com/orgs/ONDC-Official/opencart-adaptor)

7. **BigCommerce Adapter**  
   Link: [https://github.com/orgs/ONDC-Official/bigcommerce-adaptor](https://github.com/orgs/ONDC-Official/bigcommerce-adaptor)


- Now the expected outcome from us is a middleman sdk to dissolve the problem of payload translation

- keeping in mind ondc compliance and registration of sellers selling on woocommerce, magento, shopify, etc. to easily manage their business with just adding their consumer key and secret and be a seller on the network.

- To achieve that all these platforms are open source and offer an API key and functions for order management, buyer to seller app integration we have to use their api and sdk to create an ondc protocol specific sdk/adapter that can be easily integrated in current buyer-seller apps and in future ones too easily

- Probable things to make: python package, npm package and maybe a few more in other majorly used apps as , maybe for frontend too but our main target is to make this for backend.

Now to understand what ONDC does is:
They want to remove monopoly of flipkart and amazon, and let kirana stores and small shops sell online without worrying about competition hence making india digital.
For that they register buyer and seller apps on their network and through them people buy using the buyer apps and the seller apps facilitate sellers to amange the orders.

main players are Buyer apps, seller apps and TSP's (Technology service providers)