# Chrome Task Automation Extension

This Chrome extension allows users to record sequences of actions for task automation. It utilizes a Hugging Face dataset for the backend and integrates with the OpenRouter API for task generation.

## Features

- Record user actions on web pages.
- Automate repetitive tasks by executing recorded sequences.
- Utilize data from Hugging Face for intelligent task generation.
- Integrate with OpenRouter API for enhanced functionality.

## Project Structure

```
chrome-task-automation-extension
├── src
│   ├── manifest.json
│   ├── background
│   │   ├── background.ts
│   │   └── service-worker.ts
│   ├── content
│   │   ├── content.ts
│   │   └── recorder.ts
│   ├── popup
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── api
│   │   ├── openrouter.ts
│   │   └── huggingface.ts
│   ├── storage
│   │   └── sequences.ts
│   ├── utils
│   │   ├── dom-helpers.ts
│   │   └── action-executor.ts
│   └── types
│       └── index.ts
├── public
│   └── icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd chrome-task-automation-extension
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `chrome-task-automation-extension` directory.

2. Click on the extension icon to open the popup interface.
3. Use the recorder to capture actions and save them for automation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.