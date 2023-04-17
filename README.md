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
    console.log("app:", app);

    const content = await oggeh
      .get({ method: "get.pages" })
      .get({ method: "get.page", key: "test" })
      .promise();
    console.log("content:", content);
  } catch (err) {
    console.error(err);
  }
}
```

## Documentation

See [API Reference](https://docs.oggeh.com/#reference-section) for details on the available options on each API method.

## Credits

Copyright(c) 2023 OGGEH, Inc
