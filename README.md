# OGGEH JavaScript SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage

### Browser

```html
<script src="https://unpkg.com/@oggeh/js-sdk/build/oggeh.browser.min.js"></script>
```

### ES Module

```javascript
import { OGGEH } from "@oggeh/js-sdk";
```

### CommonJS

```javascript
const { OGGEH } = require("@oggeh/js-sdk");
```

## Example

```javascript
import { OGGEH } from "@oggeh/js-sdk";

const oggeh = new OGGEH({
  api_key: "YOUR_OGGEH_APP_API_KEY",
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
    //   'nav': [
    //     { key: 'about', subject: 'About', childs: [] },
    //     { key: 'services', subject: 'Services', childs: [] }
    //   ],
    //   'test': { key: 'bio', subject: 'Bio' }
    // }
  } catch (err) {
    console.error(err);
  }
}
```

## Documentation

See [API Reference](https://docs.oggeh.com/#reference-section) for details on the available options on each API method.

## Credits

Copyright(c) 2023 OGGEH, Inc
