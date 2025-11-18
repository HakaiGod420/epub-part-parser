# OpenRouter Integration Guide

This guide explains how to use the new OpenRouter API integration alongside the existing Google Gemini API for translation.

## Overview

The application now supports two translation providers:
- **Google Gemini** (original implementation)
- **OpenRouter** (new integration)

Both providers use the same high-quality translation instructions and system prompts, but OpenRouter gives you access to a wider variety of AI models.

## Setup Instructions

### Option 1: Google Gemini (Existing)
1. Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. Open Settings (⚙️ icon)
3. Select "Google Gemini" as your provider
4. Enter your API key
5. Choose your preferred Gemini model

### Option 2: OpenRouter (New)
1. Get your API key from [OpenRouter.ai](https://openrouter.ai/)
2. Open Settings (⚙️ icon)
3. Select "OpenRouter" as your provider
4. Enter your OpenRouter API key
5. Click "Load Models" to fetch available models
6. Select your preferred model from the list

## Features

### Preserved Functionality
- **Translation Quality**: The same high-quality translation instructions are used for both providers
- **Dictionary Extraction**: Continues to use Google API exclusively (as requested)
- **Streaming Translation**: Real-time translation with both providers
- **System Instructions**: The comprehensive Korean-to-English translation prompt remains unchanged

### New Capabilities
- **Provider Switching**: Easy switching between Google and OpenRouter in both Settings and Translation Modal
- **Model Variety**: Access to many more AI models through OpenRouter (GPT-4, Claude, Llama, etc.)
- **Persistent Preferences**: Your provider choice and model selection are saved locally
- **Real-time Model Selection**: Switch models during translation sessions

### API Key Management
- **Separate Storage**: Google and OpenRouter API keys are stored separately
- **Local Storage**: All keys remain in your browser's local storage
- **Migration**: Existing Google settings are automatically preserved

## User Interface Changes

### Settings Dialog
- New "Translation Provider" section at the top
- Provider-specific API key fields
- "Load Models" button for OpenRouter (fetches available models)
- Model selection adapts based on chosen provider

### Translation Modal
- Provider selection dropdown in Settings tab
- Dynamic model list based on current provider
- Status indicator showing configuration state
- Seamless switching between providers

## Technical Implementation

### Architecture
- **Backward Compatibility**: Existing Google Gemini functionality remains unchanged
- **Clean Separation**: OpenRouter logic is isolated in its own service
- **Unified Interface**: Both providers use the same translation service interface
- **Smart Migration**: Legacy settings are automatically upgraded

### API Integration
- **HTTP Requests**: Uses standard fetch/axios for OpenRouter API calls
- **Streaming Support**: Implements Server-Sent Events for real-time translation
- **Error Handling**: Comprehensive error handling for both providers
- **Model Management**: Dynamic model loading and caching

## Storage Keys

The application uses these localStorage keys:
- `translationProviderSettings`: Modern unified settings
- `openRouterSettings`: OpenRouter-specific configuration
- `translationSettings`: Legacy settings (auto-migrated)

## Usage Tips

1. **Cost Management**: Different models have different pricing - check OpenRouter.ai for current rates
2. **Model Selection**: Experiment with different models to find the best balance of quality and speed
3. **Provider Switching**: You can switch providers at any time without losing translations
4. **Dictionary Integration**: Dictionary extraction always uses Google API regardless of translation provider

## Troubleshooting

### Common Issues
- **"Failed to load models"**: Check your OpenRouter API key and internet connection
- **Translation fails**: Verify your API key is valid and has sufficient credits/quota
- **Models not loading**: Some models may require special access permissions

### Error Messages
- **"OpenRouter service not configured"**: Enter API key and select a model
- **"Invalid response format"**: Usually indicates API quota exceeded or invalid key
- **"HTTP error"**: Network connectivity or API service issues

## Migration from Google-Only Setup

If you're upgrading from a previous version:
1. Your existing Google settings are automatically preserved
2. No action needed - your current setup continues working
3. OpenRouter is available as an additional option
4. You can switch between providers at any time

## Best Practices

1. **Keep both APIs configured** for redundancy
2. **Test different models** to find your preferred quality/speed balance
3. **Monitor API usage** through your provider dashboards
4. **Use appropriate models** for your content type (novels, technical text, etc.)

## Model Recommendations

### For Novel Translation (High Quality)
- **OpenRouter**: GPT-4 variants, Claude models
- **Google**: gemini-3-pro-preview, gemini-2.5-pro

### For Speed (Fast Translation)  
- **OpenRouter**: GPT-3.5-turbo, faster models
- **Google**: gemini-2.5-flash

### For Cost Efficiency
- **OpenRouter**: Check current pricing per token
- **Google**: gemini-2.5-flash-lite

---

**Note**: Dictionary extraction functionality remains exclusively with the Google API to ensure consistency and reliability as originally designed.