import path from 'node:path';
/**
 * path of the SoundVolumeView.exe
 */
export const SVV_CMD = path.join(__dirname, '..', 'public/SoundVolumeView.exe');

/**
 * path of the svcl.exe
 */
export const SVCL_CMD = path.join(__dirname, '..', 'public/svcl.exe');

export const SAVE_SOUND_ITEMS_CMD = '/SaveFileEncoding 3 /sjson';

export const MUTE_CMD = '/Mute';

export const UNMUTE_CMD = '/Unmute';

export const GET_PERCENT_CMD = '/Stdout /GetPercent';

export const SET_VOLUME = '/SetVolume';

export const SET_DEFAULT_CMD = '/SetDefault';

