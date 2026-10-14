import fallback from './app-store.json' with { type: 'json' };

async function getApp() {
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${fallback.trackId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Apple returned ${response.status}`);

    const { results } = await response.json();
    const result = results?.find(({ trackId }) => trackId === fallback.trackId);
    if (!result?.trackName || !result.formattedPrice || !result.trackViewUrl) {
      throw new Error('Apple returned incomplete app metadata');
    }

    const url = new URL(result.trackViewUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com') {
      throw new Error('Apple returned an invalid download link');
    }

    return {
      trackId: result.trackId,
      trackName: result.trackName,
      formattedPrice: result.formattedPrice,
      trackViewUrl: url.href,
    };
  } catch (error) {
    console.warn(`App Store lookup failed; using saved metadata. ${error.message}`);
    return fallback;
  }
}

// Astro evaluates this module at build time; all pages share the same lookup.
export const app = await getApp();
export const description = 'Get through your tasks by putting your phone away. To start the timer, put your device on the table, screen facing down. When the timer finishes, you will hear a chime. Enjoy your break and restart when you’re ready again!';
