const cacheDirectory = ".cache/og-images";

export async function onPreBuild({ utils }) {
  await utils.cache.restore(cacheDirectory);
}

export async function onPostBuild({ utils }) {
  await utils.cache.save(cacheDirectory);
}
