const state = {
  activeView: "home",
  currentMonth: startOfMonth(new Date()),
  selectedDate: stripTime(new Date()),
  weatherPlace: "tongan",
  lastWeather: null,
};

const WEATHER_PLACE_STORAGE = "rili-weather-place-v3";
const WEATHER_CACHE_STORAGE = "rili-weather-cache-v3";
const CURRENT_PLACE_KEY = "current";

const els = {};

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const CN_DAY_PREFIX = ["初", "十", "廿", "卅"];
const CN_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const SOLAR_TERMS = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
const SOLAR_TERM_INFO = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];

const SOLAR_FESTIVALS = {
  "1-1": "元旦",
  "3-8": "妇女节",
  "3-12": "植树节",
  "5-1": "劳动节",
  "5-4": "青年节",
  "6-1": "儿童节",
  "7-1": "建党节",
  "8-1": "建军节",
  "9-3": "抗战胜利",
  "9-10": "教师节",
  "9-18": "九一八",
  "10-1": "国庆节",
};

const LUNAR_FESTIVALS = {
  "1-1": "春节",
  "1-15": "元宵",
  "2-2": "龙抬头",
  "5-5": "端午",
  "7-7": "七夕",
  "7-15": "中元",
  "7-22": "财神节",
  "8-15": "中秋",
  "8-18": "孔子诞辰",
  "9-9": "重阳",
  "12-8": "腊八",
  "12-23": "小年",
};

const HOLIDAY_OVERRIDES = {
  "2026-01-01": { type: "rest", name: "元旦" },
  "2026-01-02": { type: "rest", name: "元旦调休" },
  "2026-01-03": { type: "rest", name: "元旦假期" },
  "2026-01-04": { type: "work", name: "元旦调休上班" },
  "2026-02-14": { type: "work", name: "春节调休上班" },
  "2026-02-16": { type: "rest", name: "除夕" },
  "2026-02-17": { type: "rest", name: "春节" },
  "2026-02-18": { type: "rest", name: "春节假期" },
  "2026-02-19": { type: "rest", name: "春节假期" },
  "2026-02-20": { type: "rest", name: "春节假期" },
  "2026-02-21": { type: "rest", name: "春节假期" },
  "2026-02-22": { type: "rest", name: "春节假期" },
  "2026-02-23": { type: "rest", name: "春节调休" },
  "2026-02-28": { type: "work", name: "春节调休上班" },
  "2026-04-04": { type: "rest", name: "清明节" },
  "2026-04-05": { type: "rest", name: "清明假期" },
  "2026-04-06": { type: "rest", name: "清明补休" },
  "2026-04-26": { type: "work", name: "劳动节调休上班" },
  "2026-05-01": { type: "rest", name: "劳动节" },
  "2026-05-02": { type: "rest", name: "劳动节假期" },
  "2026-05-03": { type: "rest", name: "劳动节假期" },
  "2026-05-04": { type: "rest", name: "劳动节调休" },
  "2026-05-05": { type: "rest", name: "劳动节调休" },
  "2026-05-09": { type: "work", name: "劳动节调休上班" },
  "2026-06-19": { type: "rest", name: "端午节" },
  "2026-06-20": { type: "rest", name: "端午假期" },
  "2026-06-21": { type: "rest", name: "端午假期" },
  "2026-09-20": { type: "work", name: "中秋国庆调休上班" },
  "2026-09-25": { type: "rest", name: "中秋节" },
  "2026-09-26": { type: "rest", name: "中秋假期" },
  "2026-09-27": { type: "rest", name: "中秋假期" },
  "2026-10-01": { type: "rest", name: "国庆节" },
  "2026-10-02": { type: "rest", name: "国庆假期" },
  "2026-10-03": { type: "rest", name: "国庆假期" },
  "2026-10-04": { type: "rest", name: "国庆假期" },
  "2026-10-05": { type: "rest", name: "国庆假期" },
  "2026-10-06": { type: "rest", name: "国庆假期" },
  "2026-10-07": { type: "rest", name: "国庆假期" },
  "2026-10-10": { type: "work", name: "国庆调休上班" },
};

