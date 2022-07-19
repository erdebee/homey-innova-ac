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
    
	new Homey.FlowCardAction('fan_speed_set').register().registerRunListener((args, state) => {
		return args.my_device.setFanSpeed(args.fan_speed);
  	});   
  	
	new Homey.FlowCardAction('thermostat_mode_set').register().registerRunListener((args, state) => {
		return args.my_device.setInnovaMode(args.thermostat_mode);
  	});     	     

	new Homey.FlowCardAction('night_mode_on').register().registerRunListener((args, state) => {
		return args.my_device.nightModeOn();
  	});
  	
  	new Homey.FlowCardAction('night_mode_off').register().registerRunListener((args, state) => {
		return args.my_device.nightModeOff();
  	});

	new Homey.FlowCardAction('night_mode_toggle').register().registerRunListener((args, state) => {
		if (args.my_device.getCapabilityValue('night_mode'))
		  return args.my_device.nightModeOff();
		else  
		  return args.my_device.nightModeOn();		
  	});
  	
  	new Homey.FlowCardAction('flap_rotate_on').register().registerRunListener((args, state) => {
		return args.my_device.flapRotateOn();
  	});
  	
  	new Homey.FlowCardAction('flap_rotate_off').register().registerRunListener((args, state) => {
		return args.my_device.flapRotateOff();
  	});
  	
  	new Homey.FlowCardAction('flap_rotate_toggle').register().registerRunListener((args, state) => {
		if (args.my_device.getCapabilityValue('flap_rotate'))
		  return args.my_device.flapRotateOff();
		else  
		  return args.my_device.flapRotateOn();		
  	});
  	
    //-----------------------------------------------
    //-------------- TRIGGERS -----------------------

    this.triggerFlapRotateOn = 	 	new Homey.FlowCardTriggerDevice('flap_rotate_on').register();
    this.triggerFlapRotateOff = 	new Homey.FlowCardTriggerDevice('flap_rotate_off').register();
    this.triggerFlapRotateToggle = 	new Homey.FlowCardTriggerDevice('flap_rotate_toggled').register();        
    this.triggerNightModeOn = 	 	new Homey.FlowCardTriggerDevice('night_mode_on').register();
    this.triggerNightModeOff = 	 	new Homey.FlowCardTriggerDevice('night_mode_off').register();
    this.triggerNightModeToggle = 	new Homey.FlowCardTriggerDevice('night_mode_toggled').register();        
	this.triggerFanSpeed = 		 	new Homey.FlowCardTriggerDevice('fan_speed_changed').register().registerRunListener((args, state) => {
	  this.log(args);
	  this.log(state);	  
  	});
  	
    this.triggerModeChanged = 		new Homey.FlowCardTriggerDevice('thermostat_mode_changed').register().registerRunListener((args, state) => {
	  this.log(args);
	  this.log(state);	  
  	});

  	
    //-------------------------------------------------
    //-------------- CONDITIONS -----------------------    
  	new Homey.FlowCardCondition('fan_speed_is').register().registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('fan_speed');
  	});
  	
  	new Homey.FlowCardCondition('flap_rotate_is').register().registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('flat_rotate');
  	});
  	
  	new Homey.FlowCardCondition('night_mode_is').register().registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('night_mode');
  	});
  	
  	new Homey.FlowCardCondition('thermostat_mode_is').register().registerRunListener((args, state) => {
	  return args.my_device.getCapabilityValue('thermostat_mode');
  	});
  };
  
  async onPair(socket) {
    var devices = [
                 {
                "data": { "id": "initial_id", "uid": "initial_uid", "serial": "initial_serial" },
                "name": "initial_name",
                "settings": { "settingIPAddress": "0.0.0.0" } 
            }
    ];
    // this is called when the user presses save settings button in start.html
	socket.on("get_devices", async function (data, callback) {

		console.log("Innova app - get_devices data: " + JSON.stringify(data));
		console.log("Innova app - get_devices devices: " + JSON.stringify(devices));

        let response = await fetch('http://' + data.ipaddress + '/api/v/1/status');
		if(!response.ok) {
			socket.emit("not_found", null);		
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
			socket.emit("found", null);
		}
	});

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	// pairing: start.html -> get_devices -> list_devices -> add_devices
	socket.on("list_devices", function (data, callback) {

		console.log("Innova app - list_devices data: " + JSON.stringify(data));
		console.log("Innova app - list_devices devices: " + JSON.stringify(devices));

		callback(null, devices);
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