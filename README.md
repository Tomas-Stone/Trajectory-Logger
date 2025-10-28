# 🎯 Trajectory Logger

A Chrome extension for recording user action sequences on websites to train web agents. Capture detailed interaction trajectories including screenshots, DOM elements, and action metadata.

## ✨ Features

- **🤖 AI Task Generation**: Generate web automation tasks using OpenRouter's DeepSeek R1 model
- **⏺️ Action Recording**: Capture user interactions including:
  - `CLICK(element, x, y)` - Mouse clicks with element selectors
  - `WRITE(text, element, x, y)` - Text input with target elements
  - `SCROLL(x, y)` - Scroll positions
  - `GOTO(url)` - Navigation events
  - `GOBACK()` - Browser back button
  - `REFRESH()` - Page refreshes
  - `WAIT(duration)` - Delays between actions
- **📸 Screenshot Capture**: Automatically capture screenshots before each action
- **☁️ HuggingFace Integration**: Upload sequences directly to HuggingFace datasets
- **💾 Local Storage**: Save sequences locally in Chrome storage
- **📊 Sequence Management**: View and manage recorded trajectories

## 🏗️ Architecture

```
trajectory-logger/
├── src/
│   ├── manifest.json          # Chrome extension manifest (v3)
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── api/
│   │   ├── openrouter.ts     # OpenRouter API integration
│   │   └── huggingface.ts    # HuggingFace dataset upload
│   ├── storage/
│   │   └── sequences.ts      # Chrome storage management
│   ├── content/
│   │   ├── content.ts        # Content script entry point
│   │   └── recorder.ts       # Action recording logic
│   ├── background/
│   │   └── background.ts     # Service worker (screenshots, messaging)
│   ├── popup/
│   │   ├── popup.html        # Extension popup UI
│   │   ├── popup.ts          # Popup logic
│   │   └── popup.css         # Popup styles
│   └── utils/
│       ├── dom-helpers.ts    # DOM manipulation utilities
│       └── action-executor.ts # Action replay functionality
├── public/
│   └── icons/                # Extension icons
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- Chrome browser
- OpenRouter API key ([get one here](https://openrouter.ai/))
- HuggingFace API key ([get one here](https://huggingface.co/settings/tokens))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trajectory-logger.git
   cd trajectory-logger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```
   
   For development with auto-rebuild:
   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project directory

## ⚙️ Configuration

1. Click the extension icon in Chrome toolbar
2. In the Configuration section, enter:
   - **OpenRouter API Key**: Your OpenRouter API key for task generation
   - **HuggingFace API Key**: Your HuggingFace token for dataset uploads
   - **Dataset Repository**: Your HuggingFace dataset repo (format: `username/dataset-name`)
3. Click "Save Configuration"

## 📖 Usage

### Recording a Sequence

1. **Get a Task**
   - Click "Get Task" to generate a random web automation task using AI
   - Example tasks: "Search for 'TypeScript tutorial' on Google", "Add item to shopping cart"

2. **Start Recording**
   - Navigate to the website where you'll perform the task
   - Click "Start Recording"
   - Perform the task actions naturally
   - The extension captures each action with screenshots

3. **Stop Recording**
   - Click "Stop Recording" when finished
   - Review the action count

4. **Submit Result**
   - Click "✓ Success" if you completed the task successfully
   - Click "✗ Failed" if you couldn't complete the task
   - Sequence is saved locally and uploaded to HuggingFace

### Viewing Sequences

The "Saved Sequences" section shows your recent recordings with:
- Task description
- Success/failure status
- Number of actions captured
- Timestamp

## 🔧 Development

### Build Commands

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev

# Clean build artifacts
npm run clean
```

### Project Structure Details

**Background Script** (`src/background/background.ts`)
- Captures screenshots using Chrome tabs API
- Routes messages between popup and content scripts
- Manages recording state

**Content Script** (`src/content/`)
- Injected into all web pages
- Records user interactions (clicks, typing, scrolling)
- Sends actions to background script

**Popup** (`src/popup/`)
- Extension UI for configuration and controls
- Task generation and management
- Sequence submission

**Storage Layer** (`src/storage/sequences.ts`)
- Manages recording state in Chrome storage
- Saves/retrieves sequences
- Handles start/stop recording logic

**API Integrations** (`src/api/`)
- **OpenRouter**: Generate tasks using LLM
- **HuggingFace**: Upload sequences as JSONL to datasets

## 📊 Data Format

Recorded sequences are stored as JSON with this structure:

```typescript
{
  id: string,
  taskId: string,
  taskDescription: string,
  url: string,
  startTime: number,
  endTime: number,
  success: boolean,
  actions: [
    {
      type: "CLICK" | "WRITE" | "SCROLL" | "GOTO" | "GOBACK" | "REFRESH" | "WAIT",
      timestamp: number,
      screenshot?: string,  // Base64 PNG
      // Action-specific fields:
      element?: string,     // CSS selector
      x?: number,
      y?: number,
      text?: string,
      url?: string,
      duration?: number
    }
  ]
}
```

## 🔒 Privacy & Security

- All API keys are stored locally in Chrome's sync storage
- Screenshots are captured only during active recording
- No data is sent to third parties except configured services (OpenRouter, HuggingFace)
- You control when and what data is uploaded

## 🐛 Troubleshooting

### Extension not loading
- Make sure you built the project (`npm run build`)
- Load the `dist` folder, not the root folder
- Check for errors in Chrome DevTools console

### Recording not working
- Ensure content script is injected (check page console for "[Content] Action recorder initialized")
- Try reloading the page after loading extension
- Some pages with strict CSP may block the extension

### API errors
- Verify API keys are correct and active
- Check OpenRouter account has credits
- Ensure HuggingFace dataset exists and is accessible

### TypeScript errors
- These are expected during development if `@types/chrome` isn't installed yet
- Run `npm install` to resolve
- Errors don't prevent the extension from working after building

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenRouter for LLM API access
- HuggingFace for dataset hosting
- Chrome Extensions API documentation

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide console logs for debugging

---

Built with ❤️ for training better web agents
