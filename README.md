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

