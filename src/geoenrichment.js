
function geoEnrichBaseUrl(options) {
  var url = 'http://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver';
  if (options && options.geoEnrichUrl) url = options.geoEnrichUrl;
  return url;
}

// internal callback wrapper for err logic
function _internalCallback(err, data, cb) {
  if (cb) {
    // check for an error passed in this response
    if (data && data.error) {
      cb(data.error, null);
    } else {
      cb(err, data);
    }
  }
}

function issueGeoEnrichmentRequest(endPoint, parameters, cb, method, rh) {
  var current = new Date();
  if (!parameters.token || !parameters.token.token ||
    parameters.token.expires < current) {
    _internalCallback("Valid authentication token is required", "Valid authentication token is required", cb);
    return;
  }
  parameters.f = parameters.f || 'json';
  parameters.token = parameters.token.token;

  //Object or Array Parameters for GeoEnrichmentServices
  var objParamKeys = ['analysisVariables',
    'dataCollections',
    'geographyIDs',
    'geographyLayers',
    'geographyQuery',
    'intersectingGeographies',
    'reportFields',
    'studyAreas',
    'studyAreasOptions',
    'subGeographyLayer',
    'subGeographyQuery',
    'useData'
  ];

  for (var i = 0; i < objParamKeys.length; i++) {
    if (parameters.hasOwnProperty(objParamKeys[i]))
      parameters[objParamKeys[i]] = JSON.stringify(parameters[objParamKeys[i]]);
  }

  //build the request url
  var url = geoEnrichBaseUrl(this.options);
  url += '/' + endPoint;

  if (!method || method.toLowerCase() === "get") {
    url += ('?' + stringify(parameters));
    rh.get(url, function (err, data) {
      _internalCallback(err, data, cb);
    });
  } else {
    //assuming method is POST
    rh.post(url, parameters, function (err, data) {
      _internalCallback(err, data, cb);
    });
  }
}

// issues an enrich request on the geoenrichment service
function enrich(parameters, callback) {
  parameters.token = parameters.token || this.token || this.options.token;
  issueGeoEnrichmentRequest('GeoEnrichment/enrich', parameters, callback, 'post',this.requestHandler);
}

// issues a Reports request on the geoenrichment service
function reports(parameters, callback) {
  parameters.token = parameters.token || this.token || this.options.token;
  var endpoint = 'GeoEnrichment/Reports';
  if (parameters && parameters.country){
    endpoint += ('/' + parameters.country);
    delete parameters.country;
  }
  issueGeoEnrichmentRequest(endpoint, parameters, callback, 'get',this.requestHandler);
 }

// issues a createReport request on the geoenrichment service
//@TODO: needs a binary response handler
/*function createReport(parameters, callback) {
 parameters.token = parameters.token || this.token || this.options.token;
 parameters.f = 'bin';
 issueGeoEnrichmentRequest('GeoEnrichment/CreateReport', parameters, callback, 'post',this.requestHandler);
 }*/

// issues a dataCollections request on the geoenrichment service
function dataCollections(parameters, callback) {
  parameters.token = parameters.token || this.token || this.options.token;
  var endpoint = 'GeoEnrichment/dataCollections';
  if (parameters && parameters.country) endpoint += ('/' + parameters.country);
  issueGeoEnrichmentRequest(endpoint, parameters, callback, 'get',this.requestHandler);
}

// issues a geographyQuery request on the geoenrichment service
function geographyQuery(parameters, callback) {
  parameters.token = parameters.token || this.token || this.options.token;
  issueGeoEnrichmentRequest('StandardGeographyQuery/execute', parameters, callback, 'get',this.requestHandler);
}

enrich.requestHandler = { get: get, post: post };
reports.requestHandler = { get: get, post: post };
//createReport.requestHandler = { get: get, post: post };
dataCollections.requestHandler = { get: get, post: post };
geographyQuery.requestHandler = { get: get, post: post };
