var geocode = require('./lib/geocode'),
  geoenrichment = require('./lib/geoenrichment'),
  featureservice = require('./lib/featureservice'),
  authentication = require('./lib/authentication'),
  request = require('./lib/request');

function Geoservices(options) {
  this.options = options;

  this.geocode = geocode.geocode;
  this.enrich = geoenrichment.enrich;
  this.geographyQuery = geoenrichment.geographyQuery;
  this.dataCollections = geoenrichment.dataCollections;
  this.reports = geoenrichment.reports;
  //this.createReport = geoenrichment.createReport;

  this.FeatureService = featureservice.FeatureService;
  this.authenticate = authentication.authenticate;
  this.requestHandler = request;

  var self = this;

  this.geocode.Batch = function (optionalToken) {
    optionalToken = optionalToken || self.token;

    var batch = new geocode.Batch(optionalToken);
    batch.requestHandler = request;

    return batch;
  };

}

module.exports = exports = Geoservices;
