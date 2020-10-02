'use strict';

const Homey = require('homey');

const fetch = require('node-fetch');

class InnovaACDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('InnovaACDriver has been initialized');
  };

  
  async onPair(socket) {
     var devices = [
                 {
                "data": { "id": "initial_id", "serial": "initial_serial" },
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
				data: { id: responseObj.uid, serial: responseObj.setup.serial },
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
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }
}

module.exports = InnovaACDriver;