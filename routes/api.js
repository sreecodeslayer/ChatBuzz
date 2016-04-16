/**
 * Created by Sreenadh TC on 15-04-2016.
 */
var User = require('../models/users');
var config = require('../config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

function tokenGenerator(user) {
    return jsonwebtoken.sign({
        _id: user.id,
        username: user.username,
        name: user.name
    }, secretKey, {expiresInMinute: 2000});
}

module.exports = function (app, express) {


    /*+++++++++++++++++++++++++++++++++
     * SIGNUP API
     ++++++++++++++++++++++++++++++++++*/
    var api = express.Router();

    api.post('/signup', function (req, res) {

        var user = new User({
            name: req.body.name,
            username: req.body.username,
            mobile: req.body.mobile,
            password: req.body.password
        });

        user.save(function (err) {
            if (err) {
                res.send(err);
                return;
            }

            res.json({message: "Welcome to ChatBuzz, you have signed up succesfully!"});
        });
    });


    /* ++++++++++++++++++
     * FIND ALL USERS API
     ++++++++++++++++++++ */
    api.get('/alluser', function (req, res) {

        User.find({}, function (err, users) {
            if (err) {
                res.send(err)
                return;
            }
            res.json(users);
        });
    });

    /* ++++++++++++++++++
     * LOGIN API
     ++++++++++++++++++++*/

    api.post('/login', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('password').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.send({message: "Ooopzz, we couldn't find you in our Buzzers list!"})
            } else if (user) {
                var validPassword = user.comparePassword(req.body.password);

                if (!validPassword) {
                    res.send({message: "Come on, that ain't your password Bruh! Work your noodles!!"});
                } else {
                    /* ++++++++++++++++++++++
                     * present his token auth
                     ++++++++++++++++++++++ */
                    res.json({
                        success: true,
                        message: "Wippee, Get buzzing, you are logged in!",
                        token: tokenGenerator(user)
                    });
                }
            }
        });
    });

    /* ++++++++++++++++++++++++++++++++++
     * Middleware to check the user token
     ++++++++++++++++++++++++++++++++++++*/

    api.use(function (req, res, next) {

        console.log("Someone just asked for Buzz token");
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        //check token validity
        if (token) {

            jsonwebtoken.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    res.status(403).send({
                        success: false,
                        message: "Well, that's a bummer, couldn't authenticate you!"
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({
                success: false,
                message: "Well, that's a bummer, couldn't authenticate you!"
            });
        }
    });


    /*+++++++++++++++++++++
     * TESTING THE MIDDLEWARE
     +++++++++++++++++++++*/

    api.get('/', function (req, res) {
        res.json("Hello buzzer!");
    });


    /*+++++++++++++++++++++++++++++++++++++
     * FETCH USER DATA FROM MIDDLEWARE ABOVE
     ++++++++++++++++++++++++++++++++++++*/

    api.get('/me', function (req, res) {

        res.json(req.decoded);

    });

    return api; // testing api
};