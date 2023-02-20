import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

import {
  getVolumeByItemId,
  setVolumeByItemId,
  muteByItemId,
  unMuteByItemId,
  switchSpeakerByItemId,
} from './cmd-utils';


export class ExamplePlatformAccessory {
  private service: Service;

  private itemId: string;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.itemId = accessory.context.device['Item ID'];

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device['Device Name'])
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device['Device Name'])
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device['Item ID']);

    // use Lightbulb to simulate the Speaker
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['Name']);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getActive.bind(this))
      .onSet(this.setActive.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(this.getVolume.bind(this))
      .onSet(this.setVolume.bind(this));

  }


  async setActive(value: CharacteristicValue) {

    const isOn = value as boolean;

    this.platform.log.debug(`[${this.accessory.displayName}]Set Active ->`, isOn);

    if (isOn) {
      // 切换到这个speaker
      // switch the this speaker
      switchSpeakerByItemId(this.itemId);
      unMuteByItemId(this.itemId);
      this.platform.updateDevicesState(this.accessory);
    } else {
      // 如果是off，相当于将其静音
      // off equals to mute
      muteByItemId(this.itemId);
    }



  }

  async getActive(): Promise<CharacteristicValue> {
    const isActive = this.platform.defaultSpeakerUUID === this.accessory.UUID;

    this.platform.log.debug(`[${this.accessory.displayName}]Set Active ->`, isActive);

    return isActive;
  }

  async getVolume(): Promise<CharacteristicValue> {
    // const volume = this.states.Volume;
    const volume = getVolumeByItemId(this.itemId);
    this.platform.log.debug(`[${this.accessory.displayName}]Get Volume ->`, volume);
    return volume;
  }

  async setVolume(value: CharacteristicValue) {
    // this.states.Volume = value as number;
    setVolumeByItemId(this.itemId, value as number);
    this.platform.log.debug(`[${this.accessory.displayName}]Set Volume ->`, value);
  }

}
