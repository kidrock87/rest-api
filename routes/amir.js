'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const md5 = require('md5');
const nodemailer = require('nodemailer');
const ObjectId = require("mongojs").ObjectId;
const super_word = "Fastr is the west";

exports.register = function (server, options, next) {

    const db = server.app.db;



    server.route({
          method: 'POST',
          path: '/check_amir',
          handler: function (request, reply) {
            var bbb = [{
              confirmed: 'yes',
              }]

              var ccc = [{
                confirmed: 'no',
                }]
            if(request.payload){
              reply(request.payload)
            }else{
              reply(ccc)
            };
          }
      });





    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
