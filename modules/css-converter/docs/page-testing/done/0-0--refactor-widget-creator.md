# Widget Creator Refactoring - Stashed Changes

## Original Request
plugins/elementor-css/modules/css-converter/services/widgets/widget-creator.php

This file is ugly and dirty.

Can we refactor is with clean code principles?

Can we use a design pattern?

## Stashed Changes Categorization

### Phase 1: Widget Creator Refactoring (APPLY FIRST)
**Core widget creation refactoring with new architecture**

#### New Architecture Files (Created)
- `services/widgets/widget-creation-orchestrator.php` (NEW - Main orchestrator)
- `services/widgets/widget-creation-service-locator.php` (NEW - Service locator)
- `services/widgets/widget-creation-command-pipeline.php` (NEW - Command pipeline)
- `services/widgets/widget-creation-context.php` (NEW - Data container)
- `services/widgets/widget-creation-result.php` (NEW - Result container)
- `services/widgets/contracts/widget-creation-command-interface.php` (NEW - Command interface)

#### Command Classes (Created)
- `services/widgets/commands/create-elementor-post-command.php` (NEW)
- `services/widgets/commands/process-css-variables-command.php` (NEW)
- `services/widgets/commands/process-widget-hierarchy-command.php` (NEW)
- `services/widgets/commands/convert-widgets-to-elementor-command.php` (NEW)
- `services/widgets/commands/save-to-document-command.php` (NEW)
- `services/widgets/commands/clear-cache-command.php` (NEW)

#### Service Classes (Created)
- `services/widgets/elementor-document-manager.php` (NEW)
- `services/widgets/widget-cache-manager.php` (NEW)
- `services/widgets/css-variable-processor.php` (NEW)
- `services/widgets/widget-creation-statistics-collector.php` (NEW)

#### Factory Classes (Created)
- `services/widgets/contracts/widget-factory-interface.php` (NEW)
- `services/widgets/widget-factory-registry.php` (NEW)
- `services/widgets/factories/atomic-widget-factory.php` (NEW)

#### Modified Files
- `services/widgets/widget-conversion-service.php` (Updated to use orchestrator)
- `services/widgets/unified-widget-conversion-service.php` (Updated to use orchestrator)

### Phase 2: Module Loading & Route Registration
**Critical infrastructure fixes**

#### Core Module
- `modules/css-converter/module.php` (Enhanced loading system + route registration)

#### Route Registration
- `modules/css-converter/routes/atomic-widgets-route.php` (Fixed registration + dependencies)
- `modules/css-converter/routes/variables-route.php` (Removed require_once)

### Phase 3: Property Mapper System Fixes
**Class loading and dependency resolution**

#### Registry & Factory
- `convertors/css-properties/implementations/class-property-mapper-registry.php` (Added require_once back)
- `convertors/css-properties/implementations/atomic-only-mapper-factory.php` (Added use statement)
- `convertors/css-properties/implementations/property-mapper-base.php` (Comments removed)
- `convertors/css-properties/implementations/atomic-only-property-mapper-base.php` (Comments removed)

#### Property Mappers (Comments removed from all)
- `convertors/css-properties/properties/color-property-mapper.php`
- `convertors/css-properties/properties/background-color-property-mapper.php`
- `convertors/css-properties/properties/background-property-mapper.php`
- `convertors/css-properties/properties/font-size-property-mapper.php`
- `convertors/css-properties/properties/margin-property-mapper.php`
- `convertors/css-properties/properties/atomic-padding-property-mapper.php`
- `convertors/css-properties/properties/width-property-mapper.php`
- `convertors/css-properties/properties/border-radius-property-mapper.php`
- `convertors/css-properties/properties/box-shadow-property-mapper.php`
- `convertors/css-properties/properties/opacity-property-mapper.php`
- `convertors/css-properties/properties/height-property-mapper.php`
- `convertors/css-properties/properties/display-property-mapper.php`
- `convertors/css-properties/properties/position-property-mapper.php`
- `convertors/css-properties/properties/flex-direction-property-mapper.php`
- `convertors/css-properties/properties/text-align-property-mapper.php`
- `convertors/css-properties/properties/transform-property-mapper.php`
- `convertors/css-properties/properties/border-property-mapper.php`
- `convertors/css-properties/properties/border-style-property-mapper.php`
- `convertors/css-properties/properties/border-width-property-mapper.php`
- `convertors/css-properties/properties/flex-properties-mapper.php`
- `convertors/css-properties/properties/padding-property-mapper.php`
- `convertors/css-properties/properties/positioning-property-mapper.php`

