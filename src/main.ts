import "./kiosk-legacy.css";
import $ from "jquery";

// ---------------------------------------------------------------------------
// Config & constants
// ---------------------------------------------------------------------------

const KIOSK_URL =
  import.meta.env.VITE_KIOSK_URL || ("http://localhost:3000" as const);
const FADE_DURATION_MS = 1500 as const;
const POLL_INTERVAL_MS = 15_000 as const;
const ID_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Params = Record<string, string>;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function generateRandomId(length = 7): string {
  return Array.from(
    { length },
    () => ID_CHARSET[Math.floor(Math.random() * ID_CHARSET.length)],
  ).join("");
}

function getUrlParams(): Params {
  const params: Params = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/** Promisified jQuery .load() */
function jqLoad(el: JQuery, url: string, params: Params): Promise<void> {
  return new Promise((resolve) =>
    el.load(url, params, () => {
      // Image with external src (animated GIFs) -> convert to data URL
      el.find("img").each((_, img) => {
        const $img = $(img);
        if (!$img.attr("src")?.startsWith("data:")) {
          const src = $img.attr("src") ?? "";
          $img.attr("src", new URL(src, KIOSK_URL).href);
        }
      });

      // Video support WIP
      // el.find("source").each((_, videoSource) => {
      //   const $videoSource = $(videoSource);
      //   if (!$videoSource.attr("src")?.startsWith("data:")) {
      //     const src = $videoSource.attr("src") ?? "";
      //     $videoSource.attr("src", new URL(src, KIOSK_URL).href);
      //   }
      // });

      return resolve();
    }),
  );
}

/** Promisified jQuery .animate() */
async function jqAnimate(
  el: JQuery,
  props: JQuery.PlainObject,
  duration: number,
): Promise<void> {
  return el
    .animate(props, duration)
    .promise()
    .then(() => undefined);
}

// ---------------------------------------------------------------------------
// CSS injection
// ---------------------------------------------------------------------------

function injectKioskStylesheet(): void {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${KIOSK_URL}/assets/css/kiosk.${generateRandomId()}.css`;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Remote fragment loaders
// ---------------------------------------------------------------------------

async function refreshClock(el: JQuery, params: Params): Promise<void> {
  await jqLoad(el, `${KIOSK_URL}/clock`, params);
}

async function refreshWeather(
  el: JQuery,
  params: Params,
  rotate: boolean,
): Promise<void> {
  if (!rotate) {
    await jqLoad(el, `${KIOSK_URL}/weather`, params);
    return;
  }

  const weatherRotate =
    el.find(".weather").attr("data-weather-position") ?? "0";

  params.weather_rotation = weatherRotate;
  el.css("transition", "none");
  await jqAnimate(el, { opacity: 0 }, FADE_DURATION_MS);
  await jqLoad(el, `${KIOSK_URL}/weather`, params);
  await jqAnimate(el, { opacity: 1 }, FADE_DURATION_MS);
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function animateProgressBar(progressBar: JQuery, durationSec: number): void {
  progressBar
    .stop(true, false)
    .css("width", "0%")
    .animate({ width: "100%" }, durationSec * 1000, "linear");
}

// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------

async function loadNextAsset(
  kiosk: JQuery,
  progressBar: JQuery,
  params: Params,
  durationSec: number,
): Promise<void> {
  await jqAnimate(kiosk, { opacity: 0 }, FADE_DURATION_MS);

  const assetURL = params.offline
    ? `${KIOSK_URL}/asset/offline`
    : `${KIOSK_URL}/asset/new`;

  await jqLoad(kiosk, assetURL, params);

  animateProgressBar(progressBar, durationSec);
  await jqAnimate(kiosk, { opacity: 1 }, FADE_DURATION_MS);
}

// ---------------------------------------------------------------------------
// Home page bootstrap
// ---------------------------------------------------------------------------

async function fetchHomeHTML(params: Params): Promise<JQuery> {
  return new Promise((resolve, reject) => {
    $.get(`${KIOSK_URL}/`, params, (html) => resolve($(html)), "html").fail(
      reject,
    );
  });
}

function applyCustomCSS(homeHTML: JQuery): void {
  const customCSS = homeHTML.filter("#custom-css-style-tag");
  if (customCSS.length) {
    $("head").append(customCSS.clone());
  }
}

function setupClock(homeHTML: JQuery, params: Params): void {
  const kioskClock = homeHTML.find("#clock");
  if (!kioskClock.length) return;

  const clock = $("#clock");
  clock.addClass(kioskClock.attr("class") ?? "");

  refreshClock(clock, params);
  setInterval(() => refreshClock(clock, params), POLL_INTERVAL_MS);
}

async function setupWeather(homeHTML: JQuery, params: Params): void {
  const kioskWeather = homeHTML.find("#weather-container");
  if (!kioskWeather.length) return;

  const weather = $("#weather-container");
  weather.addClass(kioskWeather.attr("class") ?? "");

  let weatherRotate = false;
  if (params.weather === "rotate") {
    weatherRotate = true;
    params.weather_rotation = "0";
  }

  await refreshWeather(weather, params, weatherRotate);
  setInterval(
    () => refreshWeather(weather, params, weatherRotate),
    POLL_INTERVAL_MS,
  );
}

function setupProgressBar(
  homeHTML: JQuery,
  progressBar: JQuery,
  params: Params,
): void {
  if (params.show_progress_bar === "false") return;

  const hasProgressBar = homeHTML.find(".progress--bar").length > 0;
  const forceShow = params.show_progress_bar === "true";

  if (hasProgressBar || forceShow) {
    progressBar.css("display", "block");
  }
}

function parseKioskData(homeHTML: JQuery): KioskData {
  const dataEl = homeHTML.find("#kiosk-data");
  if (!dataEl.length) throw new Error("Missing #kiosk-data element");
  return JSON.parse(dataEl.text());
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(params: Params): Promise<void> {
  const kiosk = $("#kiosk");
  const progressBar = $(".progress--bar").css("width", "0");

  const homeHTML = await fetchHomeHTML(params);
  const kioskData = parseKioskData(homeHTML);

  console.log(
    `\nImmich Kiosk (legacy) version: %c${kioskData.version}`,
    "color: white; font-weight:600; background-color:#1e83f7; padding:0.3rem 1rem; border-radius:4px;",
    "\n\n",
  );

  applyCustomCSS(homeHTML);
  setupClock(homeHTML, params);
  setupWeather(homeHTML, params);
  setupProgressBar(homeHTML, progressBar, params);

  const durationSec = parseInt(params.duration, 10) || kioskData.duration;
  const assetPollDuration = durationSec * 1000 + FADE_DURATION_MS * 2;

  const assetPoll = () =>
    loadNextAsset(kiosk, progressBar, params, durationSec);

  await assetPoll();
  setInterval(assetPoll, assetPollDuration);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

injectKioskStylesheet();

$(async () => {
  const params = getUrlParams();
  await main(params);
});
