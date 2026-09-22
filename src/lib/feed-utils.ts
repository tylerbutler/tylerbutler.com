const TINYLYTICS_PIXEL_URL =
  "https://tinylytics.app/pixel/7vP3rWZsVnwMyLpSbFxs.gif";

export function addFeedTrackingPixel(html: string, path: string): string {
  const pixelUrl = new URL(TINYLYTICS_PIXEL_URL);
  pixelUrl.searchParams.set("path", path);

  return `${html}<img src="${pixelUrl}" alt="" width="1" height="1" />`;
}
