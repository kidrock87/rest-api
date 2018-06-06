var express = require('express');
var app = express();
var request = require('request');
var cookieParser = require('cookie-parser');
var FB = require('fb');


 



app.use(cookieParser());
app.use('/', express.static(__dirname + '/app'));
app.get('/vk_auth', function(req, res){
  var code = req.query.code;
  var sn = 'vk';
	 
	 var options = {
		  url: 'https://oauth.vk.com/access_token?client_id=6090513&client_secret=DJ2ptGEvEy5SiIHVdVvs&redirect_uri=http://mma2day.ru/vk_auth&code='+code,
		  method: 'GET',
	  }
	  request(options, function (error, response, body) {
			var json = JSON.parse(body)
			a_token = json.access_token;
			uids = json.user_id;
			 //проверка в бд есть или нет
			   var options = {
				url: 'http://188.226.197.80:7777/check_user/'+uids+'/vk',
				method: 'GET',
			   }
				request(options, function (error, response, body12) {console.log(response.statusCode)
					if (!error && response.statusCode == 200) {
						 var json12 = JSON.parse(body12);
						 user_id = json12.user_id;
						 
						  var jsonValue = JSON.stringify({
							'user_id': uids,
							'sn' : sn
						  });
						 
						 res.cookie('user_id' , jsonValue).redirect('http://mma2day.ru')
						
						//если есть то запись в куки сессии
						//редирект
					}
					else if (!error && response.statusCode == 404) {
						//если нет, то 
						//запись в бд нового пользователя
						//и запись в локалсторадж сессии
						var options = {
							url: 'https://api.vk.com/method/users.get?access_token='+a_token+'&fields=uid,first_name,last_name,screen_name,sex,bdate,photo_100&uids='+uids,
							method: 'GET'							
						}
						request(options, function (error, response, body13) {console.log(response.statusCode)
							var json13 = JSON.parse(body13);
							var name = json13.response[0].first_name+' '+json13.response[0].last_name;
							var img = json13.response[0].photo_100;
							console.log(img);
							console.log(name);
							
							var options = {
								url: 'http://188.226.197.80:7777/create_user',
								form: {'user_id': uids, 'name' : name, 'img' : img, 'sn' : sn},
								method: 'post'							
							}
							request(options, function (error, response, body14) {console.log(response.statusCode)
								if (!error && response.statusCode == 200) {
									  var jsonValue = JSON.stringify({
										'user_id': uids,
										'sn' : sn
									  });
									 
									 res.cookie('user_id' , jsonValue).redirect('http://mma2day.ru')
								}
							})
							
						})
							
					}
			    })
			 
			 
			 
			 
			 
			 
			 
			 /*
			 var options= {
				  url: 'https://api.vk.com/method/users.get?access_token='+a_token+'&fields=uid,first_name,last_name,screen_name,sex,bdate,photo_200_orig&uids='+uids,
				  method: 'GET',
			  }
			 request(options, function (error, response, body) {
					res.send(body);						
			 })	
			*/
	  })
	  
	  
	  
	  
});

app.get('*', function(req, res) {
    res.sendfile('./app/index.html', {root: '.'}); 
});

app.get('/fb_auth', function(req, res){
	
	FB.getLoginStatus(function(response) {
		res.send(statusChangeCallback(response));
	});
	
})	
app.listen(80, function() { console.log('listening 80')});