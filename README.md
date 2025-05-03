# DesktopBuddy

An AI assistant designed to help users organize their digital workspace and improve productivity.

## Features

- Monitor active windows and applications
- Track application usage time
- Identify potential distractions
- Provide productivity suggestions and insights
- Visualize desktop state with Mermaid diagrams
- Analyze work patterns over time

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/desktopbuddy.git
cd desktopbuddy
```

2. Install dependencies
```bash
npm install
```

3. Start the application
```bash
npm start
```

## Development

### Project Structure

```
desktopbuddy/
├── src/                  # Source files
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # React components
│   ├── services/         # Background services
│   ├── types/            # TypeScript type definitions
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # Preload script
│   └── renderer.tsx      # React entry point
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
