(() => {
  const params = new URLSearchParams(window.location.search);
  const rawUrl = params.get("url");

  const tryOriginalLink = document.getElementById("try-original-link");
  if (!(tryOriginalLink instanceof HTMLAnchorElement)) return;

  if (!rawUrl) {
    tryOriginalLink.style.display = "none";
    return;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      tryOriginalLink.href = parsed.toString();
      return;
    }
  } catch {
    // Ignore invalid URL values and hide the fallback link.
  }

  tryOriginalLink.style.display = "none";
})();
