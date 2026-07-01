# 万年历 PWA

一个可以放到 iPhone 主屏幕的静态 PWA：今日首页、万年历、天气。

## 本地预览

```bash
python3 -m http.server 8788
```

然后在浏览器打开：

```text
http://127.0.0.1:8788/
```

iPhone 和 Mac 在同一个 Wi-Fi 时，可以用手机 Safari 打开：

```text
http://你的电脑局域网IP:8788/
```

## 放到 iPhone 主屏幕

1. 上传到 GitHub。
2. 在仓库 `Settings -> Pages` 开启 GitHub Pages。
3. 用 iPhone Safari 打开 GitHub Pages 生成的网址。
4. 点 Safari 分享按钮，选择“添加到主屏幕”。

## 说明

- 首页、日历、农历、节气和常见节日可以离线使用。
- 万年历已内置 2026 年中国大陆假期和调休标记，日历中用“休 / 班”显示。
- 天气使用 Open-Meteo 公开接口，不需要 API Key；实时、未来两小时和未来 14 天预报来自 `api.open-meteo.com/v1/forecast`，空气质量来自 `air-quality-api.open-meteo.com/v1/air-quality`。短时天气显示“概率/预计雨量”，它是模型预报，不等同于雷达临近预报。
- 天气城市支持“当前位置”。iPhone/Safari 必须授权定位；局域网 `http://` 预览可能无法定位，部署到 GitHub Pages 的 `https://` 地址后可正常使用。
- 当前版本不放黄历宜忌，底部只保留“首页 / 万年历 / 天气”三个入口。
