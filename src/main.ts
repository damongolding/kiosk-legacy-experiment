import "./kiosk-legacy.css";
import $ from "jquery";

let kioskData: KioskData;

const kioskURL = import.meta.env.VITE_KIOSK_URL || "http://localhost:3000";

const generateRandomId = (length: number = 7): string =>
  Array.from(
    { length },
    () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)],
  ).join("");

const cssLink = document.createElement("link");
cssLink.rel = "stylesheet";
cssLink.href = `${kioskURL}/assets/css/kiosk.${generateRandomId()}.css`;
document.head.appendChild(cssLink);

$(async () => {
  const k = $("#kiosk");
  const p = $(".progress--bar");
  p.css("width", "0");
  let duration = 60;
  const fadeDuration = 1500;

  const params: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params[key] = value;
  });

  const init = async () => {
    await $.get(
      `${kioskURL}/`,
      params,
      (homeData) => {
        const kioskHomeHTML = $(homeData);
        const kioskDataElement = kioskHomeHTML.find("#kiosk-data");
        const customCSS = kioskHomeHTML.filter("#custom-css-style-tag");

        console.log(kioskHomeHTML, customCSS);
        if (customCSS.length) {
          $("head").append(customCSS.clone());
        }

        if (!kioskDataElement.length) return;

        // parse kiosk data
        kioskData = JSON.parse(kioskDataElement.text());

        // Add progress bar if wanted
        if (params.show_progress_bar !== "false") {
          const hasProgressBar = kioskHomeHTML.find(".progress--bar");
          if (
            hasProgressBar.length !== 0 ||
            params.show_progress_bar === "true"
          ) {
            p.css("display", "block");
          }
        }

        // log version
        console.log(
          `\nImmich Kiosk (legacy) version: %c${kioskData.version}`,
          "color: white; font-weight:600; background-color:#1e83f7; padding:0.3rem 1rem; border-radius:4px;",
          "\n\n",
        );
      },
      "html",
    );

    duration = parseInt(params.duration, 10) || kioskData.duration;

    await loadAsset();

    setInterval(() => loadAsset(), duration * 1000 + fadeDuration * 2);
  };

  async function resetProgressBar(): Promise<void> {
    p.stop(true, false)
      .css("width", "0%")
      .animate({ width: "100%" }, duration * 1000, "linear");
  }

  async function loadAsset(): Promise<void> {
    await k.animate({ opacity: 0 }, fadeDuration).promise();

    await new Promise<void>((resolve) => {
      k.load(`${kioskURL}/asset/new`, params, () => {
        resetProgressBar();
        resolve();
      });
    });

    await k.animate({ opacity: 1 }, fadeDuration).promise();
  }

  init();
});