const CITIES = {
  tongan: { name: "同安", latitude: 24.7291, longitude: 118.1522 },
  siming: { name: "思明", latitude: 24.4457, longitude: 118.0824 },
  xiamen: { name: "厦门", latitude: 24.4798, longitude: 118.0894 },
  fuzhou: { name: "福州", latitude: 26.0745, longitude: 119.2965 },
  hangzhou: { name: "杭州", latitude: 30.2741, longitude: 120.1551 },
  shanghai: { name: "上海", latitude: 31.2304, longitude: 121.4737 },
  beijing: { name: "北京", latitude: 39.9042, longitude: 116.4074 },
  shenzhen: { name: "深圳", latitude: 22.5431, longitude: 114.0579 },
  guangzhou: { name: "广州", latitude: 23.1291, longitude: 113.2644 },
};

const WEATHER_CODES = {
  0: "晴",
  1: "晴间多云",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾凇",
  51: "小毛雨",
  53: "毛雨",
  55: "密集毛雨",
  56: "冻毛雨",
  57: "冻毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "冻雨",
  67: "冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "阵雨",
  81: "阵雨",
  82: "强阵雨",
  85: "阵雪",
  86: "强阵雪",
  95: "雷阵雨",
  96: "雷阵雨",
  99: "强雷阵雨",
};

const WEATHER_DETAILS = {
  95: "有雷暴风险，注意短时强降雨",
  96: "模式提示局地强对流风险，不代表一定下冰雹",
  99: "强雷暴风险较高，出门留意临近预警",
};

let lunarFormatter;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  lunarFormatter = makeLunarFormatter();
  restoreState();
  bindEvents();
  renderAll();
  refreshWeather();
  registerServiceWorker();
});

function bindElements() {
  [
    "homeView",
    "calendarView",
    "weatherView",
    "homeRefreshButton",
    "homeWeek",
    "homeTitle",
    "homeLunar",
    "homeTags",
    "homeWeatherTemp",
    "homeWeatherDesc",
    "homeWeatherIcon",
    "homeWeatherMeta",
    "homeWeatherSource",
    "homeTodayTitle",
    "homeTodayMeta",
    "citySelect",
    "locateButton",
    "refreshWeatherButton",
    "weatherTemp",
    "weatherTitle",
    "weatherMainIcon",
    "weatherAir",
    "weatherFeels",
    "weatherWind",
    "weatherHumidity",
    "weatherTip",
    "weatherSource",
    "hourlyUpdate",
    "hourlyStrip",
    "forecastStrip",
    "prevMonth",
    "nextMonth",
    "todayButton",
    "calendarTitle",
    "dateJump",
    "calendarGrid",
    "selectedTitle",
    "selectedLunar",
    "selectedTags",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.tab));
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.nav));
  });

  els.homeRefreshButton.addEventListener("click", refreshWeather);
  els.refreshWeatherButton.addEventListener("click", refreshWeather);
  els.locateButton.addEventListener("click", enableCurrentLocationWeather);

  els.citySelect.addEventListener("change", () => {
    state.weatherPlace = els.citySelect.value;
    localStorage.setItem(WEATHER_PLACE_STORAGE, state.weatherPlace);
    refreshWeather();
  });

  els.todayButton.addEventListener("click", () => {
    const today = stripTime(new Date());
    state.selectedDate = today;
    state.currentMonth = startOfMonth(today);
    renderCalendar();
    renderSelectedDay();
  });

  els.prevMonth.addEventListener("click", () => changeMonth(-1));
  els.nextMonth.addEventListener("click", () => changeMonth(1));

  els.dateJump.addEventListener("change", () => {
    if (!els.dateJump.value) return;
    const picked = parseDateInput(els.dateJump.value);
    state.selectedDate = picked;
    state.currentMonth = startOfMonth(picked);
    renderCalendar();
    renderSelectedDay();
  });

  els.calendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    const picked = parseDateInput(button.dataset.date);
    state.selectedDate = picked;
    state.currentMonth = startOfMonth(picked);
    renderCalendar();
    renderSelectedDay();
  });
}

function restoreState() {
  const savedPlace = localStorage.getItem(WEATHER_PLACE_STORAGE);
  if (savedPlace === CURRENT_PLACE_KEY || CITIES[savedPlace]) {
    state.weatherPlace = savedPlace;
    els.citySelect.value = savedPlace;
  } else {
    els.citySelect.value = state.weatherPlace;
  }

  const cached = getCachedWeather();
  const expectedPlace = CITIES[state.weatherPlace] || null;
  const cacheMatches = state.weatherPlace === CURRENT_PLACE_KEY
    ? cached?.place?.name === "当前位置"
    : cached?.place?.name === expectedPlace?.name;
  if (cached && cacheMatches) {
    renderWeather(cached.place, cached.weather, true);
  }
}

