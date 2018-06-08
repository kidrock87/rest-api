'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
var fs = require('fs');
var path = require('path');
const axios = require('axios');

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
          path: '/check_login',
          handler: function (request, reply) {
          var login = request.payload.login;
          var password = request.payload.password;
              db.login.findOne({
                  login: login,
                  password: password
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
    						login: Joi.any(),
                password: Joi.any(),
    					}).required().min(1)
            }
    				}
      });

    server.route({
          method: 'POST',
          path: '/login',
          handler: function (request, reply) {
          const book = request.payload;
             db.login.save(book, (err, result) => {

                  if (err) {
                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
                  }

                  reply(book);
              });
          },
          config: {
              validate: {
                  payload: {
                      login : Joi.any(),
            					password: Joi.any(),
            					}
                  }
                }
      });

      server.route({
            method: 'POST',
            path: '/save_images',
            handler: function (request, reply) {
						const book = request.payload;

	    			var file_path = path.extname('index.html')
	    			var base64Data = request.payload.id;
	    			base64Data = base64Data.replace(/^data:image\/png;base64,/, "");
	          var image_name = Date.now();
						var i_name = image_name+'.png';
	          image_name = '/home/files/files/'+image_name+'.png';

						var bbb = [{
							img: i_name
						}]


						require("fs").writeFile(image_name, base64Data, 'base64', function(err) {
								reply(bbb);
						 });
    	    },
    		config: {
                validate: {
                    payload: {
														 id: Joi.any(),
                    }
                }
            }
      });

			server.route({
            method: 'POST',
            path: '/save_news',
            handler: function (request, reply) {
						const book = request.payload;




						var title = request.payload.title;
						var content = request.payload.content;
						var tags = request.payload.tags;
						var insert_date = request.payload.insert_date;
						var img = request.payload.img;
						var post_url = request.payload.post_url

						var bbb = [{
							title: title,
							content: content,
							insert_date: insert_date,
							tags: tags,
							img: img,
							post_url: post_url
						}]

						Object.keys(tags).map(function(keyName, keyIndex) {
		          var tag = tags[keyIndex]['title'];
		          axios.post('http://188.226.197.80:3001/check_tag', {id: tag})
		            .then(function (response) {
		              console.log(response);
		            })
		            .catch(function (error) {
		              console.log(error)
		          })

		        })


								db.news.save(bbb, (err, result) => {
										 if (err) {
												 return reply(Boom.wrap(err, 'Internal MongoDB error'));
										 }
				 							reply(book);
								 });

    	    },
    		config: {
                validate: {
                    payload: {
    					               title: Joi.any(),
														 content: Joi.any(),
														 insert_date: Joi.any(),
														 img: Joi.any(),
														 post_url: Joi.any(),
														 tags: Joi.array()
                    }
                }
            }
      });

      server.route({
                  method: 'GET',
                  path: '/get_news/{limit_var}/{skip_var}',
                  handler: function (request, reply) {
                  var limit_var = parseInt(request.params.limit_var);
                  var skip_var = parseInt(request.params.skip_var);


                     db.news.find({}).limit(limit_var).skip(skip_var).sort({insert_date: -1}, (err, doc) => {
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
                   path: '/news_by_tags/{tag_name}',
                   handler: function (request, reply) {
                   var tag_name =request.params.tag_name;
									 		db.news.find({

												tags: {$elemMatch: {title: tag_name}}
											}).sort({insert_date: -1},  function (err, doc) {

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
 		        path: '/tags/{tag}',
 		        handler: function (request, reply) {
							var sss = request.params.tag;

							db.tags.find({'title' :  new RegExp(sss, 'i')} , (err, doc) => {

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
			        path: '/news/{id}',
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
								method: 'POST',
								path: '/update_news/{id}',
								handler: function (request, reply) {
						var ObjectId = require("mongojs").ObjectId;


								var title = request.payload.title;
							  var content = request.payload.content;
								var tags = request.payload.tags;
								var img = request.payload.img;
								var post_url = request.payload.post_url;


								if(img == '-'){
										var bbb = [{
											title: title,
											content: content,
											tags: tags,
											post_url: post_url
										}]
								}else{
										var bbb = [{
											title: title,
											img: img,
											content: content,
											tags: tags,
											post_url: post_url
										}]
								}

							db.news.findAndModify({
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
										title: Joi.any(),
										content: Joi.any(),
										img: Joi.any(),
										tags: Joi.array(),
										post_url: Joi.any(),
									}).required().min(1)
								}
							}

				});

				server.route({
		          method: 'POST',
		          path: '/check_tag',
		          handler: function (request, reply) {
		          const tag = request.payload.id;
		              db.tags.findOne({
										title: tag
		              }, (err, doc) => {
		                  if (err) {
		                      return reply(Boom.wrap(err, 'Internal MongoDB error'));
		                  }
		                  if (!doc) {
														var bbb = [{
															title: tag
														}]
														db.tags.save(bbb, (err, result) => {
																if (err) {
																		return reply(Boom.wrap(err, 'Internal MongoDB error'));
																}
																 reply(book);
														});
		                  }
		                  reply(doc);
		              });
		          },
		          config: {
			    				validate: {
			    					payload: Joi.object({
			    						id: Joi.any(),
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
