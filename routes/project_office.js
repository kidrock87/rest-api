'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
var fs = require('fs');
var path = require('path');
const axios = require('axios');
var request = require('request');


var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
	console.log('content-type:', res.headers['content-type']);
	console.log('content-length:', res.headers['content-length']);
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

exports.register = function (server, options, next) {

    const db = server.app.db;


		server.route({
						method: 'POST',
						path: '/classificators',
						handler: function (request, reply) {


						db.classificator.find((err, docs) => {

										if (err) {
												return reply(Boom.wrap(err, 'Internal MongoDB error'));
										}

										reply(docs);
								});

						}
		});

		server.route({
					method: 'POST',
					path: '/classificators/{id}',
					handler: function (request, reply) {
					var ObjectId = require("mongojs").ObjectId;
							db.classificator.find({
									_id: ObjectId(request.params.id)
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
          method: 'POST',
          path: '/create_classificator',
          handler: function (request, reply) {

              const book = request.payload;

              db.classificator.save(book, (err, result) => {

                  if (err) {
                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
                  }

                  reply(book);
              });
          },
          config: {
              validate: {
                  payload: {
                      name : Joi.any(),
            					weight: Joi.any(),
											published: Joi.any(),
            				}
                  }
                }
    });



		server.route({
					method: 'POST',
					path: '/edit_classificator/{id}',
					handler: function (request, reply) {
					var ObjectId = require("mongojs").ObjectId;
					const book = request.payload;

						db.classificator.update({
							 _id: ObjectId(request.params.id)
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
									name: Joi.any().optional(),
									weight: Joi.any().optional(),
									published: Joi.any().optional()
								}).required().min(1)
							}
						}
			});

/*
			server.route({
						method: 'POST',
						path: '/distinct_classificator',
						handler: function (request, reply) {


							db.classificator.distinct('name', {}, function(err, results){
									reply(results);
							});




						}
			 });
*/

			server.route({
						method: 'POST',
						path: '/remove_classificator/{id}',
						handler: function (request, reply) {
						var ObjectId = require("mongojs").ObjectId;


							db.classificator.remove({_id: ObjectId(request.params.id)}, function(err, docs) {  //db.users.remove({"_id": ObjectId("4d512b45cc9374271b02ec4f")});
									if (err) return err;
									console.log(request.params.id);
									reply('{"_id" : '+request.params.id+'}');
							});
						}
			});

////////////////////Проекты
server.route({
			method: 'POST',
			path: '/add_project',
			handler: function (request, reply) {

					const book = request.payload;

					db.projects.save(book, (err, result) => {

							if (err) {
									return reply(Boom.wrap(err, 'Internal MongoDB error'));
							}

							reply(book);
					});
			},
			config: {
					validate: {
							payload: {
									project_name : Joi.any(),
									project_sector: Joi.any(),
									project_site: Joi.any(),
									project_rank: Joi.any(),
									rankings: Joi.any(),
								}
							}
						}
});
server.route({
				method: 'POST',
				path: '/projects',
				handler: function (request, reply) {


				db.projects.find((err, docs) => {

								if (err) {
										return reply(Boom.wrap(err, 'Internal MongoDB error'));
								}

								reply(docs);
						});

				}
});
//////////////////////////////
    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