function showView(viewName) {
  state.activeView = viewName;
  Object.entries({
    home: els.homeView,
    calendar: els.calendarView,
    weather: els.weatherView,
  }).forEach(([name, element]) => {
    element.classList.toggle("is-active", name === viewName);
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === viewName);
  });
}

function renderAll() {
  renderHome();
  renderCalendar();
  renderSelectedDay();
  els.dateJump.value = toInputDate(state.selectedDate);
}

function renderHome() {
  const today = stripTime(new Date());
  const lunar = getLunarInfo(today);
  const badges = getDayBadges(today, lunar);
  const holiday = getHolidayOverride(today);
  const term = getSolarTerm(today);
  const title = `${today.getMonth() + 1}月${today.getDate()}日`;

  els.homeWeek.textContent = `星期${WEEKDAYS[today.getDay()]}`;
  els.homeTitle.textContent = title;
  els.homeLunar.textContent = `${lunar.monthText}${lunar.dayText} · ${lunar.yearName}年`;
  els.homeTodayTitle.textContent = `${today.getFullYear()}年${title}`;
  els.homeTodayMeta.textContent = `第${getWeekOfYear(today)}周 · ${holiday?.name || term || badges[0] || "平日"}`;
  renderTags(els.homeTags, makeTagValues(today, badges, holiday, term), "light");
}

function renderCalendar() {
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  els.calendarTitle.textContent = `${year}年${month + 1}月`;
  els.calendarGrid.innerHTML = "";
  els.dateJump.value = toInputDate(state.selectedDate);

  const first = new Date(year, month, 1);
  const gridStart = addDays(first, -first.getDay());
  const todayKey = toInputDate(new Date());
  const selectedKey = toInputDate(state.selectedDate);

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    const dateKey = toInputDate(date);
    const lunar = getLunarInfo(date);
    const badges = getDayBadges(date, lunar);
    const holiday = getHolidayOverride(date);
    const label = badges[0] || lunar.dayText;
    const button = document.createElement("button");
    button.type = "button";
    button.className = [
      "day-cell",
      date.getMonth() !== month ? "is-outside" : "",
      date.getDay() === 0 || date.getDay() === 6 ? "is-weekend" : "",
      holiday?.type === "rest" ? "is-rest-day" : "",
      holiday?.type === "work" ? "is-work-day" : "",
      dateKey === todayKey ? "is-today" : "",
      dateKey === selectedKey ? "is-selected" : "",
    ].filter(Boolean).join(" ");
    button.dataset.date = dateKey;
    button.setAttribute("aria-label", `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${label}`);
    button.innerHTML = `
      <strong>${date.getDate()}</strong>
      ${holiday ? `<span class="holiday-badge holiday-badge--${holiday.type}">${holiday.type === "rest" ? "休" : "班"}</span>` : ""}
      <span class="festival ${isRedBadge(label) ? "is-red" : ""}">${label}</span>
    `;
    els.calendarGrid.appendChild(button);
  }
}

function renderSelectedDay() {
  const date = state.selectedDate;
  const lunar = getLunarInfo(date);
  const badges = getDayBadges(date, lunar);
  const holiday = getHolidayOverride(date);
  const term = getSolarTerm(date);

  els.selectedTitle.textContent = `${date.getMonth() + 1}月${date.getDate()}日 星期${WEEKDAYS[date.getDay()]}`;
  els.selectedLunar.textContent = `${date.getFullYear()}年 · ${lunar.monthText}${lunar.dayText} · ${lunar.yearName}年`;
  renderTags(els.selectedTags, makeTagValues(date, badges, holiday, term), "color");
}

function renderTags(container, values, style) {
  container.innerHTML = "";
  values.forEach((value, index) => {
    const chip = document.createElement("span");
    const colorClass = style === "light" ? "" : index === 0 && isRedBadge(value) ? " tag--red" : index === 0 ? " tag--blue" : " tag--green";
    chip.className = `tag${colorClass}`;
    chip.textContent = value;
    container.appendChild(chip);
  });
}

