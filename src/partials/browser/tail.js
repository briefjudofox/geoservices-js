function Geoservices(options) {
  this.options = options;

  this.geocode = geocode;
  this.enrich = enrich;
  this.geographyQuery = geographyQuery;
  this.dataCollections = dataCollections;
  this.reports = reports;
  //this.createReport = createReport;
  this.FeatureService = FeatureService;
  this.authenticate = authenticate;
  this.requestHandler = { get: get, post: post };

  var self = this;

  this.geocode.Batch = function (optionalToken) {
    optionalToken = optionalToken || self.token;

    var batch = new geocode.Batch(optionalToken);
    batch.requestHandler = request;

    return batch;
  };


}
  exports.Geoservices = Geoservices;

  return exports;
}));
