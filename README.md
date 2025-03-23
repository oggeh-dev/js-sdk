# OGGEH JavaScript SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage

### Browser

```html
<script src="https://unpkg.com/@oggeh/js-sdk/dist/oggeh.browser.min.js"></script>
```

### ES Module

```javascript
import { OGGEH } from "@oggeh/js-sdk";
```

### CommonJS

```javascript
const { OGGEH } = require("@oggeh/js-sdk");
```

## Examples

```javascript
import { OGGEH } from "@oggeh/js-sdk";

const oggeh = new OGGEH({
  api_key: "YOUR_OGGEH_APP_API_KEY", // Required
  // api_secret: "YOUR_OGGEH_APP_API_SECRET", // Use only in mobile/desktop/nodejs apps
  // sandbox_key: "YOUR_OGGEH_APP_SANDBOX_KEY", // Use only in development environment
  // domain: "YOUR_OGGEH_HOSTNAME", // Use only in mobile/desktop/nodejs apps
});

init();

async function init() {
  try {
    const app = await oggeh
      .get({ method: "get.app", select: "title,languages" })
      .promise();
    // One get() request resulting an object represents the response of the specified method
    console.log("app:", app);
    // app: { title: 'test', languages: [ 'en', 'fr' ] }

    const content = await oggeh
      .get({ alias: "nav", method: "get.pages" })
      .get({ alias: "test", method: "get.page", key: "bio" })
      .promise();
    // Multiple get() requests resulting an object with a list of properties, each property represents the specified method "alias" with a value represents the response of that method
    console.log("content:", content);
    // content: {
    //   nav: [
    //     { key: 'about', subject: 'About', childs: [] },
    //     { key: 'services', subject: 'Services', childs: [] }
    //   ],
    //   test: { key: 'bio', subject: 'Bio' }
    // }

    // For forms, you need to yse post() request
    // Applies only to "post.page.form" and "post.contact.form" methods
    // 1. First you need to generate a unique token for making the request
    const token = await oggeh
      .get({
        alias: "token",
        method: "get.form.token",
        key: "application",
      })
      .promise();
    // 2. Include the generated token with the request
    const form = await oggeh.post({
      alias: "form",
      method: "post.page.form",
      key: "application",
      token,
      // Form fields as returned by the "get.page" method
      "text-XXX": "Candidate Name",
      "file-XXX": await readFile("resume.pdf", "candidate-resume.pdf", "pdf"), // Browser file example 1
      // "file-XXX": document.querySelector("input[type=file]").files[0], // Browser file example 2
      // "file-XXX": require("fs").createReadStream("resume.pdf"), // NodeJS file example
    });
  } catch (err) {
    console.error(err);
  }
}

async function readFile(path, name, type) {
  const response = await fetch(path);
  const data = await response.blob();
  return new File([data], name, { type });
}
```

## Documentation

See [API Reference](https://docs.oggeh.com/#reference-section) for details on the available options on each API method.

## Credits

Copyright(c) 2023 OGGEH, Inc
