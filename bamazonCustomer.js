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

    displayProducts(true);

});

function displayProducts(firstRun) {

    table = new Table({ head: ['ID', 'Product', 'Department', 'Price', 'Stock', 'Product Sales'] });


    connection.query('SELECT * from products', function (error, results, fields) {
        if (error) throw error;

        results.forEach(result => {
            table.push(
                [result.item_id, result.product_name, result.department_name, "$" + result.price, result.stock_quantity, "$" + result.product_sales]
            );
        });


        console.log(table.toString());

        if (firstRun) {
            purchasePrompt();
        }
        else {
            programFlowPrompt();
        }


    });


}


function programFlowPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Display Products", "Buy Something", "Quit"],
            name: "userChoice"
        }
    ])
        .then(function (answers) {
            switch (answers.userChoice) {
                case "Display Products":
                    displayProducts();
                    break;
                case "Buy Something":
                    purchasePrompt();
                    break;
                case "Quit":
                    quit();
                    break;
                default:
                    break;

            }
        })
}

function purchasePrompt() {


    inquirer.prompt([
        {
            type: "input",
            message: "Choose the id of the product you'd like the purchase",
            name: "purchaseID"
        },
        {
            type: "input",
            message: "How many would you like to buy",
            name: "purchaseQuantity"
        }
    ])
        .then(function (answers) {
            connection.query("SELECT * from products WHERE item_id = ?", [answers.purchaseID], function (err, results, fields) {

                if (err) throw err;



                if (results.length <= 0) {
                    console.log(`
                    Invalid ID
                    `);
                    programFlowPrompt();
                }
                else if (results[0].stock_quantity < answers.purchaseQuantity) {
                    console.log(`
                    Insufficient Stock
                    `);
                    programFlowPrompt();

                }
                else {
                    var newStock = results[0].stock_quantity - answers.purchaseQuantity;
                    var totalPrice = parseFloat(results[0].price) * answers.purchaseQuantity;

                    connection.query("UPDATE products SET stock_quantity = ?, product_sales = product_sales + ? WHERE item_id = ?", [newStock, totalPrice, answers.purchaseID], function (err, results, fields) {
                        if (err) throw err;



                        console.log(`
                        Total Price: $${totalPrice}
                        `)
                        programFlowPrompt();
                    });
                }
            });

        });


}

function quit() {
    connection.end();
}