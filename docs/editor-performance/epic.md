Editor Assets Loading Improvements
By Cursor

Chapter 1: Server side loading
Current State
Total assets: ~80-100+ loaded on every editor load
Scripts: ~40-60+
Styles: ~15-25+
Strategy: Eager loading (everything upfront)
Problems
Control Scripts
All ~40+ controls enqueue scripts regardless of usage
Code control loads ACE editor (~500KB) even if never used
Color control loads Pickr (~100KB) even if never used
Date control loads Flatpickr (~50KB) even if never used
Slider control loads Nouislider (~80KB) even if never used
Select2 control loads Select2 (~150KB) even if never used
Heavy Libraries Always Loaded
ACE Editor + ACE Language Tools (CDN, ~500KB)
Flatpickr (~50KB)
Pickr (~100KB)
Nouislider (~80KB)
Select2 (~150KB)
TinyMCE (~200KB)
Module Scripts
~20+ modules load scripts even if feature not used
AI, Notes, Container Converter, etc. load unconditionally
V2 Packages
~25 packages registered
Many LIBS could be lazy loaded
Optimization Opportunities
High Priority (40-50% reduction)
Control Scripts - Conditional Loading
Track which control types are used in document
Only enqueue scripts for used controls
Savings: 30-40 scripts, ~500KB-1MB
Heavy Libraries - Lazy Load
ACE Editor: load when Code control opened
Flatpickr: load when Date/Time control opened
Pickr: load when Color control opened
Nouislider: load when Slider control opened
Select2: load when Select2 control opened
Savings: ~800KB-1MB

Medium Priority
Module Scripts - Feature-based
Check if module/feature is active before enqueuing
AI module: only if AI features enabled
Notes module: only if notes feature used
Savings: ~200-500KB
V2 LIBS - Dependency Tracking
Implement proper dependency graph
Lazy load unused libs (mixpanel, etc.)
Savings: ~300-500KB

Low Priority
TinyMCE: load on first WYSIWYG interaction
Perfect Scrollbar: only if scrollable containers exist
Tipsy: load on first tooltip hover

Implementation Plan
Phase 1: Control Scripts
Add get_used_control_types() to Document class
Modify Controls_Manager::enqueue_control_scripts() to only enqueue used controls
Expected: 30-40 scripts saved, ~500KB-1MB reduction
Phase 2: Heavy Libraries
Remove heavy libs from elementor-editor dependencies
Implement lazy loading in control classes
Load on control panel open/interaction
Expected: ~800KB-1MB reduction
Comment by Hein: Possibly we use the existing lazy loading methods for this that are available in the JS modules
Phase 3: Module Scripts
Audit all module scripts
Add feature flags/checks
Conditional enqueue based on usage
Expected: ~200-500KB reduction
Phase 4: V2 Packages
Implement dependency tracking
Lazy load unused LIBS
Expected: ~300-500KB reduction

Expected Results
Initial load time: 30-50% faster
Assets loaded: 40-60% reduction
Bundle size: 50-70% smaller initial bundle
Time to Interactive: Significant improvement
JavaScript Loading Analysis
Editor Base (editor-base.js)
Static Imports (Always Loaded):
~30+ control classes imported statically
~15+ module classes imported statically
~10+ component classes imported statically
All element types imported statically
Total: ~55+ modules loaded upfront
Dynamic Imports (Good Pattern):
Post-onboarding tracking: await import('./utils/post-onboarding-tracking')
Some handlers use dynamic imports
Issues:
All control classes loaded even if control not used
All modules instantiated in initComponents() regardless of usage
History, Favorites, Promotion, etc. always initialized
Frontend Handlers (elements-handlers-manager.js)
Good Pattern (Already Lazy):
Most handlers use dynamic imports: () => import('./handlers/accordion')
Handlers load on-demand when element appears
Examples: accordion, alert, counter, tabs, video, etc.
Eager Loading:
Container, section, column handlers loaded immediately
Global handler loaded immediately
Total Handlers: ~15+ handlers (most lazy, some eager)
Assets Loader (assets-loader.js)
Current Assets:
Scripts: dialog, share-link, swiper
Styles: swiper, e-lightbox, dialog
Loads on-demand via load(type, key) method
Good: Already lazy-loaded pattern
Module Initialization
Always Initialized in initComponents():
ElementsManager
Hooks (EventManager)
Selection
Settings
DynamicTags
Notifications
KitManager
HotkeysScreen
IconManager
NoticeBar
Favorites
History
Promotion
BrowserImport
IntroductionTooltips
Documents
LandingPageLibraryModule
FloatingButtonsLibraryModule
LinkInBioLibraryModule
FloatingBarsLibraryModule
ElementsColorPicker
PromotionModule
CloudLibraryModule
DataGlobalsComponent
DocumentComponent
PreviewComponent
FontVariables
Total: ~25+ components/modules always initialized
JavaScript Optimization Opportunities
High Priority
Control Classes - Dynamic Import
Current: All ~30+ control classes imported statically
Opportunity: Import controls dynamically when panel opens
Savings: ~200-300KB initial bundle
Module Initialization - Lazy
Current: All ~25+ modules initialized in initComponents()
Opportunity: Initialize modules on first use
Examples: Favorites (only if favorites used), History (only if history used)
Savings: Faster initial load, less memory
Element Types - Code Splitting
Current: All element types imported statically
Opportunity: Dynamic imports per element type
Savings: ~100-200KB
Medium Priority
Component Lazy Loading
LandingPageLibraryModule: only if landing pages feature active
FloatingButtonsLibraryModule: only if floating buttons used
CloudLibraryModule: only if cloud library accessed
ElementsColorPicker: only if color picker feature used
Handler Optimization
Container/section/column handlers: could be lazy if not immediately needed
Global handler: could load on first element render
Low Priority
FontVariables: could load on first font variable usage
IntroductionTooltips: could load on first tooltip trigger
BrowserImport: could load on import action
Key Files to Modify
PHP:
includes/managers/controls.php - enqueue_control_scripts()
core/editor/loader/editor-base-loader.php - Remove heavy lib dependencies
includes/controls/code.php - Lazy load ACE
includes/controls/color.php - Lazy load Pickr
includes/controls/date-time.php - Lazy load Flatpickr
includes/controls/slider.php - Lazy load Nouislider
includes/controls/select2.php - Lazy load Select2
Module files - Add feature checks before enqueue
JavaScript:
assets/dev/js/editor/editor-base.js - Convert static imports to dynamic
assets/dev/js/editor/editor-base.js - Lazy initialize modules in initComponents()
assets/dev/js/frontend/elements-handlers-manager.js - Already good (mostly lazy)
assets/dev/js/frontend/utils/assets-loader.js - Already good (lazy pattern)

