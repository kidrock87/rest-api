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
          path: '/registration',
          handler: function (request, reply) {
              const book = request.payload;
              var lastname = request.payload.lastname;
              var firstname = request.payload.firstname;
              const email = request.payload.email;
              var confirmed = request.payload.confirmed;
              var password = request.payload.password;
              var ref_id = request.payload.ref_id;
              var insert_date = Date.now();
              var users_hash = md5(lastname + firstname + email + insert_date);
              password = md5(password + super_word);

              var bbb = [{
  							firstname: firstname,
  							lastname: lastname,
  							email: email,
                confirmed: confirmed,
  							insert_date: insert_date,
                password: password,
  							users_hash: users_hash,
                ref_id: ref_id
  						}]

              const v_link = 'http://app.fastr.biz/#/verification/'+users_hash;

              nodemailer.createTestAccount((err, account) => {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true, // true for 465, false for other ports
                        auth: {
                            user: 'totalmmaru@gmail.com', // generated ethereal user
                            pass: 'ARakfuvfy2'  // generated ethereal password
                        }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: 'FASTR', // sender address
                        to: email, // list of receivers
                        subject: 'Email verification', // Subject line
                        text: 'Hello, welcome to FASTR. Your verification link:'+v_link+'', // plain text body
                        html: 'Hello, welcome to FASTR<br><b>Your verification link: <a href="'+v_link+'">'+v_link+'</a></b>' // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                    });
              });



              db.users.findOne({
                email: email
              }, (err, doc) => {
                  if (err) {
                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
                  }
                  if (!doc) {
                    db.users.save(bbb, (err, result) => {

                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }


                    });
                  }else{
                    return reply(Boom.notFound());
                  }
                  reply(bbb);
              });



          },
          config: {
              validate: {
                  payload: {
                      lastname : Joi.any(),
            					firstname: Joi.any(),
                      confirmed: Joi.any(),
                      password: Joi.any(),
            					email: Joi.any(),
                      ref_id: Joi.any().optional()
            				}
                  }
                }
            });




