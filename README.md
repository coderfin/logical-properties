# 🧠 Logical Properties

Identify and replace CSS 💪 physical properties with 🧠 logical properties.

![Logical Properties](images/action.gif)

## Please leave a rating and review

<https://marketplace.visualstudio.com/items?itemName=coderfin.logical-properties&ssr=false#review-details>

## Features

This extension contributes the following:

- Command pallet - `Replace all 💪 physical properties with 🧠 logical properties.`
  - Replaces all of the detected physical properties with logical properties in the current file.
    - <img src="images/command-pallet.png" alt="Command pallet" width="450px" />
- keybindings: `ctrl+shift+L`/`cmd+shift+L`
  - Replaces all of the detected physical properties with logical properties in the current file.
  - <img src="images/keybindings.png" alt="Keybindings" width="450px" />
- Editor Context Menu: `Replace all 💪 physical properties with 🧠 logical properties.`
  - Replaces all of the detected physical properties with logical properties in the current file.
  - <img src="images/context-menu.png" alt="Editor Context Menu" width="450px" />
- Problems
  - Shows any warning(s) if an open file contains physical properties.
  - <img src="images/problems.png" alt="Problems" width="450px" />
- Quick Fix/Light Bulb
  - Quickly change a single physical property to its equivalent logical property.
  - <img src="images/quick-fix.png" alt="Quick Fix" width="450px" />
- Status Bar
  - Shows the number of physical properties detected in the current file.
    - <img src="images/warning.png" alt="Warning" width="75px" />
  - Indicates if no physical properties were detected in the current file.
    - <img src="images/logical.png" alt="Logical" width="75px" />
  - Click to replace all of the detected physical properties with logical properties in the current file.
- Supported Languages
  - Testing has only been done on `.css`, `.html`, and `.jsx` files.
  - In theory the following languages are supported:
    - coffeescript
    - css
    - html
    - javascript
    - javascriptreact
    - less
    - markdown
    - php
    - plaintext
    - sass
    - scss
    - stylus
    - typescript
    - typescriptreact
    - vue
    - vue-html
    - xml
    - xsl

## Gotchas

A few things to be aware of when using this extension:

- False positives/negatives are possible.
  - For example, in an HTML file if you use an `image` tag with the `height` attribute,
    the extension will currently detect the `height` attribute as a physical property.
  - Double check your file after using the `replace all` feature.
- Changing a physical property to a logical property may or may not have an effect on styles that override styles from other files and third-party files.

## Known Issues

Limited testing of this extension has been done.

## Release Notes

## 0.1.12

- Fixed `border-top-right-radius` --> `border-start-end-radius` and Fixed `border-bottom-left-radius` --> `border-end-start-radius`
 - See [#7](https://github.com/coderfin/logical-properties/issues/7)
 - See [#8](https://github.com/coderfin/logical-properties/issues/8)
 - See [#9](https://github.com/coderfin/logical-properties/issues/9)

## 0.1.11

Fix an issue related to regex matching indices not currently supported in node.js

- VSCode uses Electron
  - Electron uses node.js for local apis
    - node.js does not currently support regex matching indices (`d` flag, `hasIndices`)
- Using a polyfill
- See [#2](https://github.com/coderfin/logical-properties/issues/2)

### 0.1.10

Fixed which files diagnostics are shown for

- Previously `.git` files were showing diagnostics
- Files that were closed were still showing in `Problems`

### 0.1.9

Fixed activation

- Fixes a bug where the extension would not work on the first time it was installed.
  - See [#1](https://github.com/coderfin/logical-properties/issues/1)

### 0.1.0

Initial release

-----------------------------------------------------------------------------------------------------------

#### TODO

- Update additional checks and logic for logical properties that do not map to physical properties
- Write Tests
- Link to or document basic info about logical properties
