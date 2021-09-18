const request = require("request");

/**
 * @typedef {string} EmojiLiteral
 * @returns {Promise<{ [githubEmojiId: string]: EmojiLiteral | [string] }>}
 */
async function getGithubEmojiIdMap() {
  return Object.fromEntries(
    Object.entries(
      /** @type {{ [id: string]: string }} */ (await fetchJson(
        "https://api.github.com/emojis",
        {
          headers: {
            "User-Agent": "https://github.com/ikatyang/emoji-cheat-sheet"
          }
        }
      ))
    ).filter(([id, url]) => url.includes("/unicode/"))
    .map(([id, url]) => [
      `:${id}:`,
      getLast(url.split("/"))
            .split(".png")[0]
            .replace("-", "-200d-")
            .split("-")
            .map(codePointText =>
              String.fromCodePoint(Number.parseInt(codePointText, 16))
            )
            .join("")
    ])
  );
}

/**
 * @template T
 * @param {Array<T>} array
 */
 function getLast(array) {
  return array[array.length - 1];
}

/**
 * @param {string} url
 * @param {Partial<request.Options>} options
 * @returns {Promise<any>}
 */
async function fetchJson(url, options = {}) {
  return JSON.parse(await fetch(url, options));
}

/**
 * @param {string} url
 * @param {Partial<request.Options>} options
 * @returns {Promise<string>}
 */
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    request.get(
      /** @type {request.Options} */ ({ url, ...options }),
      (error, response, html) => {
        if (!error && response.statusCode === 200) {
          resolve(html);
        } else {
          reject(
            error
              ? error
              : `Unexpected response status code: ${response.statusCode}`
          );
        }
      }
    );
  });
}

async function main() {
  getGithubEmojiIdMap().then((res) => {
    // console.log(res)

    const json = JSON.stringify(res, undefined, 2);

    const ts = "export const emoji = " + json

    var fs = require('fs');
    fs.writeFile("test.ts", ts, function(err) {
        if (err) {
            console.log(err);
        }
    });

  }).catch((err) => {
    console.error(err)
  })
}

if (require.main === module) {
  main();
}