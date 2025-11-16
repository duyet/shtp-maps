# SHTP Maps - Claude Development Guide

## Project Philosophy

**Purpose**: Help people navigate the Saigon High-Tech Park (Khu Công nghệ cao Sài Gòn) with an elegant, intuitive interactive map.

**Core Values**:

- **Simplicity**: The interface should be instantly understandable
- **Reliability**: Routing must work consistently and accurately
- **Performance**: Fast load times, smooth interactions
- **Accessibility**: Works on all devices, all screen sizes
- **Vietnamese-First**: This is for Vietnamese users, language and UX reflect that

## Architecture Overview

### Technology Stack

**Frontend Core**:

- **OpenLayers 3.x**: Interactive mapping engine with custom pixel-based projection
- **Bootstrap 3**: Responsive UI framework
- **jQuery**: DOM manipulation and event handling
- **SweetAlert**: Beautiful alert dialogs

**Data Architecture**:

- **Custom Coordinate System**: Pixel-based projection (not standard lat/long)
- **Static Image Base**: Campus map as image overlay
- **GeoJSON Polygons**: Building footprints with metadata
- **Graph-Based Routing**: Custom pathfinding implementation

### Key Design Patterns

#### 1. Custom Projection System

```javascript
// We use pixel coordinates, not geographic coordinates
// This allows precise indoor/campus mapping
var projection = new ol.proj.Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: [0, 0, 1024, 968],
});
```

#### 2. Namespace Pattern

```javascript
// All app logic lives in window.app
window.app = window.app || {};
```

#### 3. Data Separation

- `geodata.js`: Building geometries and company information
- `route.js`: Routing graph (nodes and edges)
- `data.geojson`: Building polygon data

## Core Features

### 1. Interactive Map

- Pan, zoom, click interactions
- Building polygon highlighting
- Company information popups
- Custom controls (reset, fullscreen, zoom extent)

### 2. Search & Autocomplete

- Vietnamese text search with typeahead
- Voice search support (Vietnamese language)
- Dual input: from/to locations

### 3. Pathfinding Algorithm

**Implementation**: Custom Dijkstra-like shortest path algorithm

**How it works**:

1. Start from source building's gateway point
2. Find nearest routing graph node
3. Explore graph using shortest-path-first strategy
4. Build possible routes, tracking visited nodes
5. Select shortest route to destination
6. Draw route as blue line on map

**Key Function**: `app.getDirection(input)` in `assets/js/maps.js:135`

### 4. Company Information Display

- Modal dialog with company details
- Phone numbers, addresses, business sectors
- Integrated with search and map clicks

## File Structure

```
shtp-maps/
├── index.html                      # Application shell, initialization
├── assets/
│   ├── css/
│   │   ├── main.css               # Custom styles
│   │   └── ol.css                 # OpenLayers styles
│   ├── js/
│   │   ├── maps.js                # Core application logic (709 lines)
│   │   └── islab-maps.js          # OpenLayers library
│   ├── images/
│   │   └── kcnc_bando.jpg         # Base campus map image
│   ├── geodata.js                 # Building data & company info
│   ├── route.js                   # Routing graph data
│   └── data.geojson              # Building polygon geometries
└── bower_components/              # Dependencies (deprecated)
```

## Development Guidelines

### Code Style

**JavaScript**:

- Use meaningful variable names (Vietnamese for UI strings)
- Comment complex algorithms
- Avoid deeply nested callbacks
- Handle edge cases (null checks, empty arrays)

**HTML/CSS**:

- Semantic HTML structure
- Mobile-first responsive design
- Consistent spacing and indentation

### Adding a New Building

1. **Update `data.geojson`**: Add polygon coordinates
2. **Update `geodata.js`**: Add company information and gateway point
3. **Test**: Verify search finds the building, routing works

### Adding a New Route Segment

1. Use debug mode: `?__debug=1&__draw=1`
2. Draw line on map using drawing tool
3. Copy generated route code from console
4. Add to `route.js`
5. Add reverse route (if bidirectional)

### Testing the Application

**Manual Testing Checklist**:

- [ ] Search for company by name
- [ ] Click building, verify info popup appears
- [ ] Get directions between two buildings
- [ ] Verify route is reasonable and accurate
- [ ] Test on mobile device
- [ ] Test voice search (Chrome only)
- [ ] Test zoom and pan controls

**Debug Mode**:

- `?__debug=1`: Show coordinate overlays and debug info
- `?__draw=1`: Enable route drawing tools
- `?long=X&lat=Y`: Set custom starting position

## Key Algorithms

### Distance Calculation

```javascript
app.distance = function (a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};
```

### Nearest Point Finding

```javascript
app.isNear = function (a, b, distance) {
    distance = 5.0; // pixels
    return this.distance(a, b) < distance;
};
```

### Center Point Calculation

Uses bounding box approach to find polygon center for map panning.

## Performance Considerations

1. **Route Calculation**: O(n²) worst case - optimize for large graphs
2. **GeoJSON Parsing**: Done once at load time
3. **Map Rendering**: Hardware accelerated via OpenLayers
4. **Mobile Performance**: Touch event handling is optimized

## Known Issues & TODOs

1. **maps.js:259**: `TODO: Fix here` - Route path optimization
2. **route.js**: Multiple "bug" comments - review and fix routing edges
3. **Voice Search**: Only works in Chrome (WebKit Speech API)
4. **IE Compatibility**: Limited support for older IE versions

## Future Enhancements

### Short Term

- [ ] Modernize build system (Vite)
- [ ] Add comprehensive test coverage
- [ ] Update dependencies to secure versions
- [ ] Improve error handling and user feedback
- [ ] Add loading states

### Long Term

- [ ] Progressive Web App (offline support)
- [ ] Real-time building occupancy data
- [ ] Multi-language support (English)
- [ ] 3D building visualization
- [ ] Integration with external mapping services

## Deployment

**Current**: Static file hosting (GitHub Pages compatible)

**Requirements**:

- Web server with static file serving
- HTTPS recommended (for geolocation features)
- No backend/API required

**Build Process**: None currently - files served directly

## Security Considerations

1. **XSS Prevention**: Sanitize user input in search
2. **Data Validation**: Validate coordinates and IDs
3. **HTTPS**: Required for geolocation API
4. **Dependencies**: Keep libraries updated for security patches

## Working with This Codebase

### Before You Start

1. Understand the custom coordinate system (pixels, not lat/long)
2. Review the routing graph structure in `route.js`
3. Test in debug mode to see coordinate overlays

### Making Changes

1. Test locally before committing
2. Verify routing still works after data changes
3. Check mobile responsiveness
4. Update this document if architecture changes

### Getting Help

- Check browser console for errors
- Use debug mode parameters
- Review git history for context on changes

## Philosophy: The Steve Jobs Approach

**Think Different**: This isn't just a map. It's the first impression many people have of SHTP. Make it insanely great.

**Simplicity**: Remove anything that doesn't serve the core purpose. Every feature must earn its place.

**Craft**: Smooth animations, instant feedback, intuitive gestures. These details matter.

**Integration**: The map, search, routing, and information display should feel like one cohesive experience, not separate features bolted together.

---

**Remember**: The best code is code that serves users so well they don't even notice it. Focus on the experience, and the technology will follow.

_Last Updated: 2025-11-16_
