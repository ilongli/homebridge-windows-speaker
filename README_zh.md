
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


[README](README.md) | [中文文档](README_zh.md)


# Homebridge Windows Speaker
一个简单的全自动Homebridge插件，仅**Windows**系统使用，自动扫描电脑的音频输出设备，将每个音频输出注册为一个“**灯**”，可点击切换默认的音频输出设备、控制每个音频输出设备的音量。


## 环境需求
- 理论上兼容win7以上的系统。经测试，Windows家庭版21H2和Windows Server 2012R2正常工作。
- 该插件实际上是通过NirSoft的[SoundVolumeView](https://www.nirsoft.net/utils/sound_volume_view.html)和[SoundVolumeCommandLine](https://www.nirsoft.net/utils/sound_volume_command_line.html)进行音频设备的控制。因此，若发现你的系统不能正常工作，可以尝试操作这两个工具是否工作正常。

## 安装
首先你得已经安装了[Homebridge](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Windows-10)

直接在Homebridge的插件页面搜索本插件安装或者通过npm安装：
```
npm install -g homebridge-windows-speaker
```
添加配置（~/.homebridge/config.json）：
```
"platforms": [
    {
        "name": "homebridge-windows-speaker",
        "platform": "WindowsSpeaker"
    }
]
```

## 配置说明
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
- name：固定为homebridge-windows-speaker
- platform：固定为WindowsSpeaker
- refreshButton：默认true，开启后会自动注册一个刷新的开关，用于刷新音配设备列表
- autoRefresh：默认false，开启自动刷新设备列表的功能
- autoRefreshInterval：默认10，自动刷新间隔（单位：秒）