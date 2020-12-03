# Bamazon - A Node.js & MySQL Application
__________________________________________________________________________________________

# Customer View
* Created an Amazon-like storefront with the MySQL skills learned thus far. The app takes in orders from customers and depletes stock from the store's inventory. 

1. This database will populate with around 10 different products. (i.e. Inserted "mock" data rows into this database and table).
Then running the Node application called bamazonCustomer.js. will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

2. The app then prompts users with two messages.
The first asks them the ID of the product they would like to buy.
The second message asks how many units of the product they would like to buy.

3. Once the customer has placed the order, your application checks if the store has enough of the product to meet the customer's request.
If not, the app will log a phrase like Insufficient quantity!, and then prevent the order from going through.

4. However, if the store does have enough of the product, the customer's order will be fulfilled.
This means updating the SQL database to reflect the remaining quantity.
Once the update goes through, the customer will be given the total cost of their purchase.

[Click here to demo the bamazonCustomer.js!](https://youtu.be/RWs7zeapTjM)
 
 # Manager View
* In addition, a manager specific interface was created to allow the viewing of all inventory, low inventory, adding more stock, and adding new products. Every edit that is saved is automatically updated to the bamazon database.

1. If a manager selects View Products for Sale, the app will list every available item: the item IDs, names, prices, and quantities.
2. If a manager selects View Low Inventory, then it will list all items with an inventory count lower than five.
3. If a manager selects Add to Inventory, this app will display a prompt that will let the manager "add more" of any item currently in the store.
4. If a manager selects Add New Product, it will allow the manager to add a completely new product to the store.

[Click here to demo the bamazonManager.js!](https://www.youtube.com/watch?v=aURXbVDltV0&feature=youtu.be)
