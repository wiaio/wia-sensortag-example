'use strict';

var wia = require('wia')('YOUR_DEVICE_TOKEN');
var SensorTag = require('sensortag');

// Defaults
var MAGNETOMETER_DEFAULT_PERIOD = 1000;
var LUXOMETER_DEFAULT_PERIOD = 2250;
var HUMIDITY_DEFAULT_PERIOD = 2250;
var IR_TEMPERATURE_DEFAULT_PERIOD = 1000;
var GYROSCOPE_DEFAULT_PERIOD = 1000;
var ACCELEROMETER_DEFAULT_PERIOD = 1000;
var BAROMETRIC_PRESSURE_DEFAULT_PERIOD = 1000;

var tagOptions = {
  luxometer: {
    period: 1250
  },
  humidity: {
    period: 2500
  },
  irTemperature: {
    period: 1000
  },
  gyroscope: {
    period: 150
  },
  accelerometer: {
    period: 150
  },
  barometricPressure: {
    period: 1000
  },
  notifySimpleKey: true
}

var SensorTagMap = {};

function onDiscover(sensorTag) {
  wia.logs.publish({level: "info", message: 'Sensortag discovered.', data:{id: sensorTag.id, type:sensorTag.type}});

  // SensorTag.stopDiscoverAll(function() {
  // });

  setupSensorTag(sensorTag);
}

function setupSensorTag(sensorTag) {
  sensorTag.connectAndSetUp(function(error) {
    wia.logs.publish({level:"info", message:"connectAndSetUp."});

    sensorTag.on('disconnect', function() {
      wia.logs.publish({level:"info", message:"Sensortag disconnected.", data:{id: sensorTag.id, type:sensorTag.type}});
      wia.events.publish({name:"sensorTagStatus", data:{connected:false}});
      if (SensorTagMap[sensorTag.id])
        delete SensorTagMap[sensorTag.id];
      SensorTag.discoverAll(onDiscover);
    });

    if (error) {
      wia.logs.publish({level: "error", message: error.toString()});
      if (SensorTagMap[sensorTag.id])
        delete SensorTagMap[sensorTag.id];
      SensorTag.discoverAll(onDiscover);
      return;
    }

    readSystemData(sensorTag);

    wia.events.publish({name:"sensorTagStatus", data:{connected:true}});

    SensorTagMap[sensorTag.id] = sensorTag;

    if (tagOptions.gyroscope)
      setupGyroscope(sensorTag);

    if (tagOptions.irTemperature)
      setupIrTemperature(sensorTag);

    if (tagOptions.humidity)
      setupHumidity(sensorTag);

    if (tagOptions.luxometer)
      setupLuxometer(sensorTag);

    if (tagOptions.magnetometer)
      setupMagnetometer(sensorTag);

    if (tagOptions.accelerometer)
      setupAccelerometer(sensorTag);

    if (tagOptions.barometricPressure)
      setupBarometricPressure(sensorTag);

    if (tagOptions.simpleKey)
      setupSimpleKey(sensorTag)
  });
}

function readSystemData(sensorTag) {
  sensorTag.readDeviceName(function(error, deviceName) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readDeviceName", data:{deviceName: deviceName}});
  });

  sensorTag.readSystemId(function(error, systemId) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readSystemId", data:{systemId: systemId}});
  });

  sensorTag.readSerialNumber(function(error, serialNumber) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readSerialNumber", data:{serialNumber: serialNumber}});
  });

  sensorTag.readFirmwareRevision(function(error, firmwareRevision) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readFirmwareRevision", data:{firmwareRevision: firmwareRevision}});
  });

  sensorTag.readHardwareRevision(function(error, hardwareRevision) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readHardwareRevision", data:{hardwareRevision: hardwareRevision}});
  });

  sensorTag.readSoftwareRevision(function(error, softwareRevision) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readSoftwareRevision", data:{softwareRevision: softwareRevision}});
  });

  sensorTag.readManufacturerName(function(error, manufacturerName) {
    if (error)
      wia.logs.publish({level:"error", message:error.toString()});
    else
      wia.logs.publish({level:"info", message:"readManufacturerName", data:{manufacturerName: manufacturerName}});
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
      wia.events.publish({name: "humidityTemperature", data: temperature.toFixed(2)});
      wia.events.publish({name: "humidity", data: humidity.toFixed(2)});
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
      wia.events.publish({name: "lux", data: lux || 0});
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
      wia.events.publish({name: "magnetometer", data: {x:x.toFixed(2), y:y.toFixed(2), z:z.toFixed(2)}});
    });
  });
}

function setupGyroscope(sensorTag) {
  sensorTag.enableGyroscope(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable gyroscope.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setGyroscopePeriod(tagOptions.gyroscope.period || GYROSCOPE_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting gyroscope period.", data: {error:error.toString(), period: tagOptions.gyroscope.period || GYROSCOPE_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set gyroscope period.", data: {period: tagOptions.gyroscope.period || GYROSCOPE_DEFAULT_PERIOD}})
    });
    sensorTag.notifyGyroscope(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify gyroscope."});
        return;
      }
    });
    sensorTag.on('gyroscopeChange', function(x, y, z) {
      wia.events.publish({name: "gyroscope", data: {x:x.toFixed(2), y:y.toFixed(2), z:z.toFixed(2)}});
    });
  });
}

function setupAccelerometer(sensorTag) {
  sensorTag.enableAccelerometer(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable accelerometer.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setAccelerometerPeriod(tagOptions.accelerometer.period || ACCELEROMETER_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting accelerometer period.", data: {error:error.toString(), period: tagOptions.accelerometer.period || ACCELEROMETER_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set accelerometer period.", data: {period: tagOptions.accelerometer.period || ACCELEROMETER_DEFAULT_PERIOD}})
    });
    sensorTag.notifyAccelerometer(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify accelerometer."});
        return;
      }
    });
    sensorTag.on('accelerometerChange', function(x, y, z) {
      wia.events.publish({name: "accelerometer", data: {x:x.toFixed(1), y:y.toFixed(1), z:z.toFixed(1)}});
    });
  });
}

function setupBarometricPressure(sensorTag) {
  sensorTag.enableBarometricPressure(function(error) {
    if (error) {
      wia.logs.publish({level: "error", message: "Could not enable barometricPressure.", data: {error:error.toString()}});
      return;
    }
    sensorTag.setBarometricPressurePeriod(tagOptions.barometricPressure.period || BAROMETRIC_PRESSURE_DEFAULT_PERIOD, function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting barometricPressure period.", data: {error:error.toString(), period: tagOptions.barometricPressure.period || BAROMETRIC_PRESSURE_DEFAULT_PERIOD}});
        return;
      }
      wia.logs.publish({level: "info", message: "Set barometricPressure period.", data: {period: tagOptions.barometricPressure.period || BAROMETRIC_PRESSURE_DEFAULT_PERIOD}})
    });
    sensorTag.notifyBarometricPressure(function(error) {
      if (error) {
        wia.logs.publish({level: "error", message: "Error setting notify barometricPressure."});
        return;
      }
    });
    sensorTag.on('barometricPressureChange', function(pressure) {
      wia.events.publish({name: "barometricPressure", data: pressure});
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
