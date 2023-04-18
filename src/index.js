import { sha512 } from "js-sha512";

let url, form, https;
try {
  url = require("url");
  form = require("form-data");
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
  #formMethods = ["post.page.form", "post.contact.form"];

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

  #call(formData) {
    const headers = formData
      ? typeof window !== "undefined"
        ? {}
        : formData.getHeaders()
      : {
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
        body: formData || JSON.stringify(this.#queue), // body data type must match "Content-Type" header
      })
        .then((res) => Object.freeze(res.json()))
        .catch((err) => console.error("OGGEH :: Error", err));
    } else {
      const parsedBaseUrl = url.parse(this.#endpoint);
      if (parsedBaseUrl.port) {
        parsedBaseUrl.port = Number(parsedBaseUrl.port);
      } else {
        parsedBaseUrl.port = parsedBaseUrl.protocol === "https:" ? 443 : 80;
      }
      const postData = formData || JSON.stringify(this.#queue);
      if (!formData) headers["Content-Length"] = Buffer.byteLength(postData);
      return new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: parsedBaseUrl.hostname,
            port: parsedBaseUrl.port,
            method: "POST",
            path: `${parsedBaseUrl.path}/?${params}`,
            headers,
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
        if (formData) {
          formData.pipe(req);
        } else {
          if (postData) req.write(postData);
          req.end();
        }
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
          return res.stack[0].error || res.stack[0].output;
        }
      }
    }
    return res;
  }

  #getAlias(method) {
    const inc =
      this.#queue.filter(
        (e) => e.method === method || e.method.startsWith(`${method}-`)
      ).length + 1;
    return `${method.replace(/\./g, "-")}-${inc}`;
  }

  async promise() {
    const res = await this.#call();
    this.#queue = [];
    return this.#getResponse(res);
  }

  #formatDate(date) {
    const d = new Date(date);
    let month = Number(d.getMonth() + 1).toString(),
      day = d.getDate().toString(),
      year = d.getFullYear();
    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    return [year, month, day].join("-");
  }

  get(options = {}) {
    if (!options.method.startsWith("get.")) {
      console.warn(
        `OGGEH :: The method "${options.method}" cannot be used with get()`
      );
      return this;
    }
    this.#queue.push({
      alias: options.alias || this.#getAlias(options.method),
      ...options,
    });
    return this;
  }

  async post(options = {}) {
    if (!this.#formMethods.includes(options.method)) {
      console.warn(
        `OGGEH :: The method "${options.method}" cannot be used with post()`
      );
      return;
    }
    const data = {
      alias: options.alias || this.#getAlias(options.method),
      ...options,
    };
    const formData =
      typeof window !== "undefined" ? new FormData() : new form();
    Object.entries(data).forEach(([key, value]) => {
      if (key.includes("date")) {
        formData.append(key, this.#formatDate(value));
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "on" : "off");
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, value);
      }
    });
    const res = await this.#call(formData);
    return this.#getResponse(res);
  }
}

if (typeof window !== "undefined") window.OGGEH = OGGEH;
