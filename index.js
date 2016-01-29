'use strict';

var wia = require('wia')('');
var SensorTag = require('sensortag');

// Defaults
var MAGNETOMETER_DEFAULT_PERIOD = 2000;
var LUXOMETER_DEFAULT_PERIOD = 2500;
var HUMIDITY_DEFAULT_PERIOD = 2500;
var IR_TEMPERATURE_DEFAULT_PERIOD = 2500;

var tagOptions = {
  magnetometer: {
    period: 2000
  },
  luxometer: {
    period: 2500
  },
  humidity: {
    period: 2500
  },
  irTemperature: {
    period: 2500
  },
  notifySimpleKey: true
}

function onDiscover(sensorTag) {
  wia.logs.publish({level: "level", message: 'Sensortag discovered.', data:{id: sensorTag.id, type:sensorTag.type}});

  SensorTag.stopDiscoverAll(function() {
  });

  setupSensorTag(sensorTag);
}

function setupSensorTag(sensorTag) {
  sensorTag.connectAndSetUp(function(error) {
    wia.logs.publish({level:"info", message:"connectAndSetUp."});

    sensorTag.on('disconnect', function() {
      wia.logs.publish({level:"info", message:"Sensortag disconnected.", data:{id: sensorTag.id, type:sensorTag.type}});
      SensorTag.discoverAll(onDiscover);
    });

    if (error) {
      wia.logs.publish({level: "error", message: error.toString()});
      SensorTag.discoverAll(onDiscover);
      return;
    }

    if (tagOptions.irTemperature)
      setupIrTemperature(sensorTag);

    if (tagOptions.humidity)
      setupHumidity(sensorTag);

    if (tagOptions.luxometer)
      setupLuxometer(sensorTag);

    if (tagOptions.magnetometer)
      setupMagnetometer(sensorTag);

    if (tagOptions.simpleKey)
      setupSimpleKey(sensorTag)
  });
}

function setupIrTemperature(sensorTag) {
  sensorTag.enableIrTemperature(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable ir temperature.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setIrTemperaturePeriod(tagOptions.irTemperature.period || IR_TEMPERATURE_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting ir temperature period.", data: {error:error.toString(), period: tagOptions.irTemperature.period || IR_TEMPERATURE_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set ir temperature period.", data: {period: tagOptions.irTemperature.period || IR_TEMPERATURE_DEFAULT_PERIOD}})
    });
    sensorTag.notifyIrTemperature(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify ir temperature."});
        return;
      }
    });
    sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature) {
      wia.events.publish({name: "objectTemperature", data: objectTemperature});
      wia.events.publish({name: "ambientTemperature", data: ambientTemperature});
    });
  });
}

function setupHumidity(sensorTag) {
  sensorTag.enableHumidity(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable humidity.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setHumidityPeriod(tagOptions.humidity.period || HUMIDITY_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting humidity period.", data: {error:error.toString(), period: tagOptions.humidity.period || HUMIDITY_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set humidity period.", data: {period: tagOptions.humidity.period || HUMIDITY_DEFAULT_PERIOD}})
    });
    sensorTag.notifyHumidity(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify humidity."});
        return;
      }
    });
    sensorTag.on('humidityChange', function(temperature, humidity) {
      wia.events.publish({name: "humidityTemperature", data: temperature});
      wia.events.publish({name: "humidity", data: humidity});
    });
  });
}

function setupLuxometer(sensorTag) {
  sensorTag.enableLuxometer(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable luxometer.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setLuxometerPeriod(tagOptions.luxometer.period || LUXOMETER_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting luxometer period.", data: {error:error.toString(), period: tagOptions.luxometer.period || LUXOMETER_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set luxometer period.", data: {period: tagOptions.luxometer.period || LUXOMETER_DEFAULT_PERIOD}})
    });
    sensorTag.notifyLuxometer(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify luxometer."});
        return;
      }
    });
    sensorTag.on('luxometerChange', function(lux) {
      wia.events.publish({name: "lux", data: lux});
    });
  });
}

function setupMagnetometer(sensorTag) {
  sensorTag.enableMagnetometer(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable magnetometer.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setMagnetometerPeriod(tagOptions.magnetometer.period || MAGNETOMETER_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting magnetometer period.", data: {error:error.toString(), period: tagOptions.magnetometer.period || MAGNETOMETER_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set magnetometer period.", data: {period: tagOptions.magnetometer.period || MAGNETOMETER_DEFAULT_PERIOD}})
    });
    sensorTag.notifyMagnetometer(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify magnetometer."});
        return;
      }
    });
    sensorTag.on('magnetometerChange', function(x, y, z) {
      wia.events.publish({name: "magnetometer", data: {x:x, y:y, z:z}});
    });
  });
}

function setupSimpleKey(sensorTag) {
  sensorTag.notifySimpleKey(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Error setting notify simple key.", data: {error:error.toString()}});
      return;
    }

    wia.logs.publish({level: "info", message: "simpleKeyChange enabled."})

    sensorTag.on('simpleKeyChange', function(left, right, reedRelay) {
      if (left)
        wia.logs.publish({level:"info", message:"Left key pressed."});
      if (right)
        wia.logs.publish({level:"info", message:"Right key pressed."});
    });
  });
}

SensorTag.discoverAll(onDiscover);
