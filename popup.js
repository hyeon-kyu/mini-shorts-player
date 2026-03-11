const form = document.getElementById("shorts-form");
const input = document.getElementById("shorts-url");
const statusEl = document.getElementById("status");
const player = document.getElementById("player");

const LAST_URL_KEY = "lastShortsUrl";

function setStatus(message = "") {
  statusEl.textContent = message;
}

function extractVideoId(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const idFromPath = url.pathname.split("/").filter(Boolean)[0];
    return idFromPath || null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  if (url.pathname.startsWith("/shorts/")) {
    const idFromShorts = url.pathname.split("/")[2];
    return idFromShorts || null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  return null;
}

function buildEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1"
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function playFromUrl(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    setStatus("유효한 YouTube Shorts/영상 URL이 아닙니다.");
    return;
  }

  player.src = buildEmbedUrl(videoId);
  chrome.storage.local.set({ [LAST_URL_KEY]: url });
  setStatus("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  playFromUrl(input.value.trim());
});

chrome.storage.local.get([LAST_URL_KEY], (result) => {
  const lastUrl = result[LAST_URL_KEY];
  if (!lastUrl) {
    return;
  }

  input.value = lastUrl;
  playFromUrl(lastUrl);
});
