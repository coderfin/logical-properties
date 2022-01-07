# Change Log

## 0.1.11

Fix an issue related to regex matching indices not currently supported in node.js

- VSCode uses Electron
  - Electron uses node.js for local apis
    - node.js does not currently support regex matching indices (`d` flag, `hasIndices`)
- Using a polyfill

## 0.1.10

Fixed which files diagnostics are shown for:

- Previously `.git` files were showing diagnostics
- Files that were closed were still showing in `Problems`

## 0.1.9

Fixed activation

- Fixes a bug where the extension would not work on the first time it was installed.
  - See [#1](https://github.com/coderfin/logical-properties/issues/1)

## 0.1.0

Initial release
