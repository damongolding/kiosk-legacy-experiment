import $ from "jquery";

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
  const fadeDuration = 1500;

  const params: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params[key] = value;
  });

  const duration = parseInt(params.duration || "10", 10);

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

  await loadAsset();

  setInterval(() => loadAsset(), duration * 1000 + fadeDuration * 2);
});
