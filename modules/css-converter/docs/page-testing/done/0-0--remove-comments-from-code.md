We don't want to see comments in our codebase.
If necessary, we can extract a codeblock to method with a selfexplantory name.

Only in expectional cases we can keep them, but we prefer not to.

Especially all comments about atomic widgets should be deleted.

List in this document all files that need to be cleaned up inside the @/css-converter folder.

# Files Requiring Comment Cleanup

## 🔥 HIGH PRIORITY - Atomic Widget Comments & Docblocks

### Core Services (Heavy Comment Usage)
- `services/widgets/widget-creator.php` - Contains atomic widget comments, TODO items, and extensive docblocks
- `services/css/processing/unified-css-processor.php` - Heavy debug logging, atomic widget comments, docblocks
- `services/widgets/widget-mapper.php` - Atomic widget references, NOTE comments
- `services/atomic-widgets/css-to-atomic-props-converter.php` - Atomic widget implementation comments
- `services/atomic-widgets/atomic-data-parser.php` - TODO comments, atomic widget docblocks

### Property Mappers (Atomic Widget Docblocks)
- `convertors/css-properties/properties/background-property-mapper.php` - Extensive atomic widget compliance docblocks
- `convertors/css-properties/properties/border-radius-property-mapper.php` - Atomic widget comments
- `convertors/css-properties/properties/width-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/height-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/margin-property-mapper.php` - Atomic widget docblocks
- `convertors/css-properties/properties/padding-property-mapper.php` - Atomic widget docblocks
- `convertors/css-properties/properties/font-size-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/box-shadow-property-mapper.php` - Atomic widget comments
- `convertors/css-properties/properties/border-property-mapper.php` - TODO comments, atomic docblocks
- `convertors/css-properties/properties/border-width-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/border-style-property-mapper.php` - Atomic widget docblocks
- `convertors/css-properties/properties/opacity-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/color-property-mapper.php` - Atomic widget docblocks
- `convertors/css-properties/properties/background-color-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/flex-properties-mapper.php` - Atomic widget comments
- `convertors/css-properties/properties/display-property-mapper.php` - Atomic compliance docblocks
- `convertors/css-properties/properties/position-property-mapper.php` - Atomic widget comments
- `convertors/css-properties/properties/text-align-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/flex-direction-property-mapper.php` - Atomic widget docblocks
- `convertors/css-properties/properties/positioning-property-mapper.php` - NOTE comments, atomic docblocks
- `convertors/css-properties/properties/transform-property-mapper.php` - Atomic compliance comments
- `convertors/css-properties/properties/atomic-padding-property-mapper.php` - Atomic widget comments

### Base Classes & Implementations
- `convertors/css-properties/implementations/property-mapper-base.php` - Docblocks, atomic widget comments
- `convertors/css-properties/implementations/atomic-only-property-mapper-base.php` - Atomic compliance docblocks
- `convertors/css-properties/implementations/atomic-only-mapper-factory.php` - Atomic widget comments
- `convertors/css-properties/implementations/class-property-mapper-registry.php` - Docblocks, atomic comments

## 🟡 MEDIUM PRIORITY - Processing & Service Classes

### CSS Processing Services
- `services/css/processing/processors/id-selector-processor.php` - Docblocks, processing comments
- `services/css/processing/processors/css-parsing-processor.php` - Processing comments, docblocks
- `services/css/processing/unified-style-manager.php` - Docblocks, processing comments
- `services/css/processing/css-property-conversion-service.php` - TODO comments, docblocks
- `services/css/processing/css-shorthand-expander.php` - Processing comments, docblocks
- `services/css/processing/reset-style-detector.php` - Docblocks, detection comments

### Widget Services
- `services/widgets/widget-conversion-service.php` - Conversion comments, docblocks
- `services/widgets/widget-hierarchy-processor.php` - NOTE comments, processing docblocks
- `services/widgets/widget-conversion-reporter.php` - Reporting comments, docblocks
- `services/widgets/widget-error-handler.php` - Error handling comments
- `services/atomic-widgets/atomic-widget-settings-preparer.php` - Atomic widget comments

### Global Classes & Variables
- `services/global-classes/unified/global-classes-registration-service.php` - Atomic widget comments, docblocks
- `services/styles/css-converter-global-styles.php` - Styling comments, docblocks
- `routes/variables-route.php` - TODO comments, API docblocks

### Parsing & Utility Services
- `services/css/html-class-modifier-service.php` - Docblocks, modifier comments
- `services/css/nested-selector-flattening-service.php` - Flattening comments, docblocks
- `services/css/nested-class-mapping-service.php` - Mapping comments, docblocks
- `services/css/flattened-class-name-generator.php` - Generation comments, docblocks
- `services/css/parsing/html-parser.php` - Parsing comments, docblocks
- `parsers/css-parser.php` - Parser comments, docblocks
- `services/css/nested-selector-parser.php` - Parser comments, docblocks

