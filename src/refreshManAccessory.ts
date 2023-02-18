import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';


export class RefreshManAccessory {
  private service: Service;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Refresh Man')
      .setCharacteristic(this.platform.Characteristic.Model, 'Refresh Man')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'refresh-man');


    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, 'Refresh');

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Name)
      .onGet(this.getStateStr.bind(this));

  }


  async setOn(value: CharacteristicValue) {

    const isOn = value as boolean;

    this.platform.log.debug('[Refresh-Man]Set On ->', isOn);

    if (isOn) {
      //
      this.platform.doRefresh();
    } else {
      // ignore
    }

  }

  async getOn(): Promise<CharacteristicValue> {
    const isRefreshing = this.platform.isRefreshing;

    this.platform.log.debug('[Refresh-Man]Get On ->', isRefreshing);

    return isRefreshing;
  }

  async getStateStr(): Promise<CharacteristicValue> {
    const isRefreshing = this.platform.isRefreshing;
    const stateStr = isRefreshing ? 'Refreshing' : 'Refresh';
    this.platform.log.debug('[Refresh-Man]Get Name ->', stateStr);
    return stateStr;
  }


}
