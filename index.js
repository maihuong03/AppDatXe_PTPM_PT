'use strict';

const express = require('express');
const keys = require('./server/config/main');
const ConnectDB = require('./server/config/db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();
const server = require('http').createServer(app);
const path = require('path');

const { MONGO_URL, PORT } = keys;

// MIDDLEWARE
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type'
    );
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload());

ConnectDB(MONGO_URL);

const User = require('./server/models/User');

app.get('/', (req, res) => {
    return res
        .status(200)
        .sendFile(path.resolve(__dirname, 'public/HomeArea/home.html'));
});

app.get('/map', (req, res) => {
    return res.sendFile(
        path.resolve(__dirname, 'public/screens/Map/index.html')
    );
});

app.get('/api', (req, res) => {
    return res.json('phat trien phan mem phan tan.xxxxxxxxzzzz');
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { phonenumber, password } = req.body;
    const user = await User.findOne({ phonenumber });
    if (!user || user.password !== password) {
        return res.status(400).json({
            message: 'FAIL',
            data: 'Sai số điện thoại hoặc mật khẩu',
        });
    }
    return res.json({
        message: 'SUCCESS',
        data: user,
    });
});
// SIGNUP
app.post('/api/signup', async (req, res) => {
    const { phonenumber, password } = req.body;
    const isOldUser = await User.findOne({ phonenumber });
    if (isOldUser) {
        return res.status(400).json({
            message: 'FAIL',
            data: 'Người dùng đã tồn tại',
        });
    }
    const newUser = await new User({
        username: 'user',
        userType: 'Customer',
        phonenumber,
        password,
    });

    await newUser.save();
    return res.json({
        message: 'SUCCESS',
        data: newUser,
    });
});

app.get('/api/user', async (req, res) => {
    const { _id } = req.query;
    const user = await User.findOne({ _id });

    return res.json({
        message: 'SUCCESS',
        data: user,
    });
});

app.get('/api/finddriver/:lat/:long', async (req, res) => {
    var appUser = new Array();
    const { lat, long } = req.params;
    User.find(
        { userType: 'Driver', CurrentPosition: { $exists: true } },
        function (err, driver) {
            if (err) {
                res.send('Không tìm thấy người dùng nào !');
                next();
            }
            driver.forEach((element) => {
                if (
                    element.CurrentPosition != [] &&
                    element.CurrentPosition.length != 0
                ) {
                    if (
                        element.CurrentPosition[0].LatitudePosition != 0 &&
                        element.CurrentPosition[0].LongitudePosition != 0
                    ) {
                        var distantCal = Math.sqrt(
                            (parseFloat(
                                element.CurrentPosition[0].LatitudePosition
                            ) -
                                parseFloat(lat)) *
                                (parseFloat(
                                    element.CurrentPosition[0].LatitudePosition
                                ) -
                                    parseFloat(lat)) +
                                (parseFloat(
                                    element.CurrentPosition[0].LongitudePosition
                                ) -
                                    parseFloat(long)) *
                                    (parseFloat(
                                        element.CurrentPosition[0]
                                            .LongitudePosition
                                    ) -
                                        parseFloat(long))
                        );
                        if (
                            parseFloat(distantCal) <= 0.01 &&
                            parseFloat(distantCal) >= 0
                        ) {
                            appUser.push(element);
                        }
                    }
                }
            });
            res.json(appUser);
        }
    );
});

app.post('/api/updateuserlocation/', async (req, res) => {
    const LoginId = req.body.LoginId;
    console.log(LoginId);
    const Longtitude = req.body.Longtitude;
    const Lattitude = req.body.Lattitude;
    User.findById(LoginId)
        .updateOne({
            CurrentPosition: [
                {
                    LatitudePosition: Lattitude,
                    LongitudePosition: Longtitude,
                },
            ],
        })
        .exec();
});

