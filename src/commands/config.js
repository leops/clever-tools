var path = require("path");

var _ = require("lodash");
var cliparse = require("cliparse");
var Bacon = require("baconjs");

var AppConfig = require("../models/app_configuration.js");
var Application = require("../models/application.js");

var Logger = require("../logger.js");

var configModule = module.exports;



configModule.set = function(api, params) {
  var alias = params.options.alias;
  var key = params.args[0];
  var value = params.args[1];

  var modifiedKey = Application.configKeys[key];
  var keys = Object.keys(Application.configKeys);

  var s_appData = AppConfig.getAppData(alias);
  var s_result = s_appData.flatMapLatest(function(app_data) {
    if(!modifiedKey) {
      return Bacon.once(new Bacon.Error("Invalid configuration key. The available settings are " + keys.join(", "))).toProperty();
    } else if(modifiedKey.type === 'boolean' && !(value == 'true' || value == 'false')) {
      return new Bacon.Error("Invalid configuration value, expeced 'true' or 'false'")
    }

    return Application.setConfigItem(api, app_data.app_id, app_data.orga_id, modifiedKey.jsonName || modifiedKey, value);
  });

  s_result.onValue(function() {
    Logger.println("Configuration settings have been updated");
  });
  s_result.onError(Logger.error);
};
