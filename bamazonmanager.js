var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var table;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bamazon'
});


connection.connect(function (err) {
    if (err) throw err;

    managerPrompt();

});

function managerPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            name: "managerChoice"
        }
    ])
        .then(function (answers) {
            switch (answers.managerChoice) {
                case "View Products For Sale":
                    displayProducts();
                    break;
                case "View Low Inventory":
                    displayLowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    addProduct();
                    break;
                case "Quit":
                    quit();
                    break;
                default:
                    break;

            }
        })
}




function displayProducts() {

    table = new Table({ head: ['ID', 'Product', 'Department', 'Price', 'Stock', 'Product Sales'] });


    connection.query('SELECT * from products', function (error, results, fields) {
        if (error) throw error;

        results.forEach(result => {
            table.push(
                [result.item_id, result.product_name, result.department_name, "$" + result.price.toFixed(2), result.stock_quantity, "$" + result.product_sales.toFixed(2)]
            );
        });


        console.log(table.toString());

        managerPrompt();


    });

}

function displayLowInventory(){

    table = new Table({ head: ['ID', 'Product', 'Department', 'Price', 'Stock', 'Product Sales'] });

    connection.query('SELECT * from products WHERE stock_quantity < ?',[5], function (error, results, fields) {
        if (error) throw error;

        results.forEach(result => {
            table.push(
                [result.item_id, result.product_name, result.department_name, "$" + result.price.toFixed(2), result.stock_quantity, "$" + result.product_sales.toFixed(2)]
            );
        });


        console.log(table.toString());

        managerPrompt();


    });

}

function addInventory(){

    inquirer.prompt([
        {
            type: "input",
            message: "Choose the id of the product",
            name: "itemID"
        },
        {
            type: "input",
            message: "How much would you like to add?",
            name: "addQuantity"
        }
    ])
        .then(function (answers) {

            connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [answers.addQuantity, answers.itemID], function (err, results, fields) {
                if (err) throw err;

                console.log(`
                Inventory Added
                `);

                managerPrompt();
            });
        });
}

function addProduct(){

    inquirer.prompt([
        {
            type: "input",
            message: "Product Name: ",
            name: "productName"
        },
        {
            type: "input",
            message: "Department: ",
            name: "department"
        },
        {
            type: "input",
            message: "Price: ",
            name: "price"
        },
        {
            type: "input",
            message: "Stock: ",
            name: "stock"
        }
    ])
    .then(function (answers) {

        connection.query('INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)',[answers.productName, answers.department, answers.price, answers.stock], function (error, results, fields) {
            if (error) throw error;

            console.log(`
            Added New Product!
            `);
    
            managerPrompt();
    
    
        });

   });
}

function quit(){
    connection.end();
}