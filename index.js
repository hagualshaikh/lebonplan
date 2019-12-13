var express = require("express");
var exphbs = require("express-handlebars");
var expressSession = require("express-session");
var MongoStore = require("connect-mongo")(expressSession);
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var multer = require('multer');
var fs = require('fs');
var User = require("./models").User; // same as: var User = require('./models/user');
var products = require("./models").products; // same as: var User = require('./models/user');
var upload = multer({
    dest: 'public/uploads'
});

var port = process.env.PORT || 3000;
mongoose.connect(
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/lebonplan",
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    },
    function (err) {
        if (err !== null) {
            console.log('Dabatase connection err', err);
            return;
        }
        console.log('Database connected');
        
    }
);

var app = express();
// ..........................Configuration. hndelebars.......................................
app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('/uploads'));

// ...............................enable session management................................
app.use(
    expressSession({
        secret: "hadjoSwag",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);
// enable Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

   // .....................Routes........................
app.get('/', function(req, res) {
    console.log('GET /')
    res.render('home');
});
app.get('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        console.log('req.user', req.user);
        var id = req.user._id;
        User.findById(id, function (err, user) {
            console.log('err', err);
            console.log('document', user);
            if (err !== null) {
                console.log('Cannot get User err', err)
            } else {
                console.log('Users fetched successfully');
            }
            res.render('profile', user);
        });
        
    } else {
        res.redirect('/');
    }
    
});
            app.get("/admin", function (req, res) {
                if (req.isAuthenticated()) {
                    console.log(req.user);
                    res.render("admin");
                } else {
                    res.redirect("/");
                }
            });

app.get("/signup", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});
                app.get('/products', function (req, res) {
                    
                    products.find({}, function (err, productsDb) {
                        console.log('err', err);
                        console.log('productsDb', productsDb);
                        if (err !== null) {
                            console.log('Cannot get users err', err)
                        } else {
                            console.log('products fetched successfully');
                        }
                        console.log('productsDb',productsDb)

                        res.render('products', {
                            products:productsDb
                        })
                    })
                })
               
app.post('/products',upload.single('image'),function(req,res){
    var mimetypeMappro = {
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png'
    };
    var extension = mimetypeMappro[req.file.mimetype]; // req.file.mimetype might be equal to image/png
    var serverPicture = req.file.path + '.' + extension; // path in the server
    var image = serverPicture.replace('public', ''); // path in the db to be used on the client side

    fs.rename(req.file.path, serverPicture, function (err) {
        if (err !== null) {
            console.log('Cannot rename');
            return;
        }
        console.log('image', image);
        console.log("will signup");
        var product = new products({
            name:    req.body.name,
            produitPix: req.body.produitPix,
            ville:  req.body.ville,
            discription: req.body.discription,
            image:     image,
        });
        product.save(function (err, products) {
            console.log('err', err);
            console.log('document', products);
            if (err !== null) {
                console.log('connot save user err', err);
            } else {
                console.log('user saved successifly');
                console.log('products', products)
            }
            res.render('products',products)
        })
    });    
})
app.post("/signup",upload.single('image'), function (req, res) {
    var mimetypeMap = {
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png'
    };
    var extension = mimetypeMap[req.file.mimetype]; // req.file.mimetype might be equal to image/png
    var serverPicture = req.file.path + '.' + extension; // path in the server
    var image = serverPicture.replace('public', ''); // path in the db to be used on the client side

    fs.rename(req.file.path, serverPicture, function (err) {
        if (err !== null) {
            console.log('Cannot rename');
            return;
        }
        console.log('image', image);
        console.log("will signup");

        var username = req.body.username;
        var name= req.body.name
        var firstName = req.body.firstName;
        var email = req.body.email;
        var password= req.body.password;
        var passwordConfirm= req.body.passwordConfirm;
        if( password == passwordConfirm ){
            req.body.password
        }else{
            res.send('your password it is incorret')
        }
    User.register(
        new User({
            name:name,
            username: username,
            firstName:firstName,
            email:email,
            image:image
            
        }),
        password, // password will be hashed
        function (err, user) {
            if (err) {
                console.log("/signup user register err", err);
                return res.render("signup");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/admin");
                });
            }
        }
    );
    });
});

app.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login"
    })
);

            app.get("/logout", function (req, res) {
                req.logout();
                res.redirect("/");
            });

app.listen(port, function() {
    console.log("Server started on port:", port);
});