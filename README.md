# Foxgram Image

<table>
  <thead>
    <tr>
      <th style="text-align:center">English</th>
      <th style="text-align:center"><a href="README_ja.md">日本語</a></th>
    </tr>
  </thead>
</table>

A lightweight Firefox extension for saving Instagram images from the context menu.

## Design

- Does not modify Instagram's DOM or overlays
- Detects the `<img>` underneath the right-click position and retrieves its URL
- Uses the largest available `srcset` candidate when possible

## Development Install

1. Open `about:debugging#/runtime/this-firefox` in Firefox
2. Click **Load Temporary Add-on**
3. Select `manifest.json` in this repository
4. **Reload any Instagram tabs that were already open**
5. Right-click an image and choose:
   - **Instagram 画像を保存**
   - **Instagram 画像を新しいタブで開く**

Temporary add-ons are removed when Firefox exits.

## Files

- `manifest.json`
- `background.js`
- `content.js`

## Notes

Instagram must be reloaded after installing the extension so that the content script is injected into the page.

Image files are typically served from `cdninstagram.com` or `fbcdn.net`, so the extension includes host permissions for those domains to allow downloads.

Please respect copyright and the terms of use of the content you save.
