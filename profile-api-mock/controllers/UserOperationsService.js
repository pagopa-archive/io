'use strict';

exports.createProfile = function(args, res, next) {
  /**
   * CreateProfile
   * Creates a new profile associated to the provided `fiscal_code`.  The new profile will have an initial version of `1`.
   *
   * fiscal_code String 
   * returns profile
   **/
  var examples = {};
  examples['application/json'] = {
  "created_at" : 1.3579000000000001069366817318950779736042022705078125,
  "attributes" : {
    "mobile" : "aeiou",
    "locale" : "aeiou",
    "email" : "aeiou"
  },
  "version" : 1.3579000000000001069366817318950779736042022705078125
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.getProfileLatestVersionForFiscalCode = function(args, res, next) {
  /**
   * GetProfileLatest
   * Returns the attributes for latest version of the profile identified by the provided `fiscal_code`.
   *
   * fiscal_code String 
   * returns inline_response_200
   **/
  var examples = {};
  examples['application/json'] = {
  "created_at" : 1.3579000000000001069366817318950779736042022705078125,
  "attributes" : {
    "mobile" : "aeiou",
    "locale" : "aeiou",
    "email" : "aeiou"
  },
  "version" : 1.3579000000000001069366817318950779736042022705078125
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.getProfileVersionForFiscalCode = function(args, res, next) {
  /**
   * GetProfileVersion
   * Returns the attributes for the profile identified by the provided `fiscal_code` and `version` number.  The first `version` of a profile is `1`
   *
   * fiscal_code String 
   * version BigDecimal 
   * returns inline_response_200
   **/
  var examples = {};
  examples['application/json'] = {
  "created_at" : 1.3579000000000001069366817318950779736042022705078125,
  "attributes" : {
    "mobile" : "aeiou",
    "locale" : "aeiou",
    "email" : "aeiou"
  },
  "version" : 1.3579000000000001069366817318950779736042022705078125
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

exports.updateProfileForFiscalCode = function(args, res, next) {
  /**
   * UpdateProfile
   * Updates one or more attributes of a profile identified by `fiscalCode` and `version`.  On successful update, a new profile version gets created (by incrementing the version number from the previous one).  If the provided `version` is not the latest available version for that profile, the request will fail with a [409 - Conflict](https://httpstatuses.com/409) error, meaning that the profile was concurrently updated (and a new version created) by another client.
   *
   * fiscal_code String 
   * version BigDecimal 
   * body Attributes  (optional)
   * returns profile
   **/
  var examples = {};
  examples['application/json'] = {
  "created_at" : 1.3579000000000001069366817318950779736042022705078125,
  "attributes" : {
    "mobile" : "aeiou",
    "locale" : "aeiou",
    "email" : "aeiou"
  },
  "version" : 1.3579000000000001069366817318950779736042022705078125
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}

