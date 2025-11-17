# SHTP Maps

> Interactive mapping application for Saigon High-Tech Park (Khu Công nghệ cao Sài Gòn)

[![CI/CD](https://github.com/user/shtp-maps/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/user/shtp-maps/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An elegant, intuitive web application that helps visitors navigate the Saigon High-Tech Park. Features include interactive maps, company search with Vietnamese autocomplete, turn-by-turn routing, and voice search capabilities.

## Features

- **Interactive Map**: Pan, zoom, and explore building polygons with detailed company information
- **Smart Search**: Vietnamese text search with typeahead autocomplete
- **Voice Navigation**: Vietnamese language voice search (Chrome only)
- **Turn-by-Turn Routing**: Custom pathfinding algorithm for optimal routes between buildings
- **Company Information**: Detailed business information including contact details and addresses
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd shtp-maps

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Development

### Project Structure

```
shtp-maps/
├── assets/
│   ├── css/                 # Stylesheets
│   ├── js/
│   │   └── maps.js         # Core application logic
│   ├── images/             # Map images and icons
│   ├── data.geojson        # Building polygon geometries
│   ├── geodata.js          # Company location data
│   └── route.js            # Routing graph data
├── index.html              # Application entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Build configuration
├── eslint.config.js        # Code quality rules
└── CLAUDE.md               # Development philosophy and patterns
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Security
npm run security:audit   # Run security audit
```

### Debug Mode

The application supports several debug parameters:

- `?__debug=1` - Show coordinate overlays and debug information
- `?__draw=1` - Enable route drawing tools
- `?long=X&lat=Y` - Set custom starting position

Example: `http://localhost:3000/?__debug=1&__draw=1`

## Technology Stack

- **OpenLayers 8**: Modern interactive mapping engine
- **Bootstrap 3**: Responsive UI framework
- **jQuery**: DOM manipulation and AJAX
- **SweetAlert**: Beautiful alert dialogs
- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Vitest**: Testing framework

## Architecture

### Custom Coordinate System

This application uses a pixel-based coordinate system (not standard lat/long), optimized for campus/indoor mapping:

```javascript
var projection = new ol.proj.Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: [0, 0, 1024, 968],
});
```

### Pathfinding Algorithm

Implements a custom Dijkstra-like shortest path algorithm:

1. Find nearest routing graph node to source
2. Explore graph using shortest-path-first strategy
3. Track visited nodes to avoid cycles
4. Select optimal route to destination
5. Render route as blue line overlay

See `assets/js/maps.js:147` for implementation details.

### Data Architecture

- **geodata.js**: Building geometries + company metadata
- **route.js**: Routing graph (nodes and edges)
- **data.geojson**: GeoJSON polygon data

## Contributing

### Code Style

This project follows strict code quality standards:

- ESLint for code quality (zero warnings policy)
- Prettier for consistent formatting
- EditorConfig for editor consistency

### Adding a New Building

1. Update `assets/data.geojson` with polygon coordinates
2. Add company information to `assets/geodata.js`
3. Test search and routing functionality

### Adding a New Route Segment

1. Enable debug mode: `?__debug=1&__draw=1`
2. Draw route using the drawing tool
3. Copy generated code from console
4. Add to `assets/route.js`
5. Add reverse route if bidirectional

## Deployment

### GitHub Pages

The project includes automatic deployment to GitHub Pages via GitHub Actions:

1. Push to `main` or `master` branch
2. CI/CD pipeline runs automatically
3. Build artifacts deployed to `gh-pages` branch
4. Site available at GitHub Pages URL

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting service
```

## Browser Support

- Chrome (recommended for voice search)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built for Saigon High-Tech Park (SHTP/KCNC)
- Map data and routing information courtesy of ISLab
- Uses OpenLayers mapping library

## Support

For issues, questions, or contributions:

1. Check existing [GitHub Issues](../../issues)
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

## Roadmap

### Short Term

- ✅ Modern build system (Vite)
- ✅ Code quality tools (ESLint, Prettier)
- ✅ CI/CD pipeline
- ⏳ Comprehensive test coverage
- ⏳ Type safety with JSDoc

### Long Term

- Progressive Web App (offline support)
- Multi-language support (English)
- 3D building visualization
- Integration with external mapping services
- Real-time occupancy data

---

**Made with ❤️ for Saigon High-Tech Park**

_Last Updated: 2025-11-16_
