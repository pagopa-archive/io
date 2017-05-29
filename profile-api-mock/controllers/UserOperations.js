'use strict';

var url = require('url');

var UserOperations = require('./UserOperationsService');

module.exports.createProfile = function createProfile (req, res, next) {
  UserOperations.createProfile(req.swagger.params, res, next);
};

module.exports.getProfileLatestVersionForFiscalCode = function getProfileLatestVersionForFiscalCode (req, res, next) {
  UserOperations.getProfileLatestVersionForFiscalCode(req.swagger.params, res, next);
};

module.exports.getProfileVersionForFiscalCode = function getProfileVersionForFiscalCode (req, res, next) {
  UserOperations.getProfileVersionForFiscalCode(req.swagger.params, res, next);
};

module.exports.updateProfileForFiscalCode = function updateProfileForFiscalCode (req, res, next) {
  UserOperations.updateProfileForFiscalCode(req.swagger.params, res, next);
};
