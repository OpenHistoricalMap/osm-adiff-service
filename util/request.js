const fetch = require('node-fetch');
const https = require('https');
const { URL } = require('url');
const { version } = require("../package.json");

async function request(url, options = {}) {
  let res = await fetch(url);

  if (res.ok) {
    return res;
  } else {
    let error = new Error(`HTTP ${res.status} ${res.statusText}`);
    error.status = res.status;
    error.statusText = res.statusText;
    throw error;
  }
}

async function requestHttps(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': options.headers?.['User-Agent'] || `OSMCha osm-adiff-service ${version}`,
        'Accept': options.headers?.['Accept'] || 'application/xml',
        'Accept-Encoding': options.headers?.['Accept-Encoding'] || 'identity'
      }
    };

    const req = https.request(reqOptions, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(res);
      } else {
        const error = new Error(`HTTP ${res.statusCode} ${res.statusMessage}`);
        error.status = res.statusCode;
        error.statusText = res.statusMessage;
        reject(error);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = { request, requestHttps };
