// --------------------------------------------Load all of the necessary NPM Packages---------------------------------------

require("dotenv").config();
var Table = require('cli-table');
var mysql = require("mysql");
var inquirer = require("inquirer");

// ----------------------------------Establish connection between node.js and the mysql database----------------------------

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
    managerPrompt();
});

// ------------------------------------------ Prompt Manager to Select an Action------------------------------------------

function managerPrompt() {

    inquirer.prompt({

        type: "rawlist",
        name: "menuOptions",
        message: "Welcome Manager! What would you like to do with the Bamazon inventory today?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]

    }).then(function (selection) {
        // based on manager selection, call to specific functions
        if (selection.menuOptions === "View Products for Sale") {
            viewProducts();
        }
        else if (selection.menuOptions === "View Low Inventory") {
            viewLowInventory();
        }
        else if (selection.menuOptions === "Add to Inventory") {
            addToInventory();
        }
        else if (selection.menuOptions === "Add New Product") {
            addNewProduct()
        }

    });

}

// -----------------------------------------Function to view inventory for sale------------------------------------------------


function viewProducts() {

    // use the cli-table NPM to creat a new array with the data in clean table form
    var table = new Table({
        head: ['ID', 'Product', 'Price', 'Stock'],
        colWidths: [5, 60, 10, 10]
    });

    listInventory();

    function listInventory() {

        //Variable creation from bamazon_db connection
        connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (error, response) {
            for (var i = 0; i < response.length; i++) {

                var ItemId = response[i].item_id,
                    ProductName = response[i].product_name,
                    DepartmentName = response[i].department_name,
                    Price = response[i].price,
                    StockQuantity = response[i].stock_quantity;

                table.push(
                    [ItemId, ProductName, Price, StockQuantity]
                );
            }
            console.log("");
            console.log("========================= Current Bamazon Inventory For Sale ============================");
            console.log("");
            console.log(table.toString());
            console.log("");
            connection.end();
        });
    }
}

// --------------------------------------- Function to view low inventory ---------------------------------------------

function viewLowInventory() {

    // use the cli-table NPM to creat a new array with the data in clean table form
    var table = new Table({
        head: ['ID', 'Product', 'Price', 'Stock'],
        colWidths: [5, 60, 10, 10]
    });

    listLowInventory();

    function listLowInventory() {

        //Variable creation from bamazon_db connection
        connection.query("SELECT * FROM products", function (error, response) {
            for (var i = 0; i < response.length; i++) {

                if (response[i].stock_quantity <= 5) {

                    var ItemId = response[i].item_id,
                        ProductName = response[i].product_name,
                        DepartmentName = response[i].department_name,
                        Price = response[i].price,
                        StockQuantity = response[i].stock_quantity;

                    table.push(
                        [ItemId, ProductName, Price, StockQuantity]
                    );
                }
            }
            console.log("");
            console.log("=========================== Low Bamazon Inventory with a Quantity 5 or less ========================");
            console.log("");
            console.log(table.toString());
            console.log("");
            connection.end();
        });
    }
}

// ------------------------------------------ Function to add more stock to the inventory-----------------------------------------

function addToInventory() {

    inquirer.prompt([{

        type: "input",
        name: "selectedId",
        message: "Please enter the ID number of the product you would like to update.",
    },
    {
        type: "input",
        name: "selectedQuantity",
        message: "How many units of this item would you like to add?",

    }
    ]).then(function (inventoryAdd) {
        connection.query("SELECT * FROM products WHERE item_id=?", inventoryAdd.selectedId, function (error, response) {
            for (var i = 0; i < response.length; i++) {
                //list item information confirming manager's selection
                console.log("You've selected:");
                console.log("----------------");
                console.log("Item: " + response[i].product_name);
                console.log("Department: " + response[i].department_name);
                console.log("Price: " + response[i].price);
                console.log("Quantity to Be Added: " + inventoryAdd.selectedQuantity);
                console.log("----------------");
                console.log("New Stock Quantity:" + (parseInt(response[i].stock_quantity) + parseInt(inventoryAdd.selectedQuantity)));
                console.log("=========================================================");


                var newStockUpdate = parseInt(response[i].stock_quantity) + parseInt(inventoryAdd.selectedQuantity);
                var idUpdated = (inventoryAdd.selectedId);
                // console.log(newStockUpdate);
                confirmationPrompt(newStockUpdate, idUpdated);

            }

        }

        );
    })
};

//--------------------------------- Confirm Stock Addition before officially updating the database -----------------------------------------------

function confirmationPrompt(newStockUpdate, idUpdated) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmUpdate",
        message: "Do you definitely want to proceed with updating this item and quantity?",
        default: true

    }]).then(function (managerApproval) {
        if (managerApproval.confirmUpdate === true) {
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStockUpdate
            }, {
                item_id: idUpdated
            }], function (error, response) { });

            console.log("===========================================================");
            console.log("You addition to the stock inventory has been successfully completed. Thank you.");
            console.log("===========================================================");
            connection.end();
        } else {
            console.log("=================================");
            console.log("Not a problem! Try again when necessary.");
            console.log("=================================");
            connection.end();
        }
    });
}

// ------------------------- Function to add new product with info to the database --------------------------------------------

function addNewProduct() {

    inquirer.prompt([{

        type: "input",
        name: "productName",
        message: "Please enter the name of the product you would like to add.",
    },
    {
        type: "input",
        name: "productDepartment",
        message: "In which department will this item be sold?",

    },
    {
        type: "input",
        name: "productPrice",
        message: "Please provide a unit price for this product (00.00).",

    },
    {
        type: "input",
        name: "productStockQty",
        message: "How many units of this item would you like to add?",

    }
    ]).then(function (newProduct) {
        connection.query("INSERT INTO products SET ?", {
            product_name: newProduct.productName,
            department_name: newProduct.productDepartment,
            price: newProduct.productPrice,
            stock_quantity: newProduct.productStockQty
        }, function (error, response) { });
        console.log("========================================================");
        console.log("Great! Looks like the new inventory was successfully added");
        console.log("========================================================");
        console.log("You've added:");
        console.log("----------------");
        console.log("Item: " + newProduct.productName);
        console.log("Department: " + newProduct.productDepartment);
        console.log("Price: " + newProduct.productPrice);
        console.log("Quantity: " + newProduct.productStockQty);
        connection.end();
    }
    );
}
