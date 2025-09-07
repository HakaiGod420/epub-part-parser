# EPUB Content Splitter

A React-based web application for parsing, viewing, and splitting EPUB files into manageable sections. This tool allows users to upload EPUB files, browse chapters, and split content for easier reading and translation.

## Features

- **EPUB File Upload**: Upload and parse EPUB files with drag-and-drop support
- **Chapter Navigation**: Browse and select chapters from the uploaded EPUB
- **Content Splitting**: Split chapter content into smaller, manageable parts
- **Content Viewing**: Display chapter content with image support
- **Translation Support**: Built-in translation functionality for content
- **Collapsible Sections**: Expandable/collapsible interface for better organization
- **Modern UI**: Clean, responsive design with Material-UI components

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HakaiGod420/epub-part-parser.git
cd epub-part-parser
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`
Runs the app in development mode. The page will reload when you make edits.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder with optimized performance.

## Usage

1. **Upload EPUB**: Use the file uploader to select and upload an EPUB file
2. **Select Chapter**: Choose a chapter from the chapter selector dropdown
3. **Split Content**: Use the chapter splitter to divide content into parts
4. **View Content**: Review the formatted chapter content with images
5. **Translate**: Use the translation feature for multilingual support

## Main Sections

The application is organized into collapsible sections for better user experience:

- **File Upload**: Upload your EPUB files
- **Chapter Selection**: Navigate through available chapters
- **Chapter Splitter**: Split content into manageable parts
- **Chapter Content**: View formatted content with images
- **Translation**: Translate content to different languages

Each section can be expanded or collapsed using the toggle buttons in the upper right corner.

## Technology Stack

- **React** - Frontend framework
- **TypeScript** - Type-safe development
- **Material-UI** - UI component library
- **EPUB Parser** - Custom EPUB parsing utilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
