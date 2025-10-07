# PNM Viewer

A modern, fast web application for viewing and converting NetPBM image forma2. Set proper cache headers for static assets

## Tech Stack(PBM, PGM, PPM) to PNG. Built with React, TypeScript, and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **View NetPBM Images** - Support for all P1-P6 formats (ASCII and Binary)
- **Batch Conversion** - Convert multiple files to PNG simultaneously
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Clean interface built with shadcn/ui components
- **Fast & Lightweight** - Client-side processing with no server required
- **Image Comparison** - View up to 2 images side-by-side with zoom and pan
- **Format Support**:
  - **PBM** (P1/P4) - Portable Bitmap (1-bit black & white)
  - **PGM** (P2/P5) - Portable Graymap (8-bit grayscale)
  - **PPM** (P3/P6) - Portable Pixmap (24-bit RGB color)

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Khushal-Me/PNM-Viewer.git
cd PNM-Viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Khushal-Me/PNM-Viewer)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The included `vercel.json` ensures proper SPA routing.

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Khushal-Me/PNM-Viewer)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

The included `netlify.toml` and `public/_redirects` ensure proper SPA routing.

### Deploy to Other Platforms

For other hosting platforms (GitHub Pages, AWS S3, etc.), ensure your server is configured to:
1. Serve `index.html` for all routes (SPA fallback)
2. Serve files from the `dist/` directory
3. Set proper cache headers for static assets

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Beautiful, accessible components |
| **Radix UI** | Unstyled, accessible primitives |
| **Lucide React** | Modern icon library |

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Note:** The app uses modern ES2020+ features and may not work in older browsers without polyfills.

## Usage

### Viewing Images

1. Click the **Image Viewer** tab
2. Drag & drop a `.pbm`, `.pgm`, or `.ppm` file, or click to browse
3. Use zoom controls to inspect the image
4. Add a second image for side-by-side comparison

### Batch Conversion

1. Click the **Batch Converter** tab
2. Upload one or multiple NetPBM files
3. Files are automatically converted to PNG
4. Download individual files or all at once

## Project Structure

```
PNM-Viewer/
├── public/              # Static assets
│   ├── _redirects       # Netlify SPA routing
│   └── favicon.ico
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── BatchConverter.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FileUpload.tsx
│   │   └── ImageViewer.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── utils/           # NetPBM parser logic
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── netlify.toml         # Netlify configuration
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies & scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Khushal Mehta**

- GitHub: [@Khushal-Me](https://github.com/Khushal-Me)

## Show Your Support

Give a star if this project helped you!

---

<p align="center">Made with React</p>