app.post('/api/naptien/', async (req, res) => {
    const { money, userId } = req.body;
    await User.findByIdAndUpdate(userId, { $inc: { money: money } }).exec()
    return res.json({
        message: 'SUCCESS',
        data: 'OK',
    });
});

app.get('/api/chosedriver/:id', async (req, res) => {
    const { id } = req.params;
    User.findById(id).find(
        { userType: 'Driver', CurrentPosition: { $exists: true } },
        function (err, driver) {
            if (err) {
                res.send('Không tìm thấy người dùng nào !');
                next();
            }
            res.json(driver);
        }
    );
});

app.get('/api/appuser/:id', async (req, res) => {
    const { id } = req.params;

    User.findById(id, function (err, driver) {
        if (err) {
            res.send('Không tìm thấy người dùng nào !');

            next();
        }

        res.json(driver);
    });
});

app.get('/api/historyroutedriver/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    historyRouteModel.find({ DriverId: id }, function (err, driver) {
        res.json(driver);
    });
});

app.get('/api/historyrouteuser/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    historyRouteModel.find({ AppUserId: id }, function (err, driver) {
        res.json(driver);
    });
});

app.get('/api/getmoney/:id', async (req, res) => {
    const { id } = req.params;
    User.findById(id).find({}, function (err, appuser) {
        res.json(appuser);
    });
});

app.post('/api/paymentdriver/', async (req, res) => {
    try {
        const LoginId = req.body.LoginId;
        const DriverId = req.body.DriverId;
        const money = req.body.money;
        const LocationFrom = req.body.LocationFrom;
        const LocationTo = req.body.LocationTo;
        const newHistoryMapRoute = await historyRouteModel.create({
            AppUserId: LoginId,
            AppUserType: 'Customer',
            DriverId: DriverId,
            LogContent: 'Số tiền trả ' + money,
            LogDescription:
                'Quãng đường đi từ ' + LocationFrom + ' đến ' + LocationTo,
            CreatedBy: LoginId,
        });
        res.status(201).json(newHistoryMapRoute);
        User.findByIdAndUpdate(LoginId, { $inc: { money: -money } }).exec();
        User.findByIdAndUpdate(DriverId, { $inc: { money: money } }).exec();
    } catch (error) {
        res.status(error.status || 500).end(
            error.message || 'Internal server error'
        );
    }
});

app.post('/api/appuser', async (req, res) => {
    try {
        const username = req.body.username;
        const Email = req.body.Email;
        const userType = req.body.userType;
        const Password = req.body.Password;
        const Phone = req.body.Phone;
        const BikeLicensePlace = req.body.BikeLicensePlace;

        await User.findOne({ Email: Email }).then(function (user) {
            if (user) {
                var err = new Error(
                    'A user with that email has already registered. Please use a different email..'
                );

                err.status = 400;

                return next(err);
            } else {
                const newUser = User.create({
                    username: username,

                    Email: Email,
                    userType,

                    Password: Password,

                    Phone: Phone,

                    BikeLicensePlace: BikeLicensePlace,
                });

                res.json(newUser);

                console.log(newUser);
            }
        });
    } catch (error) {
        res.status(error.status || 500).end(
            error.message || 'Internal server error'
        );
    }
});

app.get('/api/checkemailexist/:Email', async (req, res) => {
    const { Email } = req.params;
    User.find({ Email: Email }, function (err, appuser) {
        res.json(appuser[0]);
    });
});

app.get('/api/appuser/:Email/:Password', async (req, res) => {
    const { Email, Password } = req.params;
    User.find(
        { Email: Email, Password: Password },

        function (err, appuser) {
            if (err) {
                res.send('Không tìm thấy người dùng nào !');
                next();
            }
            res.json(appuser[0]);
            UserId = appuser[0]._id;
            username = appuser[0].username;
        }
    );
});

server.listen(PORT, () => console.log(`docker api run in PORT=${PORT}`));
