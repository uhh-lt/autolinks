module.exports = function (app) {
  // App routes
  app.use('/login', require('../controllers/loginController'));
  app.use('/register', require('../controllers/registerController'));
  app.use('/app', require('../controllers/appController'));

  // Autolinks Broker Service
  app.use('/api/service', require('./service/serviceEndpoint'));
  app.use('/api/nlp', require('./nlp/nlpEndpoint'));

  app.get('/', function (req, res) {
      res.redirect('/app'); // load the single view file (angular will handle the page changes on the front-end)
  });

};
