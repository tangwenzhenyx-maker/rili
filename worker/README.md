# 天气代理 Worker

这个 Worker 用来隐藏和风天气凭据，前端只访问 `/weather?lat=...&lon=...`。

## 需要的和风天气信息

- `QWEATHER_API_HOST`：和风控制台里的专属 API Host，例如 `abc1234xyz.def.qweatherapi.com`
- `QWEATHER_API_KEY`：和风项目里的 API KEY 凭据

和风官方说明：API Host 也是身份认证的一部分，公共 API 地址会逐步停止服务，所以只配置 API Key 不够。

## 部署步骤

```bash
cd worker
wrangler login
wrangler secret put QWEATHER_API_HOST
wrangler secret put QWEATHER_API_KEY
wrangler deploy
```

部署成功后，把 Worker 生成的地址加上 `/weather`，填到 `app.js` 的 `WEATHER_PROXY_ENDPOINT`。

示例：

```js
const WEATHER_PROXY_ENDPOINT = "https://rili-weather-proxy.your-name.workers.dev/weather";
```

## 返回内容

代理会汇总和风天气：

- 实时天气：`/v7/weather/now`
- 逐小时天气：`/v7/weather/24h`
- 15 天预报：`/v7/weather/15d`
- 分钟级降水：`/v7/minutely/5m`

如果代理暂时不可用，前端会自动回退到 Open-Meteo。
