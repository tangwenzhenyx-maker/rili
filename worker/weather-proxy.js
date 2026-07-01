const DEFAULT_ALLOWED_ORIGIN = "https://tangwenzhenyx-maker.github.io";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method !== "GET" || url.pathname !== "/weather") {
      return jsonResponse({ error: "not_found" }, 404, request, env);
    }

    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return jsonResponse({ error: "lat_lon_required" }, 400, request, env);
    }

    if (!env.QWEATHER_API_HOST || (!env.QWEATHER_API_KEY && !env.QWEATHER_JWT)) {
      return jsonResponse({ error: "qweather_credentials_missing" }, 501, request, env);
    }

    const location = `${lon.toFixed(2)},${lat.toFixed(2)}`;
    const [nowResult, hourlyResult, dailyResult, minutelyResult] = await Promise.allSettled([
      qweatherFetch(env, "/v7/weather/now", { location, lang: "zh", unit: "m" }),
      qweatherFetch(env, "/v7/weather/24h", { location, lang: "zh", unit: "m" }),
      qweatherFetch(env, "/v7/weather/15d", { location, lang: "zh", unit: "m" }),
      qweatherFetch(env, "/v7/minutely/5m", { location, lang: "zh" }),
    ]);

    const now = unwrap(nowResult);
    if (!now?.now) {
      return jsonResponse({ error: "qweather_now_failed" }, 502, request, env);
    }

    const hourly = unwrap(hourlyResult)?.hourly || [];
    const daily = unwrap(dailyResult)?.daily || [];
    const minutely = unwrap(minutelyResult);
    const updateTime = now.updateTime || now.now.obsTime;

    return jsonResponse({
      source: "QWeather",
      updatedAt: updateTime,
      forecast: {
        current: normalizeCurrent(now.now, updateTime),
        hourly: normalizeHourly(hourly),
        daily: normalizeDaily(daily),
        minutely: normalizeMinutely(minutely),
      },
      refer: now.refer || null,
    }, 200, request, env, {
      "Cache-Control": "public, max-age=300",
    });
  },
};

async function qweatherFetch(env, path, params) {
  const apiUrl = new URL(path, normalizeHost(env.QWEATHER_API_HOST));
  Object.entries(params).forEach(([key, value]) => apiUrl.searchParams.set(key, value));

  const headers = { Accept: "application/json" };
  if (env.QWEATHER_JWT) {
    headers.Authorization = `Bearer ${env.QWEATHER_JWT}`;
  } else if (env.QWEATHER_API_KEY) {
    apiUrl.searchParams.set("key", env.QWEATHER_API_KEY);
  }

  const response = await fetch(apiUrl.toString(), { headers });
  if (!response.ok) {
    throw new Error(`qweather ${path} ${response.status}`);
  }

  const data = await response.json();
  if (data.code && data.code !== "200") {
    throw new Error(`qweather ${path} code ${data.code}`);
  }
  return data;
}

function normalizeCurrent(now, updateTime) {
  return {
    time: normalizeTime(now.obsTime || updateTime),
    temperature_2m: toNumber(now.temp),
    apparent_temperature: toNumber(now.feelsLike),
    relative_humidity_2m: toNumber(now.humidity),
    weather_code: mapQWeatherIcon(now.icon, now.text),
    weather_text: now.text || "",
    wind_speed_10m: toNumber(now.windSpeed),
    wind_text: now.windScale ? `${now.windDir || "风力"} ${now.windScale}级` : now.windDir || "",
    precipitation: toNumber(now.precip),
  };
}

function normalizeHourly(items) {
  return {
    time: items.map((item) => normalizeTime(item.fxTime)),
    temperature_2m: items.map((item) => toNumber(item.temp)),
    weather_code: items.map((item) => mapQWeatherIcon(item.icon, item.text)),
    weather_text: items.map((item) => item.text || ""),
    precipitation_probability: items.map((item) => toNumber(item.pop)),
    precipitation: items.map((item) => toNumber(item.precip)),
    wind_speed_10m: items.map((item) => toNumber(item.windSpeed)),
  };
}

function normalizeDaily(items) {
  return {
    time: items.map((item) => item.fxDate),
    weather_code: items.map((item) => mapQWeatherIcon(item.iconDay, item.textDay)),
    weather_text: items.map((item) => item.textDay || item.textNight || ""),
    temperature_2m_max: items.map((item) => toNumber(item.tempMax)),
    temperature_2m_min: items.map((item) => toNumber(item.tempMin)),
    precipitation_probability_max: items.map((item) => toNumber(item.pop)),
    precipitation_sum: items.map((item) => toNumber(item.precip)),
  };
}

function normalizeMinutely(data) {
  const items = data?.minutely || [];
  return {
    summary: data?.summary || "",
    time: items.map((item) => normalizeTime(item.fxTime)),
    precipitation: items.map((item) => toNumber(item.precip)),
    type: items.map((item) => item.type || "rain"),
  };
}

function mapQWeatherIcon(iconValue, text = "") {
  const icon = Number(iconValue);
  if ([100, 150].includes(icon)) return 0;
  if ([101, 102, 103, 151, 152, 153].includes(icon)) return 2;
  if ([104, 154].includes(icon)) return 3;
  if ([300, 301].includes(icon)) return 80;
  if ([302, 303, 304].includes(icon)) return 95;
  if ([305, 309, 313, 314, 399].includes(icon)) return 61;
  if ([306, 315].includes(icon)) return 63;
  if ([307, 308, 310, 311, 312, 316, 317, 318].includes(icon)) return 65;
  if ([400, 407, 408, 499].includes(icon)) return 71;
  if ([401, 409].includes(icon)) return 73;
  if ([402, 403, 410].includes(icon)) return 75;
  if ([404, 405, 406].includes(icon)) return 85;
  if (icon >= 500 && icon < 600) return 45;
  if (text.includes("雷")) return 95;
  if (text.includes("雨")) return 61;
  if (text.includes("雪")) return 71;
  if (text.includes("云")) return 2;
  if (text.includes("阴")) return 3;
  return 2;
}

function normalizeHost(value) {
  const host = value.trim();
  return host.startsWith("http") ? host : `https://${host}`;
}

function normalizeTime(value) {
  return value ? value.replace("+08:00", "") : "";
}

function unwrap(result) {
  return result.status === "fulfilled" ? result.value : null;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function jsonResponse(data, status, request, env, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

function corsHeaders(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  const origin = request.headers.get("Origin");
  const originAllowed = allowedOrigin === "*" || !origin || allowedOrigin.split(",").map((item) => item.trim()).includes(origin);
  return {
    "Access-Control-Allow-Origin": originAllowed ? (origin || allowedOrigin) : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