function getLunarInfo(date) {
  if (!lunarFormatter) {
    return getFallbackLunar(date);
  }

  try {
    const parts = lunarFormatter.formatToParts(date);
    const yearName = getPart(parts, "yearName") || getYearGanZhi(date);
    const rawMonth = getPart(parts, "month") || "";
    const rawDay = Number(getPart(parts, "day"));
    const leap = rawMonth.startsWith("闰");
    const cleanMonth = rawMonth.replace("闰", "");
    const month = monthNameToNumber(cleanMonth);
    const day = Number.isFinite(rawDay) ? rawDay : 1;
    return {
      yearName,
      month,
      day,
      leap,
      monthText: `${leap ? "闰" : ""}${cleanMonth}`,
      dayText: toChineseDay(day),
    };
  } catch (error) {
    return getFallbackLunar(date);
  }
}

function makeLunarFormatter() {
  try {
    return new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return null;
  }
}

function getFallbackLunar(date) {
  const fakeMonth = date.getMonth() + 1;
  return {
    yearName: getYearGanZhi(date),
    month: fakeMonth,
    day: date.getDate(),
    leap: false,
    monthText: `${CN_NUM[fakeMonth] || fakeMonth}月`,
    dayText: toChineseDay(date.getDate()),
  };
}

function getDayBadges(date, lunar) {
  const badges = [];
  const solarKey = `${date.getMonth() + 1}-${date.getDate()}`;
  const solarFestival = SOLAR_FESTIVALS[solarKey];
  const term = getSolarTerm(date);
  const lunarFestival = !lunar.leap ? LUNAR_FESTIVALS[`${lunar.month}-${lunar.day}`] : "";

  if (solarFestival) badges.push(solarFestival);
  if (term) badges.push(term);
  if (lunarFestival) badges.push(lunarFestival);
  if (isLunarNewYearEve(date)) badges.push("除夕");

  return badges.slice(0, 2);
}

function getSolarTerm(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  for (let i = month * 2; i <= month * 2 + 1; i += 1) {
    if (getSolarTermDay(year, i) === date.getDate()) {
      return SOLAR_TERMS[i];
    }
  }
  return "";
}

function getSolarTermDay(year, index) {
  const base = Date.UTC(1900, 0, 6, 2, 5);
  const offset = 31556925974.7 * (year - 1900) + SOLAR_TERM_INFO[index] * 60000;
  return new Date(base + offset).getUTCDate();
}

function isLunarNewYearEve(date) {
  const tomorrow = getLunarInfo(addDays(date, 1));
  return !tomorrow.leap && tomorrow.month === 1 && tomorrow.day === 1;
}

async function refreshWeather() {
  if (state.weatherPlace === CURRENT_PLACE_KEY) {
    refreshCurrentLocationWeather();
    return;
  }

  const place = CITIES[state.weatherPlace] || CITIES.xiamen;
  setWeatherLoading(place);

  try {
    const weather = await fetchWeather(place);
    localStorage.setItem(WEATHER_CACHE_STORAGE, JSON.stringify({ place, weather, savedAt: Date.now() }));
    renderWeather(place, weather, false);
  } catch (error) {
    const cached = getCachedWeather();
    if (cached) {
      renderWeather(cached.place, cached.weather, true);
    } else {
      renderWeatherFallback(place);
    }
  }
}

function enableCurrentLocationWeather() {
  state.weatherPlace = CURRENT_PLACE_KEY;
  els.citySelect.value = CURRENT_PLACE_KEY;
  localStorage.setItem(WEATHER_PLACE_STORAGE, CURRENT_PLACE_KEY);
  refreshCurrentLocationWeather();
}

async function refreshCurrentLocationWeather() {
  const currentPlace = { name: "当前位置", latitude: 0, longitude: 0 };
  setWeatherLoading(currentPlace);

  try {
    const place = await getCurrentPositionPlace();
    const weather = await fetchWeather(place);
    localStorage.setItem(WEATHER_CACHE_STORAGE, JSON.stringify({ place, weather, savedAt: Date.now() }));
    renderWeather(place, weather, false);
  } catch (error) {
    const cached = getCachedWeather();
    if (cached?.place?.name === "当前位置") {
      renderWeather(cached.place, cached.weather, true);
      els.weatherSource.textContent = "定位失败 · 显示上次当前位置缓存";
      els.homeWeatherSource.textContent = "定位失败 · 上次缓存";
      return;
    }
    renderWeatherFallback(currentPlace);
    const message = window.isSecureContext ? "定位未授权" : "定位需要 HTTPS，GitHub Pages 上可用";
    els.weatherSource.textContent = message;
    els.homeWeatherSource.textContent = message;
  }
}

