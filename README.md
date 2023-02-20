
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


[README](README.md) | [中文文档](README_zh.md)


# Homebridge Windows Speaker
A simple fully automatic Homebridge plugin, only for **Windows**, automatically scans the computer's audio output devices, registers each audio output as a“**LightBulb**”, switch the default audio output device, and controls the volume of each audio output device。


## Requirement
- Should be Windows 7 or above. In my tests, Windows Home 21H2 and Windows Server 2012R2 work fine.
- The plugin is actually working by NirSoft [SoundVolumeView](https://www.nirsoft.net/utils/sound_volume_view.html) and [SoundVolumeCommandLine](https://www.nirsoft.net/utils/sound_volume_command_line.html) to control the audio deivec. Therefore, if you find that your system is not working properly, you can try to see if these two tools are working properly.

## Install
Install the [Homebridge](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Windows-10)

Search and install this plugin directly on the Homebridge plugin page or via npm：
```
npm install -g homebridge-windows-speaker
```
Edit the homebridge's config（~/.homebridge/config.json）：
```
"platforms": [
    {
        "name": "homebridge-windows-speaker",
        "platform": "WindowsSpeaker"
    }
]
```

## Configuration
```
"platforms": [
    {
        "name": "homebridge-windows-speaker",
        "platform": "WindowsSpeaker",
        "refreshButton": true,
        "autoRefresh": false,
        "autoRefreshInterval": 10
    }
]
```
- name: must be "homebridge-windows-speaker"
- platform: must be "WindowsSpeaker"
- refreshButton：default is true, automatically register a refreshed switch to refresh the list of audio output devices
- autoRefresh：default is false, automatically refresh the list of audio output devices
- autoRefreshInterval：default is 10, refresh interval(seconds)