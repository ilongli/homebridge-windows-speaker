import { execSync } from 'node:child_process';
import {
  SVV_CMD,
  SVCL_CMD,
  GET_PERCENT_CMD,
  SET_VOLUME,
  SET_DEFAULT_CMD,
  SAVE_SOUND_ITEMS_CMD,
  MUTE_CMD,
  UNMUTE_CMD,
} from './cmd';


export function saveSoundItemFile(soundItemsFilePath: string) {

  // 保存音频设备列表到sound-items.json文件
  execSync(`"${SVV_CMD}" ${SAVE_SOUND_ITEMS_CMD} "${soundItemsFilePath}"`);

}

export function getVolumeByItemId(itemId: string) {

  const volumePercent = execSync(`${SVCL_CMD} ${GET_PERCENT_CMD} "${itemId}"`);

  if (volumePercent) {
    return Math.floor(Number.parseFloat(volumePercent.toString()));
  }

  return 0;

}

export function setVolumeByItemId(itemId: string, volume: number) {
  execSync(`${SVCL_CMD } ${SET_VOLUME} "${itemId}" ${volume}`);
}

export function switchSpeakerByItemId(itemId: string) {
  execSync(`${SVCL_CMD } ${SET_DEFAULT_CMD} "${itemId}"`);
}

export function muteByItemId(itemId: string) {
  execSync(`${SVCL_CMD} ${MUTE_CMD} "${itemId}"`);
}

export function unMuteByItemId(itemId: string) {
  execSync(`${SVCL_CMD} ${UNMUTE_CMD} "${itemId}"`);
}