function getCurrentPositionPlace() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: "当前位置",
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
        });
      },
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  });
}

async function fetchWeather(place) {
  const forecastParams = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
    hourly: "temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
    forecast_days: "14",
    timezone: "auto",
  });
  const airParams = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "us_aqi,pm2_5",
    timezone: "auto",
  });

  const [forecastResponse, airResponse] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`, { cache: "no-store" }),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams.toString()}`, { cache: "no-store" }),
  ]);

  if (!forecastResponse.ok) {
    throw new Error(`weather ${forecastResponse.status}`);
  }

  const forecast = await forecastResponse.json();
  const air = airResponse.ok ? await airResponse.json() : null;
  return { forecast, air };
}

function setWeatherLoading(place) {
  els.homeWeatherDesc.textContent = `${place.name} · 正在获取天气`;
  els.homeWeatherSource.textContent = "正在连接 Open-Meteo";
  els.weatherTitle.textContent = "正在获取天气";
  els.weatherSource.textContent = "正在连接 Open-Meteo";
  els.homeWeatherIcon.innerHTML = getWeatherIcon(null);
  els.weatherMainIcon.innerHTML = getWeatherIcon(null);
}

function renderWeather(place, weather, fromCache = false) {
  state.lastWeather = { place, weather, fromCache };
  const forecast = weather.forecast || {};
  const air = weather.air || {};
  const current = forecast.current || {};
  const daily = forecast.daily || {};
  const temp = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  const desc = getWeatherText(current.weather_code, current.precipitation, false);
  const detail = WEATHER_DETAILS[current.weather_code] || "";
  const aqi = air.current?.us_aqi;
  const airText = getAirQualityText(aqi);
  const sourceText = fromCache ? "上次缓存 · 联网后刷新" : `Open-Meteo 在线天气 · ${formatWeatherTime(current.time)}`;

  els.homeWeatherTemp.textContent = Number.isFinite(temp) ? `${temp}°` : "--°";
  els.homeWeatherDesc.textContent = `${place.name} · ${desc}`;
  els.homeWeatherIcon.innerHTML = getWeatherIcon(current.weather_code);
  els.homeWeatherMeta.textContent = `体感 ${Number.isFinite(feels) ? `${feels}°` : "--°"} · 湿度 ${formatNumber(current.relative_humidity_2m)}%`;
  els.homeWeatherSource.textContent = sourceText;

  els.weatherTemp.textContent = Number.isFinite(temp) ? `${temp}°` : "--°";
  els.weatherTitle.textContent = desc;
  els.weatherMainIcon.innerHTML = getWeatherIcon(current.weather_code);
  els.weatherAir.textContent = airText;
  els.weatherFeels.textContent = `体感 ${Number.isFinite(feels) ? `${feels}°C` : "--°C"}`;
  els.weatherWind.textContent = `风速 ${formatNumber(current.wind_speed_10m)} km/h`;
  els.weatherHumidity.textContent = `湿度 ${formatNumber(current.relative_humidity_2m)}%`;
  els.weatherTip.textContent = getRainTip(forecast, detail);
  els.weatherSource.textContent = sourceText;

  renderHourly(forecast);
  renderForecast(daily);
}

function renderHourly(forecast) {
  const hours = getNextHours(forecast, 2);
  els.hourlyStrip.innerHTML = "";
  els.hourlyUpdate.textContent = hours.length ? "按本地时间" : "暂无逐小时数据";

  for (let i = 0; i < 2; i += 1) {
    const hour = hours[i];
    const item = document.createElement("div");
    item.className = "hour-card";
    if (hour) {
      item.innerHTML = `
        <span>${formatHourLabel(hour.time, i)}</span>
        ${getWeatherIcon(hour.code)}
        <strong>${formatNumber(hour.temp)}°C</strong>
        <em>${getWeatherText(hour.code, hour.amount, false)} · ${formatRain(hour.rain, hour.amount)}</em>
        <small>风速 ${formatNumber(hour.wind)} km/h</small>
      `;
    } else {
      item.innerHTML = `
        <span>${i === 0 ? "下一小时" : "第二小时"}</span>
        ${getWeatherIcon(null)}
        <strong>--°C</strong>
        <em>待联网</em>
        <small>风速 --</small>
      `;
    }
    els.hourlyStrip.appendChild(item);
  }
}

