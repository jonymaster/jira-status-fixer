# Jira Status Field Fixer

A Chrome extension that fixes the misplaced Status field and Resolution label in Jira ticket views.

## Problem

Recently, Atlassian moved the Status field in Jira to an uncomfortable position that makes it harder to quickly see and interact with the ticket status. Additionally, the Resolution field was also misplaced, making it difficult to see the resolution status of tickets.

## Solution

This extension automatically detects the Status field on Jira pages and moves it to a more accessible position. It also displays a clean Resolution label next to the status when a resolution is set, providing better visibility of ticket resolution status.

## Features

- Automatically detects and repositions the Status field
- Displays Resolution label next to status when set
- Prevents dropdown content from appearing in resolution labels
- Works with dynamic content loading
- Responsive design that adapts to different screen sizes
- Non-intrusive - preserves all original functionality

## Installation

### Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/jira-status-fixer.git
   cd jira-status-fixer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Production Installation

Install from the Chrome Web Store (coming soon).

## Packaging for Chrome Web Store

1. Build and zip the extension:
   ```bash
   npm run package
   ```
   This creates `jira-status-fixer.zip` in the project root.

2. Go to the Chrome Web Store Developer Dashboard and upload the zip.

### Required Store Listing Assets
- Icon 128x128: `src/icons/icon128.png`
- Screenshots: at least 1280x800 (recommended 3-5 showing before/after)
- Short description (max 132 characters)
- Detailed description (focus on benefits and privacy)

### Privacy Policy
This extension does not collect, transmit, or store personal data. It only manipulates the current Jira page DOM locally to reposition the status field. No network requests or analytics are added by the extension.

If you host a privacy policy, include a link in your listing.

## Development

### Scripts

- `npm run build` - Build the extension for production
- `npm run dev` - Build and watch for changes
- `npm run clean` - Clean the dist folder

### Project Structure

```
jira-status-fixer/
├── src/
│   ├── content.ts          # Main content script
│   ├── popup.ts            # Popup script
│   ├── popup.html          # Popup interface
│   ├── styles/
│   │   └── content.css     # Extension styles
│   └── icons/              # Extension icons
├── dist/                   # Built extension (generated)
├── manifest.json           # Extension manifest
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## How It Works

1. The content script runs on Jira pages (`*.atlassian.net` and `*.jira.com`)
2. It uses a MutationObserver to watch for dynamic content changes
3. When the Status field is detected, it moves it to a more accessible position
4. The extension detects resolution fields and creates a clean resolution badge
5. Text sanitization prevents dropdown content from appearing in resolution labels
6. Custom CSS ensures proper styling and positioning

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Status field repositioning
- Resolution label display with clean text extraction
- Dropdown content prevention
- Text sanitization for resolution labels
- Responsive design
- Popup interface
