# CSS Converter - Legacy Code Backup

## 📁 Backup Structure

This folder contains the complete backup of the original CSS Converter implementation before migrating to the atomic widget-based architecture.

### Backup Date
**Created:** September 23, 2025

### Original Architecture
```
CSS Input → Property Mappers → Manual JSON Creation → Output
HTML Input → HTML Parser → Widget Mapper → Widget Creator → Manual Widget JSON → Output
```

## 📂 Folder Contents

### `services/`
- **`css/`** - CSS parsing and processing services
  - `parsing/html-parser.php` - Original HTML DOM parser
  - `processing/css-processor.php` - CSS rule processing
  - `processing/css-property-conversion-service.php` - Property conversion coordination
- **`widgets/`** - Widget creation and mapping services
  - `widget-conversion-service.php` - Main widget conversion orchestrator
  - `widget-creator.php` - Manual widget JSON creation
  - `widget-mapper.php` - HTML tag to widget type mapping
  - `widget-hierarchy-processor.php` - Parent-child relationship handling
- **`global-classes/`** - Global class conversion services
- **`variables/`** - CSS variable processing services

### `convertors/`
- **`css-properties/`** - CSS property mappers (legacy manual approach)
  - `properties/` - Individual property mapper implementations
  - `implementations/` - Base classes and factory patterns

### `routes/`
- REST API endpoint handlers for the original system

### `tests/`
- PHPUnit tests for the original implementation

## 🚨 Legacy Issues (Reasons for Migration)

### CSS Property Conversion
- ❌ Manual JSON structure creation
- ❌ No validation against atomic widget schemas
- ❌ Risk of schema drift and inconsistencies
- ❌ Hardcoded `$$type` assignments
- ❌ Missing prop type validation

### HTML Widget Creation
- ❌ Manual widget JSON creation
- ❌ No atomic widget integration
- ❌ Hardcoded widget properties
- ❌ No prop type validation or sanitization

## 🎯 Migration to Atomic Widget Architecture

### New Architecture
```
CSS Input → Property Mappers → Atomic Widget Prop Types → Validated JSON → Output
HTML Input → HTML Parser → Atomic Widget Factory → Validated Widget JSON → Output
```

### Benefits of New Approach
- ✅ Guaranteed schema compliance via atomic widget prop types
- ✅ Automatic validation and sanitization
- ✅ Future-proof architecture
- ✅ Eliminates manual JSON creation
- ✅ Built-in error handling
- ✅ Consistent with Elementor's atomic widget system

## 📋 Restoration Instructions

If needed, this backup can be restored by:

1. **Stop the new implementation**
2. **Copy backup contents back to main folders:**
   ```bash
   cp -r backup/services/* services/
   cp -r backup/convertors/* convertors/
   cp -r backup/routes/* routes/
   cp -r backup/tests/* tests/
   ```
3. **Clear any new atomic widget integration files**

## 🔍 Reference

This backup serves as:
- **Historical reference** for understanding the original implementation
- **Rollback option** if migration issues arise
- **Comparison baseline** for validating new atomic widget approach
- **Learning resource** for understanding the evolution of the CSS converter

---

**Note:** This backup represents the state of the CSS Converter before atomic widget integration. The new implementation should provide superior reliability, maintainability, and schema compliance.