function renderForecast(daily) {
  els.forecastStrip.innerHTML = "";
  const count = Math.min(daily.time?.length || 14, 14);
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement("div");
    item.className = "forecast-day";
    const date = daily.time?.[i] ? parseDateInput(daily.time[i]) : addDays(new Date(), i);
    const max = Math.round(daily.temperature_2m_max?.[i]);
    const min = Math.round(daily.temperature_2m_min?.[i]);
    const rain = daily.precipitation_probability_max?.[i];
    const rainSum = daily.precipitation_sum?.[i];
    const code = daily.weather_code?.[i];
    item.innerHTML = `
      <span>${i === 0 ? "今天" : i === 1 ? "明天" : `周${WEEKDAYS[date.getDay()]}`} · ${pad(date.getMonth() + 1)}/${pad(date.getDate())}</span>
      ${getWeatherIcon(code)}
      <strong>${getWeatherText(code, rainSum, true)}</strong>
      <em>${Number.isFinite(min) && Number.isFinite(max) ? `${min}/${max}°C` : "--/--°C"}${Number.isFinite(rain) ? ` · ${rain}%` : ""}${Number.isFinite(rainSum) ? ` · ${rainSum.toFixed(1)}mm` : ""}</em>
    `;
    els.forecastStrip.appendChild(item);
  }
}

function renderWeatherFallback(place) {
  els.homeWeatherTemp.textContent = "--°";
  els.homeWeatherDesc.textContent = `${place.name} · 天气暂不可用`;
  els.homeWeatherIcon.innerHTML = getWeatherIcon(null);
  els.homeWeatherMeta.textContent = "请联网后刷新";
  els.homeWeatherSource.textContent = "未获取到在线天气";

  els.weatherTemp.textContent = "--°";
  els.weatherTitle.textContent = "天气暂不可用";
  els.weatherMainIcon.innerHTML = getWeatherIcon(null);
  els.weatherAir.textContent = "空气 --";
  els.weatherFeels.textContent = "体感 --°C";
  els.weatherWind.textContent = "风速 --";
  els.weatherHumidity.textContent = "湿度 --";
  els.weatherTip.textContent = "需要联网获取实时天气";
  els.weatherSource.textContent = "未获取到在线天气";
  renderHourly({});
  renderForecast({});
}

function getCachedWeather() {
  try {
    const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_STORAGE) || "null");
    if (!cached || !cached.weather || !cached.place) return null;
    return cached;
  } catch (error) {
    return null;
  }
}

function makeTagValues(date, badges, holiday, term) {
  const values = [];
  if (holiday) values.push(`${holiday.type === "rest" ? "休" : "班"} ${holiday.name}`);
  values.push(...badges);
  if (!values.length && term) values.push(term);
  if (!values.length) values.push(isWeekend(date) ? "周末" : "工作日");
  return [...new Set(values)].slice(0, 4);
}

function getHolidayOverride(date) {
  return HOLIDAY_OVERRIDES[toInputDate(date)] || null;
}

function changeMonth(delta) {
  const nextMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + delta, 1);
  const targetDay = Math.min(state.selectedDate.getDate(), daysInMonth(nextMonth));
  state.currentMonth = nextMonth;
  state.selectedDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), targetDay);
  renderCalendar();
  renderSelectedDay();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function getRainTip(forecast, detail = "") {
  const nextHours = getNextHours(forecast, 2);
  const probabilities = nextHours.map((hour) => hour.rain).filter(Number.isFinite);
  const amounts = nextHours.map((hour) => hour.amount).filter(Number.isFinite);
  if (!probabilities.length && !amounts.length) return detail || "联网后显示短时天气趋势";

  const maxProbability = probabilities.length ? Math.max(...probabilities) : 0;
  const totalAmount = amounts.reduce((sum, value) => sum + value, 0);

  if (totalAmount <= 0 && maxProbability >= 50) return "模型提示有降雨风险，当前雨量为0，可结合临近雷达判断";
  if (totalAmount <= 0.2 && maxProbability >= 50) return "未来两小时有降雨风险，但模型雨量很小";
  if (maxProbability < 20) return "未来两小时降雨概率较低";
  if (maxProbability < 55) return "未来两小时可能有零星降雨";
  return detail || "未来两小时降雨概率较高，出门记得带伞";
}

