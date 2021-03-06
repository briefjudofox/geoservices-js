var querystring = require('querystring');

var stringify = querystring.stringify;

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


function get (url, callback) {
  var httpRequest = new XMLHttpRequest();

  function requestHandler () {
    if (this.readyState === this.DONE) {
      if (this.status === 200) {
        try {
          var response = JSON.parse(this.responseText);
          callback(null, response);
        } catch (err) {
          callback("Invalid JSON on response: " + this.responseText);
        }
      }
    }
  }

  httpRequest.onreadystatechange = requestHandler;

  httpRequest.open("GET", url);
  if (httpRequest.setDisableHeaderCheck !== undefined) {
    httpRequest.setDisableHeaderCheck(true);
    httpRequest.setRequestHeader("Referer", "geoservices-js");
  }
  httpRequest.send(null);
}

function post (url, data, callback) {
  var httpRequest = new XMLHttpRequest();

  function requestHandler () {
    if (this.readyState === this.DONE) {
      if (this.status === 200) {
        try {
          var response = JSON.parse(this.responseText);
          callback(null, response);
        } catch (err) {
          callback("Invalid JSON on response: " + this.responseText);
        }
      }
    }
  }

  httpRequest.onreadystatechange = requestHandler;

  httpRequest.open("POST", url);
  if (httpRequest.setDisableHeaderCheck !== undefined) {
    httpRequest.setDisableHeaderCheck(true);
    httpRequest.setRequestHeader("Referer", "geoservices-js");
  }
  
  httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  httpRequest.send(stringify(data));
}


function GeoEnrichmentService(token, options) {
  this.token = token;
  this.options = options;
  this.requestHandler = { get: get, post: post };
}

function baseUrl(options) {
  var url = 'http://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver';
  //var url = 'http://geoenrich.arcgis.com/arcgis/rest/services/World/MapServer/exts/BAServer'
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

GeoEnrichmentService.prototype.issueRequest = function (endPoint, parameters, cb, method) {
  var current = new Date();

  if (!this.token || !this.token.token ||
    this.token.expires < current) {
    _internalCallback("Valid authentication token is required", "Valid authentication token is required", cb);
    return;
  }

  parameters.f = parameters.f || 'json';
  parameters.token = this.token.token;

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
  var url = baseUrl(this.options);
  url += '/' + endPoint;

  if (!method || method.toLowerCase() === "get") {
    url += ('?' + stringify(parameters));

    this.requestHandler.get(url, function (err, data) {
      _internalCallback(err, data, cb);
    });
  } else {
    //assuming method is POST
    this.requestHandler.post(url, parameters, function (err, data) {
      _internalCallback(err, data, cb);
    });
  }
};

// issues an enrich request on the geoenrichment service
GeoEnrichmentService.prototype.enrich = function (parameters, callback) {
  this.issueRequest('GeoEnrichment/enrich', parameters, callback, 'post');
};

// issues a Reports request on the geoenrichment service
GeoEnrichmentService.prototype.reports = function (parameters, callback) {
  var endpoint = 'GeoEnrichment/Reports';
  if (parameters && parameters.country){
    endpoint += ('/' + parameters.country);
    delete parameters.country;
  }
  this.issueRequest(endpoint, parameters, callback, 'get');
 };

// issues a createReport request on the geoenrichment service
//@TODO: needs a binary response handler
/*GeoEnrichmentService.prototype.createReport = function (parameters, callback) {
 parameters.f = 'bin';
 this.issueRequest('GeoEnrichment/CreateReport', parameters, callback, 'post');
 };*/

// issues a dataCollections request on the geoenrichment service
GeoEnrichmentService.prototype.dataCollections = function (parameters, callback) {
  var endpoint = 'GeoEnrichment/dataCollections';
  if (parameters && parameters.country) endpoint += ('/' + parameters.country);
  this.issueRequest(endpoint, parameters, callback, 'get');
};

// issues a geographyQuery request on the geoenrichment service
GeoEnrichmentService.prototype.geographyQuery = function (parameters, callback) {
  this.issueRequest('StandardGeographyQuery/execute', parameters, callback, 'get');
};
exports.GeoEnrichmentService = GeoEnrichmentService;