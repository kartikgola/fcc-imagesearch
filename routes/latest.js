var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');


/* GET latest listing. */
router.get('/', function (req, res, next) {

  mongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {

    assert.equal(null, err);
    console.log('Latest connected correctly to mongodb...');

    var imageSearchData = db.collection('imageSearchData', function (err, collection) {
      assert.equal(null, err);
      console.log('Collection found');

      // Fetching latest 10 results sorted by date searched
      var cursor = collection.find({}).sort({ 'when': -1 }).limit(10);
      var data = []; // JSON data to return
      cursor.each(function (err, item) {
        assert.equal(null, err);    
        if (item == null) { // cursor is exhausted, empty or closed
          // return the JSON response
          res.json(data);
          console.log('Cursor finished.');
          console.log('Closing db...');
          db.close();
        } else {
          data.push({
            'term': item.term,
            'when': item.when
          });
        }
      }); // each 


    }); // collection
  }); // connect
}); // get

module.exports = router;
