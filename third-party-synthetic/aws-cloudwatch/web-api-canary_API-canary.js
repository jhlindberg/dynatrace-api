var synthetics = require('Synthetics');
const log = require('SyntheticsLogger');
const https = require('https');
const http = require('http');

const apiCanaryBlueprint = async function () {
    const postData = "";

    const verifyRequest = async function (requestOption) {
      return new Promise((resolve, reject) => {
        log.info("Making request with options: " + JSON.stringify(requestOption));
        let req
        if (requestOption.port === 443) {
          req = https.request(requestOption);
        } else {
          req = http.request(requestOption);
        }
        req.on('response', (res) => {
          log.info(`Status Code: ${res.statusCode}`)
          log.info(`Response Headers: ${JSON.stringify(res.headers)}`)
          if (res.statusCode !== 200) {
             reject("Failed: " + requestOption.path);
          }
          res.on('data', (d) => {
            log.info("Response: " + d);
          });
          res.on('end', () => {
            resolve();
          })
        });

        req.on('error', (error) => {
          reject(error);
        });

        if (postData) {
          req.write(postData);
        }
        req.end();
      });
    }

    const headers = {}
    headers['User-Agent'] = [synthetics.getCanaryUserAgentString(), headers['User-Agent']].join(' ');
    const requestOptions = {"hostname":"safe-plains-70900.herokuapp.com","method":"GET","path":"/unavailable","port":443}
    requestOptions['headers'] = headers;
    await verifyRequest(requestOptions);
};

exports.handler = async () => {
    return await apiCanaryBlueprint();
};

// INSERT `dynatrace-canary-exporter.js` HERE
