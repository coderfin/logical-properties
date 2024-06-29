# Change Log

## 0.1.15

- Added a way to ignore specific files using the file language identifier through the `logicalProperties.ignoreLanguageIds` setting.
  - See: https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
- Renamed `logicalProperties.ignoreList` to `logicalProperties.ignoreProperties`. `logicalProperties.ignoreList` is now depricated and will be removed from a future version.

## 0.1.14

- Fixed the extension to no longer check for or update values within media queries.
  - Logical properties aren't supported in media queries.
  - Note that the check is very simple and checks for `@media` to determine if a replacement should be made. This could lead to false positives or false negatives.
  - See [#4](https://github.com/coderfin/logical-properties/issues/4)
- Ignore specific CSS properties
  - Added a way to ignore specific properties through the `logicalProperties.ignoreList` setting (depricated).
  - See [#14](https://github.com/coderfin/logical-properties/issues/14)

## 0.1.12

- Fixed `border-top-right-radius` --> `border-start-end-radius`
- Fixed `border-bottom-left-radius` --> `border-end-start-radius`
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
