/**
 * @typedef {import('./types').FetchResult} FetchResult
 */

const _sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * @param {string} url
 * @param {string} id
 * @return {Promise<FetchResult>}
 */
export const fetch = async (url, id) => {
  await _sleep(Math.floor(Math.random() * 2) * 1000);
  return {
    ok: true,
    ts: Date.now(),
  };
};
