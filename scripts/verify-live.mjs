const CANONICAL_ORIGIN = "https://martinmotion.co";
const LEGACY_ORIGIN = "https://martin-motion.vercel.app";
const MEDIA_SAMPLE = "https://martin-motion-media.martinbarbe09.workers.dev/videos/joynit.mp4";

async function assertFetch(url, expectedStatus = 200, options = {}) {
  const response = await fetch(url, options);
  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned ${response.status}, expected ${expectedStatus}`);
  }
  return response;
}

async function main() {
  const homeResponse = await assertFetch(`${CANONICAL_ORIGIN}/`);
  const homeHtml = await homeResponse.text();

  if (homeHtml.includes(LEGACY_ORIGIN)) {
    throw new Error(`Home HTML still references legacy domain: ${LEGACY_ORIGIN}`);
  }

  for (const required of [
    '<link rel="canonical" href="https://martinmotion.co/"',
    'property="og:url" content="https://martinmotion.co/"',
    'property="twitter:url" content="https://martinmotion.co/"'
  ]) {
    if (!homeHtml.includes(required)) {
      throw new Error(`Missing expected canonical markup: ${required}`);
    }
  }

  await assertFetch(`${CANONICAL_ORIGIN}/portfolio`);
  await assertFetch(`${CANONICAL_ORIGIN}/robots.txt`);
  await assertFetch(`${CANONICAL_ORIGIN}/sitemap.xml`);

  await assertFetch(MEDIA_SAMPLE, 206, {
    headers: { Range: "bytes=0-1023" }
  });

  console.log("Live verification passed for martinmotion.co");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
