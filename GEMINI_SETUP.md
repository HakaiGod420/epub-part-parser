# Google Gemini API Setup Instructions

## Getting Your API Key

1. **Visit Google AI Studio**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Create an API Key**
   - Click on "Get API key" or navigate to the API section
   - Click "Create API key"
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated API key

3. **Configure in ChapterCraft**
   - Open the application
   - Click the settings gear icon (⚙️) in the top right
   - Select "Translation Settings"
   - Paste your API key in the "Gemini API Key" field
   - Choose your preferred model (recommended: gemini-2.5-pro)
   - Click "Save Settings"

## Usage Instructions

1. **Upload an EPUB file** using the file uploader
2. **Select a chapter** from the chapter selector
3. **Scroll down** to find the Translation section
4. **Click "Open Translation Reader"** to open the full-screen translation modal
5. **Click "Translate Text"** to translate the content
6. **Customize your reading experience** using the Settings tab
7. **Copy the translation** using the copy button if needed

## Translation Reader Features

### Full-Screen Experience
- **Immersive modal interface** that takes up the entire screen
- **Tabbed interface** with Translation and Settings tabs
- **Professional reading environment** optimized for long content

### Reading Customization
- **Font Size**: Adjustable from 12px to 32px
- **Font Family**: Choose from 10 professional fonts (Georgia, Times New Roman, Arial, etc.)
- **Line Height**: Adjustable spacing for comfortable reading
- **Text Alignment**: Left, Center, or Justify
- **Max Width**: Control content width for optimal reading
- **Original Text**: Toggle to show/hide source text alongside translation

### Theme Options
- **Dark Theme**: Comfortable dark gray background
- **Black Theme**: Pure black for OLED displays
- **White Theme**: Clean white background for bright environments

### Persistent Settings
- **All customization settings are saved** to localStorage
- **Settings persist across sessions** and page refreshes
- **Translation text is preserved** when closing and reopening modal
- **Fresh translation on page refresh** (no unwanted persistence)

## Model Recommendations

- **gemini-2.5-pro**: Best quality translations, latest model
- **gemini-2.5-flash**: Faster translations, good quality, more cost-effective
- **gemini-2.0-flash**: Reliable performance with good speed
- **gemini-2.5-flash-lite**: Lightweight option for basic translations

## Features

- **Real-time streaming**: See translations appear as they're generated
- **Formatted output**: Proper paragraph breaks, italics, and dialogue formatting
- **Copy functionality**: Easy copying of translated text
- **Persistent settings**: Your preferences are saved locally
- **Advanced customization**: Full control over reading experience
- **Modal persistence**: Translations stay when closing/reopening modal

## Troubleshooting

- **"Translation service not configured"**: Make sure you've entered a valid API key
- **Translation fails**: Check your internet connection and API key validity
- **Slow translations**: Try switching to gemini-2.5-flash model for faster results
- **Purple text in modals**: Fixed - all modal titles now use white text

## Privacy & Security

- Your API key is stored locally in your browser only
- Reading preferences are saved locally and never transmitted
- No data is sent to external servers except Google's Gemini API
- Your EPUB content is only processed locally and sent to Google for translation

## Cost Information

- Google Gemini API has usage-based pricing
- Check current rates at [Google AI Pricing](https://ai.google.dev/pricing)
- Translation costs depend on text length and model chosen