#### Duplicate Files (Clean up needed)
- `convertors/css-properties/properties/margin-duplicate.php` (DELETE)
- `convertors/css-properties/properties/margin-duplicate2.php` (DELETE)

### Phase 4: CSS Service Dependencies
**CSS processing and utility classes**

#### CSS Services
- `services/css/css-selector-utils.php` (Comments removed)
- `services/css/css-class-usage-tracker.php` (Removed require_once)
- `services/css/nested-selector-parser.php` (Removed require_once)
- `services/css/nested-class-mapping-service.php` (Removed require_once)
- `services/css/nested-selector-flattening-service.php` (Comments removed)
- `services/css/flattened-class-name-generator.php` (Comments removed)

#### CSS Processing
- `services/css/processing/unified-css-processor.php` (Removed require_once)
- `services/css/processing/css-processor-factory.php` (Removed require_once)
- `services/css/processing/css-processor-registry.php` (Removed require_once)
- `services/css/processing/css-property-conversion-service.php` (Removed require_once)
- `services/css/processing/css-shorthand-expander.php` (Comments removed)

#### CSS Processors
- `services/css/processing/processors/css-parsing-processor.php` (Comments removed)
- `services/css/processing/processors/global-classes-processor.php` (Comments removed)
- `services/css/processing/processors/id-selector-processor.php` (Removed require_once)
- `services/css/processing/processors/rule-classification-processor.php` (Comments removed)

#### HTML Parsing
- `services/css/parsing/html-parser.php` (Removed require_once)

### Phase 5: Atomic Widgets System
**Atomic widgets orchestrator and dependencies**

#### Atomic Services
- `services/atomic-widgets/atomic-data-parser.php` (Removed require_once)
- `services/atomic-widgets/atomic-widget-json-creator.php` (Comments removed)
- `services/atomic-widgets/atomic-widget-settings-preparer.php` (Comments removed)
- `services/atomic-widgets/css-to-atomic-props-converter.php` (Fixed syntax + removed require_once)
- `services/widgets/atomic-widget-data-formatter.php` (Added use statement)

### Phase 6: Global Services
**Global classes, variables, logging, and statistics**

#### Global Classes
- `services/global-classes/unified/global-classes-integration-service.php` (Comments removed)
- `services/global-classes/unified/global-classes-registration-service.php` (Comments removed)
- `services/global-classes/unified/global-classes-service-provider.php` (Comments removed)

#### Variables
- `services/variables/css-value-normalizer.php` (Comments removed)
- `services/variables/nested-variable-renamer.php` (Comments removed)
- `services/variables/variables-integration-service.php` (Comments removed)
- `services/variables/variables-registration-service.php` (Comments removed)

#### Support Services
- `services/logging/conversion-logger.php` (Comments removed)
- `services/stats/conversion-statistics-collector.php` (Comments removed)
- `services/styles/css-converter-global-classes-override.php` (Comments removed)

#### Experimental
- `services/widgets/EXPERIMENT-MINIMAL-CLEANING.php` (Removed require_once)
- `services/widgets/widget-hierarchy-processor.php` (Comments removed)
- `services/widgets/widget-mapper.php` (Comments removed)

### Phase 7: Test Files
**Playwright test updates**

#### Test Documentation
- `tests/playwright/sanity/modules/css-converter/duplicates/GLOBAL-CLASS-CREATION-ANALYSIS.md`
- `tests/playwright/sanity/modules/css-converter/payloads/PAYLOADS.md`

#### Test Files
- `tests/playwright/sanity/modules/css-converter/payloads/background-styling.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/border-and-shadow.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/css-id.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/edge-cases.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/inline-css.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/spacing-and-layout.test.ts`
- `tests/playwright/sanity/modules/css-converter/payloads/typography.test.ts`
- `tests/playwright/sanity/modules/css-converter/url-imports/flat-classes-url-import.test.ts`

## Implementation Plan

1. **Phase 1**: Apply widget creator refactoring first
2. **Test**: Run background-prop-type tests
3. **Review**: Wait for approval before continuing
4. **Phase 2-7**: Apply remaining phases systematically after approval
