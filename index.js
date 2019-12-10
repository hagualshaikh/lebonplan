var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

var bodyParser = require("body-parser");

var port = process.env.PORT || 3000;

var app = express();

app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    console.log('GET /')
    res.render('home');
});

app.get('/products', function(req, res) {
    console.log('GET /products')
    res.render('products');
});




app.listen(port, function() {
    console.log("Server started on port:", port);
});