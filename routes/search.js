var express = require('express');
var router = express.Router();
var request = require('request');
var assert = require('assert');
var mongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;

/* GET search page. */
router.get('/:searchItem', function(req, res, next) {

  var options = {
      url : "https://api.imgur.com/3/gallery/search/top?q=" + req.params.searchItem,
      headers : {
          'Authorization' : 'Client-ID ' + process.env.IMGUR_C_ID
      }
  };
  
  var offset = req.query.offset;
  if (offset !== undefined) {
      request(options, function (err, resp, body) {
          var data = [];

          if (!err && resp.statusCode == 200) { // API call successful
              body = JSON.parse(body);
              var length = body.data.length;
              if (body.data.length >= offset) // Call returned data has more length than offset
                  length = offset;
              for ( var i = 0; i < length; i++ ){
                    data.push({
                          'title' : body.data[i].title,
                          'description' : body.data[i].description,
                          'type' : body.data[i].type,
                          'link' : body.data[i].link
                      });
                }
              res.json(data);
              
              // Store search data in MongoDB if search was successful
              mongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
                  assert.equal(null, err);
                  console.log('Search connected to mongodb server...');
                  var imageSearchData = db.collection('imageSearchData');
                  
                  imageSearchData.insertOne({
                      'term' : req.params.searchItem,
                      'when' : new Date().toString()
                   }, function(err, doc){
                       if (err){
                           db.close();
                           console.error(err);
                           return;
                       } else {
                           console.log('Insertion successful');
                           db.close();
                       }
                   }); // insertOne
              }); // connect

          } else { // API call failed   
              res.json(JSON.parse(body));
          }
      });
  } else { // offset not specified
      res.json({
          error : 'Bad URL call',
          message : 'Offset not specified correctly. Please refer index page.'
      });
  }

});

module.exports = router;
