// -------------------------------------------------Load all of the necessary NPM Packages----------------------------------------------------

require("dotenv").config();
var Table = require('cli-table');
var mysql = require("mysql");
var inquirer = require("inquirer");

// ----------------------------------Establish connection between node.js and the mysql database----------------------------------------------

var connection = mysql.createConnection({
    host: process.env.SQL_CONNECTION,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    welcomePrompt();
});

// --------------------------------------------------- Welcome customer to view database-------------------------------------------------------

function welcomePrompt() {

    inquirer.prompt([{

        type: "confirm",
        name: "showInventory",
        message: "Welcome to Bamazon! Would you like to view our inventory?",
        default: true

    }]).then(function (customer) {
        if (customer.showInventory === true) {
            inventoryDisplay();
        } else {
            console.log("No problem, Thank you! Come back soon!");
            connection.end();
        }
    });
}

// -------------------------------------------Function to display inventory in table form------------------------------------------------------

function inventoryDisplay() {

    // use the cli-table NPM to creat a new array with the data in clean table form
    var table = new Table({
        head: ['ID', 'Product', 'Department', 'Price', 'Stock'],
        colWidths: [5, 60, 20, 20, 10]
    });

    listInventory();

    function listInventory() {

        //Variable creation from bamazon_db connection
        connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (error, response) {
            for (var i = 0; i < response.length; i++) {

                var ItemId = response[i].item_id,
                    ProductName = response[i].product_name,
                    DepartmentName = response[i].department_name,
                    Price = response[i].price,
                    StockQuantity = response[i].stock_quantity;

                table.push(
                    [ItemId, ProductName, DepartmentName, Price, StockQuantity]
                );
            }
            console.log("");
            console.log("================================================ Current Bamazon Inventory ==============================================");
            console.log("");
            console.log(table.toString());
            console.log("");
            promptToPurchase();
        });
    }
}

// ----------------------------------------- Function to prompt the customer with question to purchase --------------------------------------------

function promptToPurchase() {

    inquirer.prompt([{

        type: "confirm",
        name: "yesPurchase",
        message: "Would you like to purchase an item?",
        default: true

    }]).then(function(customer) {
        if (customer.yesPurchase === true) {
            selectionPrompt();
        } else {
            console.log("No worries, Thank you! Come back soon!");
            connection.end();
        }
    });
}

// ----------------------------------- Function to prompt the customer to select item and quantity to buy --------------------------------

function selectionPrompt() {

    inquirer.prompt([{

            type: "input",
            name: "selectedId",
            message: "Please enter the ID number of the product you would like to purchase.",
        },
        {
            type: "input",
            name: "selectedQuantity",
            message: "How many units of this item would you like to purchase?",

        }
    ]).then(function(customerPurchase) {
        connection.query("SELECT * FROM products WHERE item_id=?", customerPurchase.selectedId, function(error, response) {
            for (var i = 0; i < response.length; i++) {

                if (customerPurchase.selectedQuantity > response[i].stock_quantity) {

                    console.log("===================================================");
                    console.log("Sorry! There is not enough of this product in stock. Please try again at a later date.");
                    console.log("===================================================");
                    welcomePrompt();

                } else {
                    //list item information confirming customer's selection
                    console.log("========================================================");
                    console.log("Great! Looks like we have the necessary stock to fulfill your order");
                    console.log("========================================================");
                    console.log("You've selected:");
                    console.log("----------------");
                    console.log("Item: " + response[i].product_name);
                    console.log("Department: " + response[i].department_name);
                    console.log("Price: " + response[i].price);
                    console.log("Quantity: " + customerPurchase.selectedQuantity);
                    console.log("----------------");
                    console.log("Total: $" + response[i].price * customerPurchase.selectedQuantity);
                    console.log("=========================================================");

                    var newStockUpdate = (response[i].stock_quantity - customerPurchase.selectedQuantity);
                    var idPurchased = (customerPurchase.selectedId);
                    // console.log(newStockUpdate);
                    confirmationPrompt(newStockUpdate, idPurchased);
                }
            }
        });
    });
}

//--------------------------------- Confirm Purchase before officially updating the database -----------------------------------------------

function confirmationPrompt(newStockUpdate, idPurchased) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmOrder",
        message: "Do you definitely want to proceed with purchasing this item and quantity?",
        default: true

    }]).then(function(customerApproval) {
        if (customerApproval.confirmOrder === true) {
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStockUpdate
            }, {
                item_id: idPurchased
            }], function(error, response) {});

            console.log("===========================================================");
            console.log("You Transaction has been successfully completed. Thank you.");
            console.log("===========================================================");
            connection.end();
        } else {
            console.log("=================================");
            console.log("No worries. Maybe another time!");
            console.log("=================================");
            connection.end();
        }
    });
}