## 🟢 LOW PRIORITY - Test Files & Examples

### PHPUnit Test Files (All contain docblocks and test comments)
- `tests/phpunit/property-mappers/color-properties/ColorPropertyMapperTest.php`
- `tests/phpunit/property-mappers/size-properties/WidthPropertyMapperTest.php`
- `tests/phpunit/property-mappers/size-properties/DimensionPropertyMapperTest.php`
- `tests/phpunit/property-mappers/size-properties/MaxWidthPropertyMapperTest.php`
- `tests/phpunit/property-mappers/flex-properties/FlexPropertyMapperTest.php`
- `tests/phpunit/property-mappers/flex-properties/AlignItemsPropertyMapperTest.php`
- `tests/phpunit/property-mappers/shadow-properties/BoxShadowPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/OpacityPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/TransitionPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/TextAlignPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/FilterPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/TextDecorationPropertyMapperTest.php`
- `tests/phpunit/property-mappers/string-properties/TextTransformPropertyMapperTest.php`
- `tests/phpunit/property-mappers/layout-properties/DisplayPropertyMapperTest.php`
- `tests/phpunit/property-mappers/layout-properties/PositionPropertyMapperTest.php`
- `tests/phpunit/property-mappers/AtomicWidgetComplianceTestCase.php`
- `tests/phpunit/property-mappers/border-properties/BorderColorPropertyMapperTest.php`
- `tests/phpunit/property-mappers/border-properties/BorderRadiusPropertyMapperTest.php`
- `tests/phpunit/property-mappers/border-properties/BorderZeroPropertyMapperTest.php`
- `tests/phpunit/property-mappers/border-properties/BorderStylePropertyMapperTest.php`
- `tests/phpunit/property-mappers/border-properties/BorderShorthandPropertyMapperTest.php`
- `tests/phpunit/property-mappers/border-properties/BorderWidthPropertyMapperTest.php`
- `tests/phpunit/property-mappers/background-properties/BackgroundGradientPropertyMapperTest.php`
- `tests/phpunit/property-mappers/background-properties/BackgroundPropertyMapperTest.php`
- `tests/phpunit/property-mappers/background-properties/BackgroundColorPropertyMapperTest.php`
- `tests/phpunit/property-mappers/background-properties/BackgroundImagePropertyMapperTest.php`
- `tests/phpunit/property-mappers/font-properties/FontSizePropertyMapperTest.php`
- `tests/phpunit/property-mappers/font-properties/LineHeightPropertyMapperTest.php`
- `tests/phpunit/property-mappers/font-properties/FontWeightPropertyMapperTest.php`
- `tests/phpunit/property-mappers/dimensions-properties/PaddingPropertyMapperTest.php`
- `tests/phpunit/property-mappers/dimensions-properties/MarginPropertyMapperTest.php`

### Service Test Files
- `tests/services/global-classes/unified/global-classes-registration-service-test.php`
- `tests/services/global-classes/unified/global-classes-detection-service-test.php`
- `tests/services/global-classes/unified/global-classes-integration-service-test.php`
- `tests/services/global-classes/unified/global-classes-conversion-service-test.php`

### Example & Experimental Files
- `examples/global-classes-integration-example.php`
- `services/widgets/EXPERIMENT-MINIMAL-CLEANING.php`
- `docs/page-testing/css-preprocessing-backup.php`
- `docs/test/test-class-conversion.php`

### Duplicate/Legacy Files (Consider Removal)
- `convertors/css-properties/properties/margin-duplicate.php`
- `convertors/css-properties/properties/margin-duplicate2.php`

## 📋 Comment Types to Remove

1. **Atomic Widget Comments** - All references to atomic widget compliance, implementation notes
2. **Docblocks** - Class and method documentation blocks (/** ... */)
3. **TODO Comments** - All TODO, FIXME, NOTE comments
4. **Debug Comments** - Temporary debugging comments and error_log statements
5. **Implementation Comments** - Comments explaining what the code does (replace with descriptive method names)
6. **Compliance Comments** - Comments about following standards or patterns

## 🎯 Cleanup Strategy

1. **Start with HIGH PRIORITY files** - Focus on core services and property mappers first
2. **Extract logic to methods** - Replace comments with descriptive method names where needed
3. **Remove atomic widget references** - All atomic widget compliance comments should be deleted
4. **Clean docblocks** - Remove all /** ... */ documentation blocks
5. **Preserve only exceptional cases** - Keep comments only when absolutely necessary for business logic

**Total Files Identified: 138+ files requiring comment cleanup**
