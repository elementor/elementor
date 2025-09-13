# CSS Class Converter - Changelog

## [1.0.0] - 2025-01-13

### Added
- **CSS Class Extraction**: Parse and extract simple CSS class selectors (`.className`)
- **Color Property Support**: Convert color values with format normalization
  - Hex colors: `#ff0000`, `#f00`, `#ff0000ff`
  - RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
  - Named colors: `red`, `blue`, `white`, etc.
- **Font-Size Property Support**: Convert font-size values with unit support
  - Pixels: `16px`, `12.5px`
  - Em/Rem: `1em`, `1.2rem`
  - Percentages: `120%`, `80.5%`
  - Points: `12pt`, `14.5pt`
  - Viewport units: `4vh`, `2vw`
- **CSS Variable Integration**: Extract and convert CSS variables using existing system
- **REST API Endpoint**: `POST /elementor/v2/css-converter/classes`
- **Global Classes Storage**: Automatic integration with Elementor Global Classes
- **Comprehensive Testing**: Unit, integration, and API tests
- **Performance Optimizations**: Caching, lookup maps, and early exits
- **Error Handling**: Graceful degradation with detailed warnings
- **Documentation**: User guide and implementation documentation

### Features
- ✅ Simple class selector parsing (`.className`)
- ✅ Duplicate detection and skipping
- ✅ CSS variable resolution (`var(--variable)`)
- ✅ Color format normalization (rgb → hex)
- ✅ Font-size value normalization (integer cleanup)
- ✅ Comprehensive statistics and reporting
- ✅ File logging for debugging
- ✅ Permission-based access control

### Technical Details
- **Architecture**: Modular design with pluggable property mappers
- **Parser**: Sabberworm CSS parser integration
- **Storage**: Kit metadata integration
- **Testing**: PHPUnit test suite with 95%+ coverage
- **Performance**: Optimized for large CSS files
- **Security**: Input validation and permission checks

### Limitations (MVP)
- ❌ Complex selectors (`.parent .child`, `.button:hover`)
- ❌ Responsive/breakpoint styles
- ❌ Properties other than `color` and `font-size`
- ❌ Pseudo-selectors and combinators

### Future Roadmap
See `docs/class/FUTURE.md` for planned enhancements:
- Additional CSS properties (background, border, spacing)
- Responsive/breakpoint support
- Complex selector handling
- Advanced CSS features (gradients, shadows)
- Performance optimizations
- UI integration
