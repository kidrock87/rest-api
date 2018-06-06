'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

var fs = require('fs'), request = require('request');
var path = require('path');

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
        method: 'GET',
        path: '/get_index',
        handler: function (request, reply) {
		var itemsPerPage = 10;

			db.index.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });

	server.route({
        method: 'POST',
        path: '/update_index/{id}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;


			db.index.findAndModify({
				query: { index: request.params.id },
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
						index: Joi.string().min(0).max(500000).optional(),
					}).required().min(1)
				}
			}

    });

	server.route({
        method: 'POST',
        path: '/create_fight',
        handler: function (request, reply) {

            const book = request.payload;

            db.fights.save(book, (err, result) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(book);
            });
        },
        config: {
            validate: {
                payload: {
                    winner : Joi.any(),
										event_name: Joi.any(),
										event_date: Joi.any(),
										event_url: Joi.any(),
										method: Joi.any(),
										referee: Joi.any(),
										round: Joi.any(),
										time: Joi.any(),
										opponent: Joi.any(),
									}
					     }
        }
    });

	server.route({
        method: 'POST',
        path: '/fights/{event_name}/{winner}/{opponent}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;


			db.fights.findAndModify({
				query: { event_name: request.params.event_name, winner: request.params.winner, opponent: request.params.opponent },
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
						    winner : Joi.any(),
						    event_name: Joi.any(),
						    event_date: Joi.any(),
						    event_url: Joi.any(),
						    method: Joi.any(),
							referee: Joi.any(),
							round: Joi.any(),
							time: Joi.any(),
							opponent: Joi.any(),

					}).required().min(1)
				}
			}

    });

	server.route({
        method: 'GET',
        path: '/get_fight/{event_url}/{opponent}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;



            db.fights.findOne({
                event_date: request.params.event_date,
				event_name: request.params.event_name,
				opponent: request.params.opponent,
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
        path: '/get_event/{event_name}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;



            db.fights.find({ event_name: request.params.event_name },(err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

				if (!docs) {
                    return reply(Boom.notFound());
                }

                reply(docs);
            });

        }
    });



	server.route({
        method: 'POST',
        path: '/create_fighter',
        handler: function (request, reply) {

            const book = request.payload;

            db.fighters.save(book, (err, result) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(book);
            });
        },
        config: {
            validate: {
                payload: {
                    rus_name: Joi.any(),
					eng_name: Joi.any(),
					birthday: Joi.any(),
					src_name: Joi.any(),
					vmeste_name: Joi.any(),
					img: Joi.any(),
				}
            }
        }
    });






	server.route({
        method: 'GET',
        path: '/get_fighter/{id}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;



            db.fighters.findOne({
                rus_name: request.params.id
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
        path: '/get_all_fighters',
        handler: function (request, reply) {
		var itemsPerPage = 10;

			db.fighters.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });



    server.route({
        method: 'POST',
        path: '/send_plus',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;
        const book = request.payload;
		var news_id = request.payload.news_id;
        var likes_count = request.payload.likes_count;
			db.send_plus.save(book, (err, result) => {

					if (err) {
						return reply(Boom.wrap(err, 'Internal MongoDB error'));
					}



							db.news.update({
							   _id: ObjectId(news_id)
							}, {
								$set: {'likes_count': likes_count}
							}, function (err, result) {

								if (err) {
									return reply(Boom.wrap(err, 'Internal MongoDB error'));
								}

								if (result.n === 0) {
									return reply(Boom.notFound());
								}

								reply().code(204);
							});






					reply(book);
            });
        },
        config: {
            validate: {
                payload: {

					user_id: Joi.any(),
					likes_count: Joi.any(),
					news_id: Joi.any()


				}
            }
        }
    });



	server.route({
        method: 'POST',
        path: '/check_sn_token/{id}',
        handler: function (request, reply) {




            db.token.findOne({
                sn: request.params.id
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
        method: 'POST',
        path: '/update_token/{id}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;


			db.token.findAndModify({
				query: { sn: request.params.id },
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
						token: Joi.string().min(0).max(500000).optional(),
						insert_date: Joi.string().min(0).max(500000).optional(),

					}).required().min(1)
				}
			}

    });




	server.route({
        method: 'GET',
        path: '/check_sn_publ/{id}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;
		var sn_id = request.params.id;
		var query = {};

		if (sn_id == 'in_tlgrm'){ query['in_tlgrm'] = '0';}
		else if (sn_id == 'in_vk'){ query['in_vk'] = '0';}
		else if (sn_id == 'in_fb'){ query['in_fb'] = '0';}
		else if (sn_id == 'in_ig'){ query['in_ig'] = '0';}

            db.news.findOne(query, (err, doc) => {

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
        path: '/update_sn/{id}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;
		var sn_id = request.payload.news_id;
		var sn_type = request.params.id;
		var obj = {};

		if(sn_type == "in_tlgrm"){ obj["in_tlgrm"] = "1";}
		else if (sn_type == "in_vk"){ obj["in_vk"] = "1";}
		else if (sn_type == "in_fb"){ obj["in_fb"] = "1";}
		else if (sn_type == "in_ig"){ obj["in_ig"] = "1";}

             db.news.update({
               _id: ObjectId(sn_id)
            }, {
                $set: obj
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
						news_id: Joi.string().min(0).max(500000).optional(),
					}).required().min(1)
				}
			}


    });


	server.route({
        method: 'GET',
        path: '/check_user/{id}/{sn}',
        handler: function (request, reply) {
		var ObjectId = require("mongojs").ObjectId;



            db.users.findOne({
				user_id: request.params.id,
                sn: request.params.sn
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
        method: 'POST',
        path: '/create_user',
        handler: function (request, reply) {

            const book = request.payload;

            db.users.save(book, (err, result) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(book);
            });
        },
        config: {
            validate: {
                payload: {

					name: Joi.any(),
					img: Joi.any(),
					user_id: Joi.any(),
					sn: Joi.any(),

				}
            }
        }
    });





	server.route({
        method: 'POST',
        path: '/check_news',
        handler: function (request, reply) {



		var sitelink = request.payload.sitelink;


			    db.news.find({'sitelink': sitelink}, (err, docs) => {

					if (err) {
						return reply(Boom.wrap(err, 'Internal MongoDB error'));
					}

					reply(docs);
				});





			},
			config: {
				validate: {
					payload: Joi.object({
						sitelink: Joi.any(),

					}).required().min(1)
				}
			}


    });

	server.route({
        method: 'POST',
        path: '/news_create',
        handler: function (request, reply) {

            const book = request.payload;

            db.news.save(book, (err, result) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(book);
            });
        },
        config: {
            validate: {
                payload: {

					sitelink: Joi.any(),
					insert_date: Joi.any(),
					head: Joi.any(),
					content: Joi.any(),
					tags: Joi.array(),
					img: Joi.any(),
					status: Joi.any(),
					news_category: Joi.any(),
					in_tlgrm: Joi.any(),
					in_vk: Joi.any(),
					in_ig: Joi.any(),
					in_fb: Joi.any(),
					in_ig: Joi.any(),
					likes_count: Joi.any(),
				}
            }
        }
    });

		server.route({
					method: 'POST',
					path: '/news',
					handler: function (request, reply) {

			var pageNum = request.payload.round;
			var news_type = request.payload.news_type;
			var news_category = request.payload.news_category;
			var itemsPerPage = 10;
			var slack = '';
			if(news_type != "allnews"){

						db.news.find({'site': news_type, 'news_category' : news_category}).limit(itemsPerPage).skip(itemsPerPage * (pageNum-1)).sort({_id: -1}, (err, docs) => {

						if (err) {
							return reply(Boom.wrap(err, 'Internal MongoDB error'));
						}

						reply(docs);
					});

			}
			else{
				db.news.find({'news_category' : news_category}).limit(itemsPerPage).skip(itemsPerPage * (pageNum-1)).sort({_id: -1}, (err, docs) => {

						if (err) {
							return reply(Boom.wrap(err, 'Internal MongoDB error'));
						}

						reply(docs);
					});
			}



				},
				config: {
					validate: {
						payload: Joi.object({
							round: Joi.any(),
							news_type: Joi.any(),
							news_category: Joi.any(),
						}).required().min(1)
					}
				}


			});

		server.route({
					method: 'GET',
					path: '/get_news_item/{id}',
					handler: function (request, reply) {
			var ObjectId = require("mongojs").ObjectId;



							db.news.findOne({
									_id: ObjectId(request.params.id)
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
        path: '/news/{round}',
        handler: function (request, reply) {

      var pageNum = request.params.round;
			var itemsPerPage = 10;
			var site = request.params.site;
			if (typeof site !== 'undefined') {
				console.log(site);
			}else{
				db.news.find().limit(itemsPerPage).skip(itemsPerPage * (pageNum-1)).sort({_id: -1}, (err, docs) => {

					if (err) {
						return reply(Boom.wrap(err, 'Internal MongoDB error'));
					}

					reply(docs);
				});
			}
        }
    });


		server.route({
 							 method: 'GET',
 							 path: '/news_by_tags/{tag_name}/{round}',
 							 handler: function (request, reply) {
 							 var tag_name =request.params.tag_name;
							 var pageNum = request.params.round;
							 var itemsPerPage = 10;
 									db.news.find({
 										tags: {$elemMatch: {title: tag_name}}
 									}).limit(itemsPerPage).skip(itemsPerPage * (pageNum-1)).sort({insert_date: -1},  function (err, doc) {

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
	        path: '/get_sites/{news_category}',
	        handler: function (request, reply) {
								var news_category = request.params.news_category;
								db.news.aggregate({$unwind : "$tags"},{$match : {"tags.type" : news_category}},{$group: {_id :"$tags.title"}},(err, docs) => {

							  if (err) {
							 	 return reply(Boom.wrap(err, 'Internal MongoDB error'));
							  }

							  reply(docs);
							 });

	        }
		})



    return next();
};

exports.register.attributes = {
    name: 'routes-books'
};
