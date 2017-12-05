var request = require('request');

module.exports = function (app) {
    debugger;
    app.get('/api/data/', function (req, res) {

      var resp = [];

      var options = {
            url: 'http://localhost:8080/find',
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
             },
            json: true,
            body: {
              "query": {
                  "query": {
                      "match": {
                          "title": "Germany"
              }
                  }
              },
                'wiki': [
                  'simplewiki'
                ]
             }
          }

        //res.send('{"hello":"world"}');
        console.log('hello world call');
        var req = request(options, function (error, response, body) {
          // console.log('error:', error); // Print the error if one occurred
          // console.log('statusCode:', response && response.statusCode); // Print  the response status code if a response was received
          // console.log('body:', body); // Print the HTML for the Google homepage.
          // console.log(body);
          res.send(body);
        });
        // console.log(req);
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        debugger;
        console.log('yeahhh');
        res.sendFile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