function getNextHours(forecast, count) {
  const hourly = forecast.hourly || {};
  const times = hourly.time || [];
  if (!times.length) return [];
  const currentTime = forecast.current?.time || times[0];
  const currentMs = Date.parse(currentTime);
  const start = times.findIndex((time) => Date.parse(time) > currentMs);
  const safeStart = start >= 0 ? start : 0;
  return times.slice(safeStart, safeStart + count).map((time, index) => ({
    time,
    temp: hourly.temperature_2m?.[safeStart + index],
    code: hourly.weather_code?.[safeStart + index],
    rain: hourly.precipitation_probability?.[safeStart + index],
    amount: hourly.precipitation?.[safeStart + index],
    wind: hourly.wind_speed_10m?.[safeStart + index],
  }));
}

function formatRain(probability, amount) {
  const parts = [];
  if (Number.isFinite(probability)) parts.push(`概率${Math.round(probability)}%`);
  if (Number.isFinite(amount)) parts.push(`雨量${amount.toFixed(1)}mm`);
  return parts.length ? parts.join(" · ") : "待联网";
}

function getWeatherText(code, rainAmount, isDaily) {
  const base = WEATHER_CODES[code] || "天气";
  if ((code === 95 || code === 96 || code === 99) && !isDaily && Number.isFinite(rainAmount) && rainAmount <= 0) {
    return "雷阵雨风险";
  }
  return base;
}

function formatHourLabel(value, index) {
  if (!value) return index === 0 ? "下一小时" : "第二小时";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return index === 0 ? "下一小时" : "第二小时";
  return `${pad(date.getHours())}:00`;
}

function getAirQualityText(aqi) {
  if (!Number.isFinite(aqi)) return "空气 --";
  if (aqi <= 50) return `空气 优 ${Math.round(aqi)}`;
  if (aqi <= 100) return `空气 良 ${Math.round(aqi)}`;
  if (aqi <= 150) return `空气 轻度 ${Math.round(aqi)}`;
  if (aqi <= 200) return `空气 中度 ${Math.round(aqi)}`;
  return `空气 较差 ${Math.round(aqi)}`;
}