/*
            server.route({
              method: 'POST',
              path: '/registration_by_id',
              handler: function (request, reply) {
                  const book = request.payload;
                  var lastname = request.payload.lastname;
                  var firstname = request.payload.firstname;
                  const email = request.payload.email;
                  var confirmed = request.payload.confirmed;
                  var password = request.payload.password;
                  var ref_id = request.payload.ref_id;
                  var insert_date = Date.now();
                  var users_hash = md5(lastname + firstname + email + insert_date);
                  password = md5(password + super_word);

                  var bbb = [{
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    confirmed: confirmed,
                    insert_date: insert_date,
                    password: password,
                    ref_id: ref_id,
                    users_hash: users_hash
                  }]

                  const v_link = 'http://localhost:8080/#/verification/'+users_hash;

                  nodemailer.createTestAccount((err, account) => {

                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true, // true for 465, false for other ports
                            auth: {
                                user: 'totalmmaru@gmail.com', // generated ethereal user
                                pass: 'ARakfuvfy2'  // generated ethereal password
                            }
                        });

                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: 'FASTR', // sender address
                            to: email, // list of receivers
                            subject: 'Email verification', // Subject line
                            text: 'Hello, welcome to FASTR. Your verification link:'+v_link+'', // plain text body
                            html: 'Hello, welcome to FASTR<br><b>Your verification link: <a href="'+v_link+'">'+v_link+'</a></b>' // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId);
                            // Preview only available when sending through an Ethereal account
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                        });
                  });

                  db.users.save(bbb, (err, result) => {

                      if (err) {
                          return reply(Boom.wrap(err, 'Internal MongoDB error'));
                      }

                      reply(bbb);
                  });
              },
              config: {
                  validate: {
                      payload: {
                          lastname : Joi.any(),
                          ref_id: Joi.any(),
                          firstname: Joi.any(),
                          confirmed: Joi.any(),
                          password: Joi.any(),
                          email: Joi.any(),
                        }
                      }
                    }
                });

*/

            server.route({
    		          method: 'POST',
    		          path: '/check_hash',
    		          handler: function (request, reply) {
    		          const tag = request.payload.users_hash;
    		              db.users.findOne({
    										users_hash: tag
    		              }, (err, doc) => {
    		                  if (err) {
    		                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
    		                  }
    		                  if (!doc) {
    													return reply(Boom.notFound());
    		                  }
    		                  reply(doc);
    		              });
    		          },
    		          config: {
    			    				validate: {
    			    					payload: Joi.object({
    			    						users_hash: Joi.any(),
    			    					}).required().min(1)
    			            }
    		    				}
    		      });

              server.route({
      		          method: 'POST',
      		          path: '/registration_confirmed',
      		          handler: function (request, reply) {
      		          const tag = request.payload.user_id;
                    var bbb = [{
        							confirmed: 'yes',
        							}]

                      db.users.update({
        							   _id: ObjectId(tag)
        							}, {
        								$set: {'confirmed': 'true'}
        							}, function (err, result) {

        								if (err) {
        									return reply(Boom.wrap(err, 'Internal MongoDB error'));
        								}

        								if (result.n === 0) {
        									return reply(Boom.notFound());
        								}

        								reply().code(204);
        							});



      		          },
      		          config: {
      			    				validate: {
      			    					payload: Joi.object({
      			    						user_id: Joi.any(),
      			    					}).required().min(1)
      			            }
      		    				}
      		      });

                server.route({
        		          method: 'POST',
        		          path: '/check_login',
        		          handler: function (request, reply) {

        		          var user_id = ObjectId(request.payload.user_id);
                      var password = request.payload.password;
                      var email = request.payload.email;


                      db.users.count({"ref_id" : request.payload.user_id},(err, ref_count) => {



                                db.users.findOne({
                                    _id: user_id,
                                    password: password,
                                    email: email
                                  }, (err, doc) => {
                                      if (err) {
                                          return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                      }
                                      if (!doc) {
                                          return reply(Boom.notFound());
                                      }

                                      var bbb = [{
                          							ref_count: ref_count,
                          							}]
                                      doc['ref_count'] = ref_count
                                      reply(doc);
                                });
                            });



        		          },
        		          config: {
        			    				validate: {
        			    					payload: Joi.object({
        			    						user_id: Joi.any(),
                              email: Joi.any(),
                              password: Joi.any(),
        			    					}).required().min(1)
        			            }
        		    				}
        		      });

                  server.route({
          		          method: 'POST',
          		          path: '/login',
          		          handler: function (request, reply) {
          		          var password = request.payload.password;
                        var email = request.payload.email;
                        password = md5(password + super_word);

                        db.users.findOne({
                          password: password,
                          email: email
                        }, (err, doc) => {
                            if (err) {
                                return reply(Boom.wrap(err, 'Internal MongoDB error'));
                            }
                            if (!doc) {
                                return reply(Boom.notFound());
                            }
                            reply(doc);
                        });
          		          },
          		          config: {
          			    				validate: {
          			    					payload: Joi.object({
          			    						email: Joi.any(),
                                password: Joi.any(),
          			    					}).required().min(1)
          			            }
          		    				}
          		  });


                server.route({
        		          method: 'POST',
        		          path: '/update_user_settings/{id}',
        		          handler: function (request, reply) {

                      var user_id= request.params.id;
                      const book = request.payload;

                        db.users.update({
          							   _id: ObjectId(user_id)
          							}, {
          								$set: request.payload
          							}, function (err, result) {

          								if (err) {
          									return reply(Boom.wrap(err, 'Internal MongoDB error'));
          								}

          								if (result.n === 0) {
          									return reply(Boom.notFound());
          								}

          								reply().code(204);
          							});



        		          },
        		          config: {
        			    				validate: {
        			    					payload: Joi.object({
        			    						subscriber: Joi.any().optional(),
                              rrrr: Joi.any().optional()
        			    					}).required().min(1)
        			            }
        		    				}
        		      });
                  server.route({
                        method: 'GET',
                        path: '/get_user',
                        handler: function (request, reply) {




                            reply('callback');

                        }
                    });
            ////////////////////fastr


    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
