var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const uuidv4 = require('uuid/v4');
var body = require('express-validator'); //validation
var moment = require('moment'); //datetime
const multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading files
const upload = multer({ dest: './static/images/produce_images/' }); //path.join(__dirname, 'static/images/produce_images/)
var ROLES = require('../utils/roles');
var fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');

var models = initModels(sequelise);

/* GET Produce page. */
router.get(
  '/',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintProduce.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: rows,
            user: req.user,
            page_name: 'produce',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('produce', {
            page_title: 'FoodPrint - Produce Page',
            data: '',
            user: req.user,
            page_name: 'produce',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        page_name: 'error',
      });
    }
  }
);

//route for insert data
router.post(
  '/save',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_type', 'Your produce Type is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('produce', {
        page_title: 'FoodPrint - Produce Page',
        data: '',
        page_name: 'produce',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_type: req.body.produce_type,
      };
      try {
        models.FoodprintProduce.create(data)
          .then(_ => {
            req.flash(
              'success',
              'New Produce added successfully! Produce Name = ' + req.body.produce_name
            );
            res.redirect('/app/produce');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to Produce page
            res.redirect('/app/produce');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors: e});
        res.render('produce', {
          page_title: 'FoodPrint - Produce Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'produce',
        });
      }
    }
  }
);

//route for update data
router.post(
  '/update',
  [
    check('produce_name', 'Your produce name is not valid').not().isEmpty().trim().escape(),
    check('produce_type', 'Your produce type is not valid').not().isEmpty().trim().escape(),
  ],
  function (req, res) {
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
      console.log('Validation error - ' + errors[key].msg);
    }
    if (!result.isEmpty()) {
      req.flash('error', errors);
      res.render('produce', {
        page_title: 'FoodPrint - Produce Page',
        data: '',
        page_name: 'produce',
      }); //should add error array here
    } else {
      let data = {
        produce_name: req.body.produce_name,
        produce_type: req.body.produce_type,
      };
      try {
        models.FoodprintProduce.update(data, {
          where: {
            pk: req.body.pk,
          },
        })
          .then(_ => {
            req.flash(
              'success',
              'Produce updated successfully! Produce Name = ' + req.body.produce_name
            );
            res.redirect('/app/produce');
          })
          .catch(err => {
            //throw err;
            req.flash('error', err);
            // redirect to produce page
            res.redirect('/app/produce');
          });
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e);
        //res.json({success: false, errors:errors.array()});
        res.render('produce', {
          page_title: 'FoodPrint - Produce Page',
          data: '',
          success: false,
          errors: e.array(),
          page_name: 'produce',
        });
      }
    }
  }
);

//route for delete data
router.post('/delete', (req, res) => {
  models.FoodprintProduce.destroy({
    where: {
      pk: req.body.pk2,
    },
  })
    .then(_ => {
      req.flash(
        'success',
        'Produce deleted successfully! Produce Name = ' + req.body.produce_name2
      );
      res.redirect('/app/produce');
    })
    .catch(err => {
      //throw err;
      req.flash('error', err);
      // redirect to Produce page
      res.redirect('/app/produce');
    });
});

/* GET Produce Price Page */
/* GET Produce page. */
router.get(
  '/pricepage',
  require('connect-ensure-login').ensureLoggedIn({ redirectTo: '/app/auth/login' }),
  function (req, res, next) {
    if (req.user.role === ROLES.Admin || req.user.role === ROLES.Superuser) {
      models.FoodprintProducePrice.findAll({
        order: [['pk', 'DESC']],
      })
        .then(rows => {
          res.render('produce_price', {
            page_title: 'FoodPrint - Produce Price Page',
            data: rows,
            user: req.user,
            page_name: 'produce price',
          });
        })
        .catch(err => {
          console.log('All produce err:' + err);
          req.flash('error', err);
          res.render('produce_price', {
            page_title: 'FoodPrint - Produce Price Page',
            data: '',
            user: req.user,
            page_name: 'produce price',
          });
        });
    } else {
      res.render('error', {
        message: 'You are not authorised to view this resource.',
        title: 'Error',
        user: req.user,
        page_name: 'error',
      });
    }
  }
);

module.exports = router;
