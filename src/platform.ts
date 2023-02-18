import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ExamplePlatformAccessory } from './platformAccessory';
import { RefreshManAccessory } from './refreshManAccessory';

import { saveSoundItemFile } from './cmd-utils';

import fs from 'node:fs';
import path from 'node:path';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class ExampleHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public cacheAccessories: PlatformAccessory[] = [];

  // 目前正在使用的accessory
  public accessories: PlatformAccessory[] = [];

  public defaultSpeakerUUID = '';

  public soundItemsFilePath = '';

  public isReady = false;

  public isRefreshing = false;

  public cacheRefreshMan!: PlatformAccessory;
  public refreshMan!: PlatformAccessory;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    /**
     * init the soundItemsFilePath
     */
    const configDir = this.api.user.storagePath() + '/windows-speaker';
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }
    this.log.debug(`持久化音频设备列表文件路径： ${configDir}`);

    this.soundItemsFilePath = path.join(configDir, 'sound-items.json');


    /**
     * init the auto refresh
     */
    if (config.autoRefresh) {
      this.log.info(`start the auto refresh per ${config.autoRefreshInterval} seconds`);
      setInterval(this.doRefresh.bind(this), config.autoRefreshInterval * 1000);
    }


    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      // create the refresh-man
      if (this.config.refreshButton) {
        this.createRefreshMan();
      } else {
        this.removeRefreshManIfNeed();
      }

      // refresh devices
      this.isReady = true;
      this.doRefresh();
    });
  }

  removeRefreshManIfNeed() {
    if (this.cacheRefreshMan) {
      this.log.debug('unregister the cache refresh-man');
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [this.cacheRefreshMan]);
    }
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    if (accessory.context.isRefreshMan) {
      this.cacheRefreshMan = accessory;
    } else {
      this.log.info(
        'Loading accessory from cache:',
        accessory.displayName,
        accessory.context.device['Item ID']);
      this.cacheAccessories.push(accessory);
    }
  }

  doRefresh() {

    if (this.isRefreshing || !this.isReady) {
      return;
    }

    this.isRefreshing = true;

    try {
      this.discoverDevices();
    } finally {
      this.isRefreshing = false;
      this.updateRefreshManState();
    }

  }

  discoverDevices() {

    // get all speakers
    const speakers = this.getAllSpeakers();
    const aliveSpeakerMap = new Map();

    for (const device of speakers) {

      const uuid = this.api.hap.uuid.generate(device['Item ID']);

      // 检查是否当前默认的speaker
      // check whether is the default speaker
      if (device['Default'] !== '') {
        this.defaultSpeakerUUID = uuid;
      }

      // 正在使用的accessories已经存在该speaker了，跳过
      const workingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      if (workingAccessory) {
        // 更新device信息
        workingAccessory.context.device = device;
        this.api.updatePlatformAccessories([workingAccessory]);
        aliveSpeakerMap.set(workingAccessory.UUID, true);
        continue;
      }

      const existingAccessory = this.cacheAccessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName,
          existingAccessory.context.device['Item ID']);

        // 更新device信息
        existingAccessory.context.device = device;
        this.api.updatePlatformAccessories([existingAccessory]);

        new ExamplePlatformAccessory(this, existingAccessory);

        // 缓存设备处理完毕，从this.accessories中删除
        this.cacheAccessories.splice(this.cacheAccessories.indexOf(existingAccessory), 1);

        this.accessories.push(existingAccessory);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device['Name']);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device['Name'], uuid);

        accessory.context.device = device;

        new ExamplePlatformAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

        this.accessories.push(accessory);
      }

      aliveSpeakerMap.set(uuid, true);

    }

    // 删除掉没有匹配上的cacheAccessory
    if (this.cacheAccessories.length > 0) {
      this.log.debug('unregister accessories:', this.cacheAccessories.map(ca => ca.displayName).join(','));
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.cacheAccessories);
      this.cacheAccessories = [];
    }

    this.log.debug('aliveSpeakerMap:', aliveSpeakerMap);
    // 删除掉已经不存在的speaker
    for (const device of this.accessories) {
      if (!aliveSpeakerMap.has(device.UUID)) {
        this.log.debug('unregister accessory:', device.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [device]);
        this.accessories.splice(this.accessories.indexOf(device), 1);
      }
    }

  }


  /**
   * get all speakers throught SoundVolumeView.exe
   * @see https://www.nirsoft.net/utils/sound_volume_view.html
   * @returns Array
   */
  getAllSpeakers() {
    try {
      saveSoundItemFile(this.soundItemsFilePath);
    } catch (error) {
      this.log.error('保存sound-item.json失败：', (<Buffer> error).toString());
      return [];
    }

    // 从sound-item.json中读取所有音频设备列表
    // get audio device list from sound-item.json
    let fileContent = fs.readFileSync(this.soundItemsFilePath, 'utf8');
    fileContent = fileContent.replace(/^\uFEFF/, '');
    const soundItems = JSON.parse(fileContent) || [];

    // 筛选出所有speakers
    // filter all speakers
    const speakers = soundItems.filter((soundItem) => {
      return soundItem.Type === 'Device' && soundItem.Direction === 'Render';
    });

    this.log.debug('speakers:', speakers);

    return speakers;
  }


  updateDevicesState(accessory: PlatformAccessory) {

    const currentUUID = accessory.UUID;

    this.log.debug('updateDevicesState:', currentUUID);

    if (this.defaultSpeakerUUID === currentUUID) {
      return;
    }

    this.defaultSpeakerUUID = currentUUID;
    // 遍历所有speaker，更新其状态
    // iterate all speakers, update the state
    for (const speaker of this.accessories) {
      if (speaker.UUID !== currentUUID) {
        const service = speaker.getService(this.Service.Lightbulb);
        if (service) {
          service.updateCharacteristic(this.Characteristic.On, false);
        }
      }
    }
  }


  createRefreshMan() {
    const cacheRefreshMan = this.cacheRefreshMan;
    if (cacheRefreshMan) {

      this.log.info('Restoring RefreshMan from cache');

      new RefreshManAccessory(this, cacheRefreshMan);

      this.refreshMan = cacheRefreshMan;
    } else {

      const uuid = this.api.hap.uuid.generate('refresh-man');

      this.log.info('Create RefreshMan');

      // create a new accessory
      const accessory = new this.api.platformAccessory('Refresh-Man', uuid);

      accessory.context.isRefreshMan = true;

      new RefreshManAccessory(this, accessory);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

      this.refreshMan = accessory;
    }

  }

  updateRefreshManState() {
    if (this.refreshMan) {
      const service = this.refreshMan.getService(this.Service.Switch);
      if (service) {
        service.updateCharacteristic(this.Characteristic.On, false);
        service.updateCharacteristic(this.Characteristic.Name, 'Refresh');
      }
    }
  }
}
