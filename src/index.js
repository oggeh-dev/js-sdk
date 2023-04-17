import { sha512 } from "js-sha512";

let url, https;
try {
  url = require("url");
  https = require("https");
} catch {}

export class OGGEH {
  #endpoint = "https://api.oggeh.com";
  #domain = "";
  #lang = "en";
  #api_key;
  #api_secret;
  #sandbox_key;
  #queue = [];

  constructor(config = {}) {
    if (!config.api_key) {
      console.error("OGGEH API Key is missing!");
    } else {
      this.#api_key = config.api_key;
      if (config.lang) this.#lang = config.lang;
      if (config.domain) this.#domain = config.domain;
      if (config.api_secret) this.#api_secret = config.api_secret;
      if (config.sandbox_key) this.#sandbox_key = config.sandbox_key;
      if (config.endpoint) this.#endpoint = config.endpoint;
    }
  }

  #call() {
    const headers = {
      "Content-Type": "application/json",
    };
    if (this.#sandbox_key) {
      headers["SandBox"] = sha512.hmac(
        this.#sandbox_key,
        this.#domain + this.#api_key
      );
    }
    let params = `lang=${this.#lang}&api_key=${this.#api_key}`;
    if (this.#api_secret) {
      params += `&api_secret=${this.#api_secret}`;
    }
    if (typeof window !== "undefined") {
      return fetch(`${this.#endpoint}/?${params}`, {
        method: "POST",
        headers,
        body: JSON.stringify(this.#queue), // body data type must match "Content-Type" header
      })
        .then((res) => Object.freeze(res.json()))
        .catch(console.error);
    } else {
      const parsedBaseUrl = url.parse(this.#endpoint);
      if (parsedBaseUrl.port) {
        parsedBaseUrl.port = Number(parsedBaseUrl.port);
      } else {
        parsedBaseUrl.port = parsedBaseUrl.protocol === "https:" ? 443 : 80;
      }
      const postData = JSON.stringify(this.#queue);
      return new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: parsedBaseUrl.hostname,
            port: parsedBaseUrl.port,
            method: "POST",
            path: `${parsedBaseUrl.path}/?${params}`,
            headers: {
              ...headers,
              "Content-Length": Buffer.byteLength(postData),
            },
          },
          (res) => {
            const body = [];
            res.on("data", (chunk) => body.push(chunk));
            res.on("end", () => {
              if (res.statusCode === 200) {
                const buffer = Buffer.concat(body);
                resolve(JSON.parse(buffer.toString()));
              } else {
                reject({
                  message: res.statusMessage,
                  status: res.statusCode,
                });
              }
            });
          }
        );
        req.on("error", (err) =>
          reject({
            message: err.message,
            status: err.code,
            statusText: err.statusText,
          })
        );
        if (postData) req.write(postData);
        req.end();
      });
    }
  }

  #getResponse(res) {
    if (res.error) return res.error;
    if (Array.isArray(res.stack)) {
      if (res.stack.length) {
        if (res.stack.length > 1) {
          return Object.fromEntries(
            res.stack.map(({ alias, output, error }) => [
              alias,
              error || output,
            ])
          );
        } else {
          return res.stack[0].output;
        }
      } else {
        return res;
      }
    }
    return res;
  }

  #getAlias(method) {
    const inc =
      this.#queue.filter((e) => e.method.startsWith(method)).length + 1;
    return `${method.replace(/\./g, "-")}-${inc}`;
  }

  async promise() {
    const res = await this.#call();
    this.#queue = [];
    return this.#getResponse(res);
  }

  getApp(select = "title", alias) {
    this.#queue.push({
      alias: alias || this.#getAlias("get.app"),
      method: "get.app",
      select: select.split(","),
    });
    return this;
  }

  getPage(key, select = "subject", alias) {
    this.#queue.push({
      alias: alias || this.#getAlias("get.page"),
      method: "get.page",
      key,
      select: select.split(","),
    });
    return this;
  }
}

if (typeof window !== "undefined") window.OGGEH = OGGEH;
