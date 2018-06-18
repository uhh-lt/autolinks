module.exports = function() {
  return {
    "connectionString": "mongodb://localhost:27017/xxx-xxx-xxx",
    "apiUrl": process.env.BROKER_URL || 'http://ltdemos.informatik.uni-hamburg.de:8093' || 'http://broker:10010',
    "brokerEndPoint": "services",
    "secret": "REPLACE THIS WITH YOUR OWN SECRET, IT CAN BE ANY STRING"
  }
}
