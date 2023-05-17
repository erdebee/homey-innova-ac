'use strict';

const Homey = require('homey');

const fetch = require('node-fetch');

class InnovaACDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('InnovaACDriver has been initialized');

    //-----------------------------------------------
    //-------------- ACTIONS ------------------------
    
	this.homey.flow.getActionCard('fan_speed_set').registerRunListener((args, state) => {
		return args.my_device.setFanSpeed(args.fan_speed);
  	});   
  	
	this.homey.flow.getActionCard('thermostat_mode_set').registerRunListener((args, state) => {
		return args.my_device.setInnovaMode(args.thermostat_mode);
  	});     	     

	this.homey.flow.getActionCard('night_mode_on').registerRunListener((args, state) => {
		return args.my_device.nightModeOn();
  	});
  	
  	this.homey.flow.getActionCard('night_mode_off').registerRunListener((args, state) => {
		return args.my_device.nightModeOff();
  	});

	this.homey.flow.getActionCard('night_mode_toggle').registerRunListener((args, state) => {
		if (args.my_device.getCapabilityValue('night_mode'))
		  return args.my_device.nightModeOff();
		else  
		  return args.my_device.nightModeOn();		
  	});
  	
  	this.homey.flow.getActionCard('flap_rotate_on').registerRunListener((args, state) => {
		return args.my_device.flapRotateOn();
  	});
  	
  	this.homey.flow.getActionCard('flap_rotate_off').registerRunListener((args, state) => {
		return args.my_device.flapRotateOff();
  	});
  	
  	this.homey.flow.getActionCard('flap_rotate_toggle').registerRunListener((args, state) => {
		if (args.my_device.getCapabilityValue('flap_rotate'))
		  return args.my_device.flapRotateOff();
		else  
		  return args.my_device.flapRotateOn();		
  	});
  	
    //-----------------------------------------------
    //-------------- TRIGGERS -----------------------

    this.triggerFlapRotateOn = 	 	this.homey.flow.getDeviceTriggerCard('flap_rotate_on');
    this.triggerFlapRotateOff = 	this.homey.flow.getDeviceTriggerCard('flap_rotate_off');
    this.triggerFlapRotateToggle = 	this.homey.flow.getDeviceTriggerCard('flap_rotate_toggled');        
    this.triggerNightModeOn = 	 	this.homey.flow.getDeviceTriggerCard('night_mode_on');
    this.triggerNightModeOff = 	 	this.homey.flow.getDeviceTriggerCard('night_mode_off');
    this.triggerNightModeToggle = 	this.homey.flow.getDeviceTriggerCard('night_mode_toggled');        
	this.triggerFanSpeed = 		 	this.homey.flow.getDeviceTriggerCard('fan_speed_changed').registerRunListener((args, state) => {
	  this.log(args);
	  this.log(state);	  
  	});
  	
    this.triggerModeChanged = 		this.homey.flow.getDeviceTriggerCard('thermostat_mode_changed').registerRunListener((args, state) => {
	  this.log(args);
	  this.log(state);	  
  	});

  	
    //-------------------------------------------------
    //-------------- CONDITIONS -----------------------    
  	this.homey.flow.getConditionCard('fan_speed_is').registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('fan_speed');
  	});
  	
  	this.homey.flow.getConditionCard('flap_rotate_is').registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('flat_rotate');
  	});
  	
  	this.homey.flow.getConditionCard('night_mode_is').registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('night_mode');
  	});
  	
  	this.homey.flow.getConditionCard('thermostat_mode_is').registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('thermostat_mode');
  	});
  };
  
  async onPair(session) {
    var devices = [
                 {
                "data": { "id": "initial_id", "uid": "initial_uid", "serial": "initial_serial" },
                "name": "initial_name",
                "settings": { "settingIPAddress": "0.0.0.0" } 
            }
    ];
    // this is called when the user presses save settings button in start.html
    session.setHandler("get_devices", async (data, callback) => {


		console.log("Innova app - get_devices data: " + JSON.stringify(data));
		console.log("Innova app - get_devices devices: " + JSON.stringify(devices));

        let response = await fetch('http://' + data.ipaddress + '/api/v/1/status');
		if(!response.ok) {
			session.emit("not_found", null);		
			console.log("Innova app - response is not ok");
		} else {
			console.log("Innova app - response is ok");
			let responseObj = await response.json();

			devices = [{
				data: { id: responseObj.uid, uid: responseObj.UID, serial: responseObj.setup.serial },
				name: data.deviceName,
				settings: { "settingIPAddress": data.ipaddress }
			}];

			// ready to continue pairing
			session.emit("found", null);
		}
	});

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	// pairing: start.html -> get_devices -> list_devices -> add_devices
	session.setHandler("list_devices", function (data, callback) {

		console.log("Innova app - list_devices data: " + JSON.stringify(data));
		console.log("Innova app - list_devices devices: " + JSON.stringify(devices));

		return devices;
	});
  };	
	
	
  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [];
  }
}

module.exports = InnovaACDriver;