function getWeatherIcon(code) {
  const type = getWeatherIconType(code);
  const label = WEATHER_CODES[code] || "天气";
  const iconId = `wx-${type}-${code ?? "na"}-${Math.random().toString(36).slice(2, 8)}`;
  if (type === "sun") {
    return `
      <svg class="weather-icon weather-icon--sun" viewBox="0 0 96 96" role="img" aria-label="${label}">
        <circle cx="48" cy="48" r="20" fill="#ffc83d"/>
        <g stroke="#ffc83d" stroke-width="7" stroke-linecap="round">
          <path d="M48 10v10"/><path d="M48 76v10"/><path d="M10 48h10"/><path d="M76 48h10"/>
          <path d="M21 21l7 7"/><path d="M68 68l7 7"/><path d="M75 21l-7 7"/><path d="M28 68l-7 7"/>
        </g>
      </svg>
    `;
  }

  if (type === "partly") {
    return `
      <svg class="weather-icon weather-icon--partly" viewBox="0 0 96 96" role="img" aria-label="${label}">
        <circle cx="35" cy="36" r="18" fill="#ffc83d"/>
        <g stroke="#ffc83d" stroke-width="5" stroke-linecap="round">
          <path d="M35 8v8"/><path d="M12 36h8"/><path d="M54 17l-6 6"/><path d="M17 17l6 6"/>
        </g>
        <path d="M32 70h38c9 0 16-6 16-15 0-8-6-14-14-15-4-11-14-19-27-19-14 0-26 10-28 24C8 47 2 54 2 62c0 5 4 8 10 8h20z" fill="url(#${iconId}-cloudBlue)" opacity=".96"/>
        <defs>
          <linearGradient id="${iconId}-cloudBlue" x1="28" y1="28" x2="64" y2="78" gradientUnits="userSpaceOnUse">
            <stop stop-color="#d9f3ff"/><stop offset="1" stop-color="#78b8f4"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  if (type === "cloud") {
    return `
      <svg class="weather-icon weather-icon--cloud" viewBox="0 0 96 96" role="img" aria-label="${label}">
        <path d="M24 68h44c11 0 20-8 20-18 0-10-8-18-18-18h-2C63 21 52 14 40 14 24 14 11 27 11 43v2C4 47 0 53 0 60c0 5 5 8 12 8h12z" fill="url(#${iconId}-cloudOnlyBlue)"/>
        <defs>
          <linearGradient id="${iconId}-cloudOnlyBlue" x1="22" y1="16" x2="66" y2="74" gradientUnits="userSpaceOnUse">
            <stop stop-color="#edf7ff"/><stop offset="1" stop-color="#9cc7ed"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  if (type === "snow") {
    return `
      <svg class="weather-icon weather-icon--snow" viewBox="0 0 96 96" role="img" aria-label="${label}">
        <path d="M22 52h44c10 0 18-7 18-16 0-8-7-15-16-15h-2C62 12 52 6 41 6 26 6 14 18 14 32v2C7 36 2 42 2 48c0 3 3 4 8 4h12z" fill="url(#${iconId}-snowCloudBlue)"/>
        <g stroke="#78b8f4" stroke-width="5" stroke-linecap="round">
          <path d="M28 68v18"/><path d="M19 77h18"/><path d="M22 71l12 12"/><path d="M34 71L22 83"/>
          <path d="M62 68v18"/><path d="M53 77h18"/><path d="M56 71l12 12"/><path d="M68 71L56 83"/>
        </g>
        <defs>
          <linearGradient id="${iconId}-snowCloudBlue" x1="20" y1="8" x2="64" y2="58" gradientUnits="userSpaceOnUse">
            <stop stop-color="#eef9ff"/><stop offset="1" stop-color="#9fc9ef"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  const bolt = type === "thunder" ? '<path d="M54 45h14L57 65h10L43 92l8-25H40z" fill="#ffd23f"/>' : "";
  return `
    <svg class="weather-icon weather-icon--rain" viewBox="0 0 96 96" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="${iconId}-dropBlue" x1="28" y1="10" x2="54" y2="78" gradientUnits="userSpaceOnUse">
          <stop stop-color="#d7f6ff"/><stop offset=".54" stop-color="#8ed3ff"/><stop offset="1" stop-color="#5f9df0"/>
        </linearGradient>
        <linearGradient id="${iconId}-dropBlueSmall" x1="58" y1="30" x2="75" y2="82" gradientUnits="userSpaceOnUse">
          <stop stop-color="#edfaff"/><stop offset="1" stop-color="#83bff6"/>
        </linearGradient>
      </defs>
      <path d="M43 8C32 27 20 42 20 58c0 14 10 25 24 25 13 0 24-11 24-25C68 42 55 27 43 8z" fill="url(#${iconId}-dropBlue)"/>
      <path d="M66 32C58 45 50 56 50 68c0 10 8 18 18 18 9 0 17-8 17-18 0-12-9-23-19-36z" fill="url(#${iconId}-dropBlueSmall)" opacity=".92"/>
      ${bolt}
    </svg>
  `;
}

function getWeatherIconType(code) {
  if (code == null) return "cloud";
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "partly";
  if (code === 3 || code === 45 || code === 48) return "cloud";
  if (code >= 71 && code <= 86) return "snow";
  if (code >= 95) return "thunder";
  return "rain";
}

function formatWeatherTime(value) {
  if (!value) return "已更新";
  const [, time = ""] = value.split("T");
  return time ? `${time}更新` : "已更新";
}

function isRedBadge(value) {
  return ["元旦", "春节", "元宵", "端午", "中秋", "国庆节", "劳动节", "建党节", "建军节", "初伏", "中伏", "末伏"].includes(value);
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function monthNameToNumber(monthName) {
  const normalized = monthName.replace("十一", "冬").replace("十二", "腊");
  const names = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  const stem = normalized.replace("月", "");
  const index = names.indexOf(stem);
  return index >= 0 ? index + 1 : 1;
}

function toChineseDay(day) {
  if (day === 10) return "初十";
  if (day === 20) return "二十";
  if (day === 30) return "三十";
  const tens = Math.floor(day / 10);
  const ones = day % 10;
  return `${CN_DAY_PREFIX[tens]}${CN_NUM[ones]}`;
}

function getYearGanZhi(date) {
  const year = date.getFullYear();
  return `${GAN[(year - 4) % 10]}${ZHI[(year - 4) % 12]}`;
}

function getWeekOfYear(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const diff = stripTime(date) - stripTime(firstDay);
  return Math.ceil((diff / 86400000 + firstDay.getDay() + 1) / 7);
}

function getPart(parts, type) {
  return parts.find((part) => part.type === type)?.value || "";
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date) {
  const clean = stripTime(date);
  return `${clean.getFullYear()}-${pad(clean.getMonth() + 1)}-${pad(clean.getDate())}`;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value) : "--";
}
