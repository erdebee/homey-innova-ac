'use strict';

const Homey = require('homey');

const fetch = require('node-fetch');

class InnovaAC extends Homey.Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('InnovaAC has been initialized');
    this.refreshStatus();
    setInterval((e) => e.refreshStatus(), 15000, this)
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('flap_rotate', this.onCapabilityFlapRotate.bind(this));
    this.registerCapabilityListener('night_mode', this.onCapabilityNightMode.bind(this));
    this.registerCapabilityListener('fan_speed', this.onCapabilityFanSpeed.bind(this));
    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
    this.registerCapabilityListener('innova_mode', this.onCapabilityInnovaMode.bind(this));         
  }

  async onCapabilityOnoff( value, opts ) {
    if (value) {
      await this.powerOn();
    }else{
      await this.powerOff();    
    }
  }
  
  async onCapabilityFlapRotate( value, opts ) {
    if (value) {
      await this.flapOn();
    }else{
      await this.flapOff();    
    }
  }
  
  async onCapabilityNightMode( value, opts ) {
    if (value) {
      await this.nightModeOn();
    }else{
      await this.nightModeOff();    
    }
  }  

  async onCapabilityNightMode( value, opts ) {
    if (value) {
      await this.nightModeOn();
    }else{
      await this.nightModeOff();    
    }
  }  

  async onCapabilityFanSpeed( value, opts ) {
    await this.setFanSpeed(value);
  }  

  async onCapabilityTargetTemperature( value, opts ) {
    await this.setTargetTemperature(value);
  }  

  async onCapabilityInnovaMode( value, opts ) {
    await this.setInnovaMode(value);
  }  

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('InnovaAC has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('InnovaAC settings where changed');
    
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('InnovaAC was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('InnovaAC has been deleted');
  }
  
  powerOn() {
    return this.sendCommand('power/on')    
    	.then(res => {if (!res) {
			throw new Error('unsuccessful');
    	}});
  }

  powerOff() {
    return this.sendCommand('power/off')
    	.then(res => {if (!res) {
			throw new Error('unsuccessful');
    	}});
  }
  
  flapOn() {
  	let device = this;  
    return this.sendCommand('set/feature/rotation',true,{"value": 0 })
    	.then(res => {if (!res) {
			throw new Error('unsuccessful');
    	}else{
    		this.getDriver().triggerFlapRotateToggle.trigger(device, {}, {});
    		this.getDriver().triggerFlapRotateOn.trigger(device, {}, {});
    	}
	});
  }

  flapOff() {
  	let device = this;  
    return this.sendCommand('set/feature/rotation',true,{"value": 7 })
    	.then(res => { if (!res) {
			throw new Error('unsuccessful');
    	}else{
    		this.getDriver().triggerFlapRotateToggle.trigger(device, {}, {});
    		this.getDriver().triggerFlapRotateOff.trigger(device, {}, {});
    	}});
  }
  
  nightModeOn() {
  	let device = this;  
    return this.sendCommand('set/feature/night',true,{"value": 1 })
    	.then(res => { if (!res) {
			throw new Error('unsuccessful');
    	}else{
    		this.getDriver().triggerNightModeToggle.trigger(device, {}, {});
    		this.getDriver().triggerNightModeOn.trigger(device, {}, {});
    	}});
  }

  nightModeOff() {
  	let device = this;
    return this.sendCommand('set/feature/night',true,{"value": 0 })
    	.then(res => { if (!res) {
			throw new Error('unsuccessful');
    	}else{
    		this.getDriver().triggerNightModeToggle.trigger(device, {}, {});
    		this.getDriver().triggerNightModeOff.trigger(device, {}, {});
    	}});
  }
  
  setFanSpeed(speed) {
  	let device = this;
    return this.sendCommand('set/fan',true,{"value": speed })
    	.then(res => { if (!res) {
			throw new Error('unsuccessful');
    	}else{
    		this.getDriver().triggerFanSpeed.trigger(device, {}, {"fan_speed": speed, "uid": device.getData().uid})
    		    .catch( this.error )
			    .then( this.log );
    	}});
  }

  setTargetTemperature(setpoint) {
    return this.sendCommand('set/setpoint',true,{"p_temp": setpoint })
    	.then(res => { if (!res) {
			throw new Error('unsuccessful');
    	}});
  }
  
  setInnovaMode(mode) {
    this.setCapabilityValue("onoff", true);
    if (mode == "schedule") {
    	return this.sendCommand('set/calendar/on',true)
    		.then(res => { if (!res) {
				throw new Error('unsuccessful');
	    	}else{
    			this.getDriver().triggerModeChanged.trigger(device, {"thermostat_mode": "schedule"}, {});
    		}});  
    }else{
    	return this.sendCommand('set/mode/'+mode,true)
    		.then(res => { if (!res) {
				throw new Error('unsuccessful');
	    	}else{
    			this.getDriver().triggerModeChanged.trigger(device, {"thermostat_mode": mode}, {});
    		}});
    }	
  }
  
  refreshStatus() {
    let status = this.qryStatus().then(response => {
      this.log(response);
      if (response) {
		  let r = response.RESULT;
		  this.log('Innova refreshStatus');
		  this.setCapabilityValue("target_temperature", r.sp);
		  this.setCapabilityValue("innova_mode", this.intToMode(r.wm, r.cm));
		  this.setCapabilityValue("onoff", !!r.ps);
		  this.setCapabilityValue("measure_temperature", r.t);
		  this.setCapabilityValue("night_mode", !!r.nm);
		  this.setCapabilityValue("flap_rotate", (r.fr == 0));
		  this.setCapabilityValue("fan_speed", "" + r.fs);
      }
    })
  }

  intToMode(intMode, calendarOn) {
    if (calendarOn) return "schedule";
    switch (intMode){
      case 0: return "heating";
      case 1: return "cooling";
      case 3: return "dehumidification";
      case 4: return "fanonly";
      case 5: return "auto";        
      default: return null;                        
    }
  }
  
  qryStatus(retry = true) {
    let settings = this.getSettings();
	let hostIP = settings.settingIPAddress;
    let uri = 'http://' + hostIP + '/api/v/1/status';
    this.log('Query status');
    
    let retryCallback = () => { 
    	return this.qryStatus(false) 
    };
    
    return fetch(uri, { method: 'GET', timeout: 1500 })
    	.then(
    	    res => { 
    	      return res.json();
    	    }, 
    	    err => { 
    	      if (retry) this.updateIpAndRetry(retryCallback) 
    	    }
    	);
  }  

  sendCommand(command, retry = true, meta = {}) {
    let settings = this.getSettings();
	let hostIP = settings.settingIPAddress;
    let uri = 'http://' + hostIP + '/api/v/1/' + command;
    this.log('Send command ' + command);
    
    let retryCallback = () => { 
      return this.sendCommand(command, false, meta) 
    };
    
	return fetch(uri, { method: 'POST', body: new URLSearchParams(meta), timeout: 1500 })
        .then(async res => {
		  return res.json().then(res => { return res.success; })
        }, err => { 
          if (retry) 
            this.updateIpAndRetry(retryCallback) 
        });
  }
  
  updateIpAndRetry(cb) {
    let data = this.getData();    

    let uri = 'http://innovaenergie.cloud/api/v/1/connection';
    this.log('Updating IP from innova cloud and retry');
    
    let idHeaders = { 
      'X-Serial': data.serial,
      'X-UID': data.uid
    };
    return fetch(uri, { timeout: 3000, headers: idHeaders})
      .then(async res => {
        this.log(res);
        var jsonBody = await res.json();
        this.setSettings({ 
          'settingIPAddress': jsonBody.net.ip 
        });
        this.log('Updated IP to ' + jsonBody.net.ip);
        cb();
      }, err => this.log(err));
  }
}

module.exports = InnovaAC;
