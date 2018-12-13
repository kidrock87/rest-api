'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/tickers',
        handler: function (request, reply) {

            db.tickers.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });

    server.route({
          method: 'POST',
          path: '/tickers',
          handler: function (request, reply) {

              const book = request.payload;

              db.tickers.save(book, (err, result) => {

                  if (err) {
                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
                  }

                  reply(book);
              });
          },
          config: {
              validate: {
                  payload: {
                      exchange : Joi.any(),
            					ask_price: Joi.any(),
            					bid_price: Joi.any(),
                      spread: Joi.any(),
            					volume: Joi.any(),
            					trades24: Joi.any(),
                      insert_date: Joi.number().integer(),
                      exchange: Joi.any(),
                      pair: Joi.any(),
                      altname: Joi.any(),
                      ask_rat: Joi.any(),
                      spread_rat: Joi.any(),
                      volume_mod: Joi.any(),
                      ask_mod: Joi.any(),
                      volume5: Joi.any(),
            				}
                  }
                }
            });

            server.route({
                  method: 'GET',
                  path: '/exchange/{exchange}',
                  handler: function (request, reply) {

                      db.tickers.distinct('pair',{
                          exchange: request.params.exchange
                      }, (err, doc) => {

                          if (err) {
                              return reply(Boom.wrap(err, 'Internal MongoDB error'));
                          }

                          if (!doc) {
                              return reply(Boom.notFound());
                          }

                          reply(doc);
                      });

                  }
             });

             server.route({
                   method: 'GET',
                   path: '/tickers/{exchange}/{pair}',
                   handler: function (request, reply) {

                       db.tickers.find({
                           exchange: request.params.exchange,
                           pair: request.params.pair
                       }).sort({insert_date: -1}, (err, doc) => {

                           if (err) {
                               return reply(Boom.wrap(err, 'Internal MongoDB error'));
                           }

                           if (!doc) {
                               return reply(Boom.notFound());
                           }

                           reply(doc);
                       });

                   }
              });
              server.route({
                    method: 'GET',
                    path: '/ticker/{exchange}/{pair}',
                    handler: function (request, reply) {

                        db.tickers.find({
                            exchange: request.params.exchange,
                            pair: request.params.pair
                        }).limit(1).sort({insert_date: -1}, (err, doc) => {

                            if (err) {
                                return reply(Boom.wrap(err, 'Internal MongoDB error'));
                            }

                            if (!doc) {
                                return reply(Boom.notFound());
                            }

                            reply(doc);
                        });

                    }
               });
               //SIGNALS
               //SIGNALS

               server.route({
                 method: 'POST',
                 path: '/signals',
                 handler: function (request, reply) {

                     const book = request.payload;

                     db.signals.save(book, (err, result) => {

                         if (err) {
                             return reply(Boom.wrap(err, 'Internal MongoDB error'));
                         }

                         reply(book);
                     });
                 },
                 config: {
                     validate: {
                         payload: {
                            pair: Joi.any(),
                            exchange: Joi.any(),
                            candle_1: Joi.any(),
                            average_volume: Joi.any(),
                            volume: Joi.any(),
                            signal: Joi.any(),
                            insert_date: Joi.number().integer(),
                         	}
                        }
                      }
                });


                server.route({
                      method: 'GET',
                      path: '/signals/{exchange}',
                      handler: function (request, reply) {

                          db.signals.distinct('pair',{
                              exchange: request.params.exchange
                          }, (err, doc) => {

                              if (err) {
                                  return reply(Boom.wrap(err, 'Internal MongoDB error'));
                              }

                              if (!doc) {
                                  return reply(Boom.notFound());
                              }

                              reply(doc);
                          });

                    }
               });


               server.route({
                      method: 'GET',
                      path: '/signals/{exchange}/{pair}',
                      handler: function (request, reply) {

                          db.signals.find({
                              exchange: request.params.exchange,
                              pair: request.params.pair
                          }).sort({insert_date: -1}, (err, doc) => {

                              if (err) {
                                  return reply(Boom.wrap(err, 'Internal MongoDB error'));
                              }

                              if (!doc) {
                                  return reply(Boom.notFound());
                              }

                              reply(doc);
                          });

                      }
                 });

                 server.route({
                       method: 'GET',
                       path: '/signal/{exchange}/{pair}',
                       handler: function (request, reply) {

                           db.signals.find({
                               exchange: request.params.exchange,
                               pair: request.params.pair
                           }).limit(1).sort({insert_date: -1}, (err, doc) => {

                               if (err) {
                                   return reply(Boom.wrap(err, 'Internal MongoDB error'));
                               }

                               if (!doc) {
                                   return reply(Boom.notFound());
                               }

                               reply(doc);
                           });

                     }
                });

              //CANDIDATES

               server.route({
                     method: 'POST',
                     path: '/candidates',
                     handler: function (request, reply) {


                         const book = request.payload;


                         db.candidates.save(book, (err, result) => {

                             if (err) {
                                 return reply(Boom.wrap(err, 'Internal MongoDB error'));
                             }

                             reply(book);
                         });
                     },
                     config: {
                         validate: {
                             payload: {
                                 ask_result: Joi.array(),
                                 ask_dynamic: Joi.array(),
                                 ask_scolar: Joi.array(),
                                 spread_dynamic: Joi.array(),
                                 spread_result: Joi.array(),
                                 spread_scolar: Joi.array(),
                                 total_points : Joi.number().integer(),
                                 pair: Joi.any(),
                                 exchange: Joi.any(),
                                 insert_date: Joi.number().integer(),
                                 status: Joi.any(),
                               }
                             }
                           }
                       });
                       server.route({
                             method: 'POST',
                             path: '/candidates_remove',
                             handler: function (request, reply) {

                                 const login = request.payload.login
                                 var xhour =  Math.floor(Date.now() / 1000) - 3600*0.5;
                                 xhour = xhour.toString();

                                 if(login=='123'){
                                   db.tickers.remove({insert_date: {$lt: xhour}}, (err, result) => {

                                       if (err) {
                                           return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                       }


                                     });
                                     db.candidate.remove({
                                       insert_date: {$lt: xhour},
                                       statusstatus: 'candidate',
                                     }, (err, result) => {

                                         if (err) {
                                             return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                         }

                                           reply('{"db" : '+xhour+'}');
                                       });


                                 }


                             },
                             config: {
                                 validate: {
                                     payload: {
                                         login: Joi.any(),
                                       }
                                     }
                                   }
                               });
                       server.route({
                           method: 'GET',
                           path: '/candidates',
                           handler: function (request, reply) {

                               db.candidates.find((err, docs) => {

                                   if (err) {
                                       return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                   }

                                   reply(docs);
                               });

                           }
                       });

                       server.route({
                             method: 'GET',
                             path: '/candidates/current/{exchange}',
                             handler: function (request, reply) {

                                var xhour =  Math.floor(Date.now() / 1000) - 500;
                                //var xhour =  Math.floor(Date.now() / 1000) - 500;
                                db.candidates.find({
                                   exchange: request.params.exchange,
                                   total_points: {$gt: 12},
                                   insert_date: {$gt: xhour},
                                   status: 'candidate',
                                 }).limit(1).sort({total_points: -1}, (err, doc) => {

                                     if (err) {
                                         return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                     }

                                     if (!doc) {
                                         return reply(Boom.notFound());
                                     }

                                     reply(doc);
                                 });

                             }
                        });

                        server.route({
                              method: 'GET',
                              path: '/candidates/status/{status}/{exchange}',
                              handler: function (request, reply) {


                                 db.candidates.find({
                                    exchange: request.params.exchange,
                                    status: request.params.status,
                                  }).limit(100).sort({insert_date: -1}, (err, doc) => {

                                      if (err) {
                                          return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                      }

                                      if (!doc) {
                                          return reply(Boom.notFound());
                                      }

                                      reply(doc);
                                  });

                              }
                         });


                        server.route({
                              method: 'POST',
                              path: '/check_candidate_status/{id}',
                              handler: function (request, reply) {
                      		var ObjectId = require("mongojs").ObjectId;


                      			db.candidates.findAndModify({
                      				query: {_id: ObjectId(request.params.id) },
                      				update: { $set: request.payload },
                      				new: true,
                      				upsert: true,
                      			},  function (err, doc, lastErrorObject) {

                      				 reply(doc);
                      				// doc.tag === 'maintainer'
                      			})
                      			},
                      			config: {
                      				validate: {
                      					payload: Joi.object({
                      						status: Joi.any(),
                                  order_buy_id: Joi.any(),
                                  order_sell_id: Joi.any(),
                                  order_oco_id: Joi.any(),
                                  status_result: Joi.any(),
                                  price: Joi.number(),
                                  bet_result: Joi.number(),
                      					}).required().min(1)
                      				}
                      			}

                          });
////////////////////crypto


    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
