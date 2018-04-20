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

    supervisorPrompt();

});


function supervisorPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Product Sales By Department", "Create Department", "Quit"],
            name: "supervisorChoice"
        }
    ])
        .then(function (answers) {
            switch (answers.supervisorChoice) {
                case "View Product Sales By Department":
                    viewSales();
                    break;
                case "Create Department":
                    createDepartment();
                    break;
                case "Quit":
                    quit();
                    break;
                default:
                    break;

            }
        })
}


function viewSales() {

    table = new Table({ head: ['Department ID', 'Department Name', 'Over Head Costs', 'Total Sales', 'Total Profit'] });


  
    connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, sum(products.product_sales) AS total_sales, (sum(products.product_sales) - departments.over_head_costs) AS total_profit FROM products INNER JOIN departments ON products.department_name = departments.department_name GROUP BY departments.department_id", function (error, results, fields) {
        if (error) throw error;


        results.forEach(result => {
            table.push(
                [result.department_id, result.department_name, "$"+result.over_head_costs.toFixed(2), "$" + result.total_sales.toFixed(2), "$" + result.total_profit.toFixed(2)]
            );
        });


        console.log(table.toString());

        supervisorPrompt();


    });


}


function createDepartment() {

    inquirer.prompt([
        {
            type: "input",
            message: "Department Name: ",
            name: "departmentName"
        },
        {
            type: "input",
            message: "Over Head: ",
            name: "overHead"
        }
    ])
    .then(function (answers) {

        connection.query('INSERT INTO departments(department_name, over_head_costs) VALUES (?,?)',[answers.departmentName, answers.overHead], function (error, results, fields) {
            if (error) throw error;

            console.log(`
            Added New Department!
            `);
    
            supervisorPrompt();
    
    
        });

   });

}


function quit(){
    connection.end();
}