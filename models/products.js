//...................PproductsSchema......................
var mongoose = require('mongoose');
var productsSchema = new mongoose.Schema({
    produitName:String,
    produitPix: Number,
    
    ville: String,
    discription: String,
    
    image:String,
    
});


var products = mongoose.model('products', productsSchema);

module.exports = products;