Study reset and body classes/styling.

E.g.
body {
        background: pink;
}

h1 {
        font-size: 20px;
}

Study if we can map this default styling in the original document.

Page Builder styling:
Study how and where we can set this styling in Elementor v4.
Elementor v3 has Site Settings, which we might have to use for now.

Alternativey we could decide to enqueue a reset.css style file or load the css in the theme customiser stylesheet. In that way we might be able to map the reset styling from the original url as closely as possible.

Remove default theme styling:
Probably we will work with the Hello Theme. It has the option to deactivate all default styling:
http://elementor.local:10003/wp-admin/admin.php?page=hello-elementor-settings

Disable default widget styling:
Atomic widgets have default styling, e.g. font-size and margin for h1. But it will be difficult to map this with the import url.
Preferably I would disable/remove all default v4 widget styling. Study how we can do this.

---

# RESET STYLING HANDLING - COMPREHENSIVE RESEARCH & PRD

## 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Executive Summary
The CSS Converter needs to handle CSS reset styles (body, h1-h6, p, etc.) when converting HTML/CSS content to Elementor v4 atomic widgets. Currently, the converter focuses on element-specific styling but doesn't address page-level or default element resets that are common in source content.

### Problem Statement
When importing HTML/CSS content with reset styling (e.g., `body { background: pink; }` or `h1 { font-size: 20px; }`), the converted Elementor page doesn't preserve these defaults because:
1. Atomic widgets have their own default styles that override imported resets
2. Hello Theme has default styling that may conflict
3. There's no clear mapping between source page resets and Elementor's styling system
4. Body-level styles have no direct widget equivalent

### Goals & Objectives

#### Primary Goals
- **Preserve source page appearance**: Imported content should match source URL styling as closely as possible
- **Handle element resets**: Body, heading, and other element default styles should be mapped appropriately
- **Atomic widget compatibility**: Solution must work with Elementor v4 atomic widgets architecture
- **User control**: Users should be able to control reset handling behavior

#### Success Metrics
- Visual accuracy: 90%+ match between source and converted page appearance
- Reset coverage: 100% of common reset selectors handled (body, h1-h6, p, a, etc.)
- Performance: Reset application adds < 500ms to conversion time
- User satisfaction: Minimal manual adjustments needed after conversion

### User Stories

#### As a Content Importer
- I want body background colors from source pages to be preserved in the imported Elementor page
- I want heading font sizes from source to match in the converted version
- I want to see a preview showing how resets will be applied before conversion
- I want to be able to disable reset import if I prefer Elementor defaults

#### As a Developer
- I want a clear API for defining how reset styles are mapped to Elementor
- I want the system to be extensible for custom reset handling
- I want comprehensive logging showing which resets were applied and which were skipped
- I want performance metrics showing reset processing impact

### Technical Requirements

#### Functional Requirements
1. **Reset Detection**: Identify body, h1-h6, p, a, and other element-level selectors in source CSS
2. **Mapping Strategy**: Define how each reset selector maps to Elementor's styling system
3. **Priority Handling**: Determine precedence when resets conflict with inline styles
4. **Storage Location**: Define where reset styles are stored (Site Settings, custom CSS, global classes, etc.)
5. **Application Mechanism**: Ensure resets apply correctly to converted widgets

#### Non-Functional Requirements
1. **Performance**: Reset processing should not significantly impact conversion time
2. **Maintainability**: Solution should be easy to update as Elementor v4 evolves
3. **Compatibility**: Must work with Hello Theme and other Elementor-compatible themes
4. **Scalability**: Should handle pages with 100+ reset rules efficiently

### Constraints & Assumptions

#### Constraints
- Must work within Elementor v4 atomic widgets architecture
- Cannot modify core Elementor or atomic widget classes
- Must respect WordPress and Elementor security policies
- Should minimize user-facing configuration complexity

#### Assumptions
- Users are primarily importing from external URLs, not creating content from scratch
- Source pages use standard CSS reset patterns (normalize.css, reset.css, etc.)
- Users want high-fidelity conversion over Elementor default styling
- Hello Theme is the primary theme being used

### Out of Scope (MVP)
- Responsive/breakpoint-specific resets
- CSS animations and transitions in resets
- Browser-specific reset overrides
- Custom theme integration beyond Hello Theme

---

## 🎯 APPROACH 1: SITE SETTINGS / KIT SETTINGS INTEGRATION

### Description
Store reset styles in Elementor's Site Settings (Kit document) using existing theme style settings or new custom fields.

### Technical Architecture

#### Storage Location
```php
// Kit document settings
'settings' => [
    'custom_css_resets' => [
        'body' => [
            'background-color' => '#ffffff',
            'color' => '#333333',
            'font-family' => 'Arial, sans-serif'
        ],
        'h1' => [
            'font-size' => ['$$type' => 'size', 'value' => ['size' => 32, 'unit' => 'px']],
            'font-weight' => 700,
            'color' => '#000000'
        ]
    ]
]
```

#### Implementation Strategy
```php
// Parse reset styles from source CSS
$reset_parser = new Reset_Style_Parser();
$reset_styles = $reset_parser->extract_reset_styles( $source_css );

// Convert to atomic widget format
$atomic_converter = new Reset_To_Atomic_Converter();
$atomic_resets = $atomic_converter->convert( $reset_styles );

// Store in Kit document
$kit = Plugin::$instance->kits_manager->get_active_kit();
$kit->update_settings( [
    'custom_css_resets' => $atomic_resets
] );

// Apply via CSS injection or base styles
add_action( 'elementor/frontend/after_enqueue_styles', function() use ( $atomic_resets ) {
    $css_generator = new Reset_CSS_Generator();
    wp_add_inline_style( 'elementor-frontend', $css_generator->generate( $atomic_resets ) );
} );
```

#### Widget Integration
```php
// Option 1: Modify base_styles on atomic widgets
class Atomic_Widget_Reset_Injector {
    public function inject_base_styles( $element_instance, $reset_styles ) {
        $element_type = $element_instance->get_name();
        
        if ( isset( $reset_styles[ $element_type ] ) ) {
            // Inject as lowest priority base style
            $element_instance->add_base_style( 'reset', $reset_styles[ $element_type ] );
        }
    }
}

// Option 2: Use Elementor's global styles system
$globals_manager = Plugin::$instance->data_manager->get( 'globals' );
$globals_manager->set_custom_global_style( 'page_resets', $atomic_resets );
```

### Pros
- ✅ **Site-wide consistency**: Resets apply to all pages edited with Elementor
- ✅ **Elementor-native**: Uses existing Kit document infrastructure
- ✅ **UI integration**: Can add settings panel in Site Settings
- ✅ **Export/import**: Resets included in template exports
- ✅ **Performance**: Cached with other kit settings

### Cons
- ❌ **Global scope**: All pages get the same resets (may not match original)
- ❌ **Complexity**: Requires extending Kit document and settings UI
- ❌ **v3/v4 compatibility**: May need different implementations for each version
- ❌ **Override challenges**: Hard to override per-page without conflicts
- ❌ **Migration complexity**: Existing sites would need careful migration

### Questions
1. **Can we extend Kit document settings without modifying core Elementor?**
2. **What's the storage limit for Kit document custom settings?**
3. **How do we handle conflicts between imported resets and existing site resets?**
4. **Should resets be per-kit or per-page?**
5. **How do we expose this in the Site Settings UI?**
6. **What happens when users update their theme - do resets conflict?**
7. **Can we version reset imports for rollback capability?**
8. **How do we handle reset cascading priority (body → h1 inheritance)?**

---

## 🎯 APPROACH 2: CUSTOM RESET.CSS ENQUEUE

### Description
Generate a custom `reset.css` file from imported content and enqueue it with proper priority to override theme and atomic widget defaults.

### Technical Architecture

#### File Generation
```php
class Reset_CSS_File_Generator {
    private $upload_dir;
    private $reset_cache_key = 'elementor_css_converter_reset_css';
    
    public function generate_reset_file( array $reset_styles, int $post_id ): string {
        $css_content = $this->build_reset_css( $reset_styles );
        
        // Create file in uploads/elementor-css-converter/resets/
        $file_path = $this->get_reset_file_path( $post_id );
        file_put_contents( $file_path, $css_content );
        
        // Store reference in post meta
        update_post_meta( $post_id, '_css_converter_reset_file', $file_path );
        
        return $file_path;
    }
    
    private function build_reset_css( array $reset_styles ): string {
        $css = "/* Generated Reset CSS from CSS Converter */\n";
        $css .= "/* Priority: Higher specificity to override atomic widgets */\n\n";
        
        foreach ( $reset_styles as $selector => $properties ) {
            $css .= $this->build_reset_rule( $selector, $properties );
        }
        
        return $css;
    }
    
    private function build_reset_rule( string $selector, array $properties ): string {
        // Add specificity wrapper to ensure override
        $specific_selector = ".elementor-page {$selector}";
        
        $css = "{$specific_selector} {\n";
        foreach ( $properties as $property => $value ) {
            $css .= "    {$property}: {$value} !important;\n";
        }
        $css .= "}\n\n";
        
        return $css;
    }
}
```

#### Enqueue Strategy
```php
class Reset_CSS_Enqueuer {
    public function enqueue_reset_css_for_post( $post_id ) {
        $reset_file = get_post_meta( $post_id, '_css_converter_reset_file', true );
        
        if ( $reset_file && file_exists( $reset_file ) ) {
            wp_enqueue_style(
                "elementor-reset-{$post_id}",
                $this->get_reset_file_url( $reset_file ),
                [ 'elementor-frontend' ], // Load after Elementor frontend
                filemtime( $reset_file )
            );
        }
    }
    
    public function register_hooks() {
        // Enqueue on frontend for converted pages
        add_action( 'wp_enqueue_scripts', function() {
            if ( is_singular() && $this->is_converted_page( get_the_ID() ) ) {
                $this->enqueue_reset_css_for_post( get_the_ID() );
            }
        }, 20 ); // Priority 20 to load after Elementor
    }
}
```

#### Cleanup Strategy
```php
class Reset_CSS_Cleanup {
    public function cleanup_orphaned_resets() {
        // Remove reset files for deleted posts
        $reset_dir = $this->get_reset_directory();
        $files = glob( $reset_dir . '/*.css' );
        
        foreach ( $files as $file ) {
            $post_id = $this->extract_post_id_from_filename( $file );
            
            if ( ! get_post( $post_id ) ) {
                unlink( $file );
            }
        }
    }
}
```

### Pros
- ✅ **Per-page control**: Each converted page gets its own reset CSS
- ✅ **Easy debugging**: Reset CSS is visible and editable file
- ✅ **Specificity control**: Can use !important and specificity to ensure override
- ✅ **Performance**: Browser caching works naturally
- ✅ **Rollback**: Easy to disable by removing file or post meta

### Cons
- ❌ **File management**: Need to handle file creation, cleanup, and synchronization
- ❌ **Storage overhead**: Each page creates a file (though usually small)
- ❌ **Multisite complexity**: Upload directory management across sites
- ❌ **Priority conflicts**: Timing of enqueue matters for override success
- ❌ **Cache invalidation**: Need to handle CSS file version bumping

### Questions
1. **Where should reset CSS files be stored in the WordPress uploads directory?**
2. **How do we handle file cleanup when pages are deleted?**
3. **What's the optimal enqueue priority to ensure override of atomic widgets?**
4. **Should reset CSS be minified for performance?**
5. **How do we handle HTTPS/HTTP URL differences?**
6. **What happens with page duplication - should reset CSS be duplicated?**
7. **How do we version/cache-bust reset CSS files?**
8. **Should there be a global reset CSS in addition to per-page?**
9. **How do we handle reset CSS in multisite environments?**
10. **What's the performance impact of loading an additional CSS file per page?**

---

## 🎯 APPROACH 3: THEME CUSTOMIZER INTEGRATION

### Description
Store reset styles in WordPress Theme Customizer (Customizer API) settings, making them editable via the WordPress admin.

### Technical Architecture

#### Customizer Registration
```php
class Reset_Styles_Customizer {
    public function register_customizer_settings( $wp_customize ) {
        // Add Reset Styles section
        $wp_customize->add_section( 'elementor_reset_styles', [
            'title' => __( 'Elementor Reset Styles', 'elementor-css' ),
            'priority' => 30,
            'description' => __( 'Customize default element styles imported from external content', 'elementor-css' ),
        ] );
        
        // Body background
        $wp_customize->add_setting( 'elementor_reset_body_background', [
            'default' => '',
            'transport' => 'postMessage',
            'sanitize_callback' => 'sanitize_hex_color',
        ] );
        
        $wp_customize->add_control( new WP_Customize_Color_Control(
            $wp_customize,
            'elementor_reset_body_background',
            [
                'label' => __( 'Body Background Color', 'elementor-css' ),
                'section' => 'elementor_reset_styles',
            ]
        ) );
        
        // Heading font sizes
        foreach ( range( 1, 6 ) as $level ) {
            $this->register_heading_settings( $wp_customize, $level );
        }
    }
    
    private function register_heading_settings( $wp_customize, $level ) {
        $wp_customize->add_setting( "elementor_reset_h{$level}_font_size", [
            'default' => '',
            'transport' => 'postMessage',
            'sanitize_callback' => 'sanitize_text_field',
        ] );
        
        $wp_customize->add_control( "elementor_reset_h{$level}_font_size", [
            'label' => sprintf( __( 'H%d Font Size', 'elementor-css' ), $level ),
            'section' => 'elementor_reset_styles',
            'type' => 'text',
        ] );
    }
}
```

#### CSS Generation
```php
class Customizer_Reset_CSS_Generator {
    public function generate_customizer_css() {
        $css = '';
        
        // Body styles
        $body_bg = get_theme_mod( 'elementor_reset_body_background' );
        if ( $body_bg ) {
            $css .= "body.elementor-page { background-color: {$body_bg}; }\n";
        }
        
        // Heading styles
        foreach ( range( 1, 6 ) as $level ) {
            $font_size = get_theme_mod( "elementor_reset_h{$level}_font_size" );
            if ( $font_size ) {
                $css .= ".elementor h{$level} { font-size: {$font_size}; }\n";
            }
        }
        
        return $css;
    }
    
    public function enqueue_customizer_css() {
        $css = $this->generate_customizer_css();
        
        if ( ! empty( $css ) ) {
            wp_add_inline_style( 'elementor-frontend', $css );
        }
    }
}
```

#### Import Integration
```php
class Customizer_Reset_Importer {
    public function import_resets_to_customizer( array $reset_styles ) {
        // Convert imported resets to customizer settings
        foreach ( $reset_styles as $selector => $properties ) {
            $this->map_to_customizer_setting( $selector, $properties );
        }
        
        // Prompt user to review in Customizer
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-info">';
            echo '<p>Reset styles imported to Theme Customizer. ';
            echo '<a href="' . admin_url( 'customize.php?autofocus[section]=elementor_reset_styles' ) . '">Review settings</a>';
            echo '</p></div>';
        } );
    }
    
    private function map_to_customizer_setting( string $selector, array $properties ) {
        switch ( $selector ) {
            case 'body':
                if ( isset( $properties['background-color'] ) ) {
                    set_theme_mod( 'elementor_reset_body_background', $properties['background-color'] );
                }
                break;
                
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                $level = substr( $selector, 1 );
                if ( isset( $properties['font-size'] ) ) {
                    set_theme_mod( "elementor_reset_h{$level}_font_size", $properties['font-size'] );
                }
                break;
        }
    }
}
```

### Pros
- ✅ **User-friendly UI**: WordPress Customizer provides familiar editing interface
- ✅ **Live preview**: Changes can be previewed before applying
- ✅ **Theme integration**: Works naturally with WordPress theme system
- ✅ **Export/import**: Can be included in theme exports
- ✅ **Site-wide control**: Easy to manage global defaults

### Cons
- ❌ **Limited to theme mods**: Customizer settings are theme-specific
- ❌ **UI overhead**: Need to create controls for every possible reset property
- ❌ **No per-page control**: All pages get the same reset styles
- ❌ **Theme switching**: Settings lost when changing themes (unless exported)
- ❌ **Scalability**: Adding 50+ reset properties clutters Customizer UI

### Questions
1. **Should reset settings be theme-agnostic or theme-specific?**
2. **How do we handle the large number of possible reset properties in UI?**
3. **Should we use Customizer panels for organization (Typography, Colors, etc.)?**
4. **How do we handle conflicts with existing theme Customizer settings?**
5. **What happens when user switches themes - should resets persist?**
6. **Should we provide preset reset collections (normalize.css, reset.css, etc.)?**
7. **How do we handle element selector specificity (h1.title vs h1)?**
8. **Should resets be exportable/importable separately from theme?**
9. **How do we handle responsive reset values in Customizer?**
10. **What's the UX for importing new resets - merge or replace existing?**

---

## 🎯 APPROACH 4: ATOMIC WIDGET BASE STYLES OVERRIDE

### Description
Directly modify or extend atomic widget `base_styles` to inject reset styling at the widget level, ensuring resets apply correctly to each widget instance.

### Technical Architecture

#### Base Styles Injection
```php
class Atomic_Widget_Reset_Injector {
    private $reset_styles_cache = [];
    
    public function __construct() {
        $this->load_reset_styles();
        $this->register_hooks();
    }
    
    private function register_hooks() {
        // Hook into atomic widget initialization
        add_filter( 'elementor/atomic-widgets/base-styles', [ $this, 'inject_reset_base_styles' ], 10, 2 );
        
        // Alternative: Hook into element rendering
        add_action( 'elementor/element/before_render', [ $this, 'inject_reset_inline_styles' ], 10, 1 );
    }
    
    public function inject_reset_base_styles( $base_styles, $element_instance ) {
        $element_type = $element_instance->get_name();
        
        // Get HTML tag for this element (e.g., e-heading → h1-h6)
        $html_tag = $this->get_html_tag_for_element( $element_instance );
        
        if ( isset( $this->reset_styles_cache[ $html_tag ] ) ) {
            // Convert reset styles to atomic widget style format
            $reset_style_def = $this->convert_to_style_definition( 
                $this->reset_styles_cache[ $html_tag ] 
            );
            
            // Inject as lowest-priority base style
            $base_styles['reset-import'] = $reset_style_def;
        }
        
        return $base_styles;
    }
    
    private function convert_to_style_definition( array $css_properties ): Style_Definition {
        $style_def = Style_Definition::make()
            ->set_type( 'class' )
            ->set_label( 'Imported Reset Styles' );
        
        $variant = Style_Variant::make()
            ->set_breakpoint( 'desktop' )
            ->set_state( 'normal' );
        
        foreach ( $css_properties as $property => $value ) {
            // Convert CSS property to atomic widget format
            $atomic_value = $this->css_to_atomic_converter->convert( $property, $value );
            $variant->add_style( $property, $atomic_value );
        }
        
        $style_def->add_variant( $variant );
        
        return $style_def;
    }
    
    private function get_html_tag_for_element( $element_instance ): string {
        // Map atomic widget types to HTML tags
        $mapping = [
            'e-heading' => $element_instance->get_settings( 'tag' ) ?? 'h2',
            'e-paragraph' => 'p',
            'e-flexbox' => 'div',
            'e-button' => 'a',
        ];
        
        return $mapping[ $element_instance->get_name() ] ?? 'div';
    }
}
```

#### Dynamic Reset Loading
```php
class Post_Specific_Reset_Loader {
    public function load_post_resets( $post_id ) {
        $post_resets = get_post_meta( $post_id, '_css_converter_reset_styles', true );
        
        if ( ! empty( $post_resets ) ) {
            add_filter( 'elementor/atomic-widgets/reset-styles', function( $default_resets ) use ( $post_resets ) {
                return array_merge( $default_resets, $post_resets );
            } );
        }
    }
}
```

#### Atomic Prop Type Mapping
```php
class Reset_To_Atomic_Props_Mapper {
    public function map_css_to_atomic_props( string $property, $value ): ?array {
        // Use existing property mappers
        $mapper_registry = Property_Mapper_Registry::instance();
        $mapper = $mapper_registry->get_mapper( $property );
        
        if ( $mapper ) {
            return $mapper->map_to_v4_atomic( $property, $value );
        }
        
        return null;
    }
    
    public function create_atomic_style_variant( array $css_properties ): array {
        $atomic_props = [];
        
        foreach ( $css_properties as $property => $value ) {
            $atomic_prop = $this->map_css_to_atomic_props( $property, $value );
            
            if ( $atomic_prop ) {
                $atomic_props[ $property ] = $atomic_prop;
            }
        }
        
        return [
            '$$type' => 'style-variant',
            'breakpoint' => 'desktop',
            'state' => 'normal',
            'props' => $atomic_props,
        ];
    }
}
```

### Pros
- ✅ **Widget-level control**: Resets apply directly to atomic widgets
- ✅ **Atomic-native**: Uses Elementor v4's base_styles architecture
- ✅ **Per-widget specificity**: Different resets for h1 vs h2, etc.
- ✅ **No external files**: Everything managed through widget data
- ✅ **Performance**: No additional HTTP requests or file I/O

### Cons
- ❌ **Complex implementation**: Requires deep understanding of atomic widgets internals
- ❌ **Fragile**: May break with atomic widgets architecture changes
- ❌ **Difficult debugging**: Widget-level styling harder to inspect
- ❌ **Override challenges**: Base styles may still be overridden by widget-specific styles
- ❌ **Testing complexity**: Need to test against all atomic widget types

### Questions
1. **Can we safely hook into base_styles without modifying core atomic widgets?**
2. **What's the correct priority for reset base styles vs default base styles?**
3. **How do we handle atomic widget instances that don't match reset selectors?**
4. **Should resets be applied to all widget instances or only converted ones?**
5. **How do we handle the mapping between HTML tags and atomic widget types?**
6. **What happens when atomic widgets update their base_styles schema?**
7. **Can we extend Style_Definition dynamically at runtime?**
8. **How do we handle element-specific resets (e.g., h1.title vs h1)?**
9. **Should reset injection be cached for performance?**
10. **How do we debug base_styles injection issues?**

---

## 🎯 APPROACH 5: HYBRID APPROACH - GLOBAL + PER-PAGE

### Description
Combine multiple approaches: site-wide defaults stored in Kit Settings, per-page overrides in custom CSS, and atomic widget integration for fine-grained control.

### Technical Architecture

#### Three-Layer System

**Layer 1: Site-Wide Defaults (Kit Settings)**
```php
class Site_Wide_Reset_Manager {
    public function store_site_defaults( array $reset_styles ) {
        $kit = Plugin::$instance->kits_manager->get_active_kit();
        
        $kit->update_settings( [
            'css_converter_site_resets' => [
                'enabled' => true,
                'styles' => $reset_styles,
                'priority' => 'low', // Can be overridden per-page
            ]
        ] );
    }
    
    public function get_site_defaults(): array {
        $kit = Plugin::$instance->kits_manager->get_active_kit();
        $settings = $kit->get_settings( 'css_converter_site_resets' );
        
        return $settings['styles'] ?? [];
    }
}
```

**Layer 2: Per-Page Overrides (Post Meta)**
```php
class Per_Page_Reset_Manager {
    public function store_page_resets( int $post_id, array $reset_styles, string $mode = 'merge' ) {
        $page_resets = [
            'mode' => $mode, // 'merge', 'replace', 'disable'
            'styles' => $reset_styles,
            'timestamp' => time(),
        ];
        
        update_post_meta( $post_id, '_css_converter_page_resets', $page_resets );
    }
    
    public function get_effective_resets( int $post_id ): array {
        $site_resets = $this->site_wide_manager->get_site_defaults();
        $page_resets = get_post_meta( $post_id, '_css_converter_page_resets', true );
        
        if ( empty( $page_resets ) ) {
            return $site_resets;
        }
        
        switch ( $page_resets['mode'] ) {
            case 'replace':
                return $page_resets['styles'];
                
            case 'disable':
                return [];
                
            case 'merge':
            default:
                return array_merge( $site_resets, $page_resets['styles'] );
        }
    }
}
```

**Layer 3: Atomic Widget Integration**
```php
class Hybrid_Reset_Applicator {
    private $site_wide_manager;
    private $per_page_manager;
    private $atomic_injector;
    
    public function apply_resets_for_page( int $post_id ) {
        // Get effective resets for this page
        $effective_resets = $this->per_page_manager->get_effective_resets( $post_id );
        
        // Apply via multiple methods for robustness
        $this->apply_via_custom_css( $post_id, $effective_resets );
        $this->apply_via_atomic_base_styles( $post_id, $effective_resets );
        $this->apply_via_inline_styles( $post_id, $effective_resets );
    }
    
    private function apply_via_custom_css( int $post_id, array $resets ) {
        // Generate and enqueue custom CSS file
        $css_generator = new Reset_CSS_File_Generator();
        $css_file = $css_generator->generate_reset_file( $resets, $post_id );
        
        add_action( 'wp_enqueue_scripts', function() use ( $css_file, $post_id ) {
            if ( is_singular() && get_the_ID() === $post_id ) {
                $this->enqueue_reset_css( $css_file, $post_id );
            }
        }, 25 );
    }
    
    private function apply_via_atomic_base_styles( int $post_id, array $resets ) {
        // Inject into atomic widget base styles
        add_filter( 'elementor/atomic-widgets/base-styles', function( $base_styles, $element ) use ( $post_id, $resets ) {
            if ( get_the_ID() === $post_id ) {
                return $this->atomic_injector->inject_reset_base_styles( $base_styles, $element, $resets );
            }
            return $base_styles;
        }, 10, 2 );
    }
    
    private function apply_via_inline_styles( int $post_id, array $resets ) {
        // Last resort: inline styles on specific elements
        add_action( 'wp_footer', function() use ( $post_id, $resets ) {
            if ( get_the_ID() === $post_id ) {
                echo '<style id="elementor-reset-inline-' . $post_id . '">';
                echo $this->generate_inline_reset_css( $resets );
                echo '</style>';
            }
        } );
    }
}
```

#### Priority Resolution
```php
class Reset_Priority_Resolver {
    const PRIORITY_ATOMIC_BASE = 1;      // Lowest: Atomic widget defaults
    const PRIORITY_SITE_RESETS = 10;     // Low: Site-wide resets
    const PRIORITY_PAGE_RESETS = 20;     // Medium: Per-page resets
    const PRIORITY_CUSTOM_CSS = 30;      // High: Custom CSS file
    const PRIORITY_INLINE = 40;          // Highest: Inline styles
    
    public function resolve_effective_value( string $property, $post_id, $element_type ): ?array {
        $candidates = [
            self::PRIORITY_ATOMIC_BASE => $this->get_atomic_default( $element_type, $property ),
            self::PRIORITY_SITE_RESETS => $this->get_site_reset_value( $property, $element_type ),
            self::PRIORITY_PAGE_RESETS => $this->get_page_reset_value( $post_id, $property, $element_type ),
            self::PRIORITY_CUSTOM_CSS => $this->get_custom_css_value( $post_id, $property, $element_type ),
            self::PRIORITY_INLINE => $this->get_inline_style_value( $post_id, $property, $element_type ),
        ];
        
        // Return highest priority non-null value
        foreach ( array_reverse( $candidates, true ) as $priority => $value ) {
            if ( null !== $value ) {
                return [
                    'value' => $value,
                    'source' => $this->get_priority_name( $priority ),
                    'priority' => $priority,
                ];
            }
        }
        
        return null;
    }
}
```

### Pros
- ✅ **Maximum flexibility**: Users can choose site-wide, per-page, or disabled
- ✅ **Fallback robustness**: Multiple application methods ensure styles apply
- ✅ **Fine-grained control**: Different priorities for different use cases
- ✅ **Gradual migration**: Can start with one layer and add others
- ✅ **Debugging visibility**: Clear priority system shows which styles apply

### Cons
- ❌ **High complexity**: Multiple systems to maintain and debug
- ❌ **Performance overhead**: Multiple checks and applications per page
- ❌ **Configuration complexity**: Users may find options overwhelming
- ❌ **Maintenance burden**: Changes must propagate through all layers
- ❌ **Conflict potential**: Multiple application methods may conflict

### Questions
1. **Which layer should be the primary source of truth?**
2. **How do we handle conflicts between layers?**
3. **Should users be able to configure which layers are active?**
4. **How do we visualize the priority cascade for users?**
5. **What's the performance impact of multiple application methods?**
6. **Should there be a "preview" mode showing effective styles?**
7. **How do we handle export/import across layers?**
8. **Should layer priorities be configurable?**
9. **How do we debug when styles don't apply as expected?**
10. **What's the migration path from single-layer to hybrid?**

---

## 🔍 COMPREHENSIVE QUESTIONS TO ANSWER

### Architecture & Integration Questions

1. **What's the most important factor: per-page control or site-wide consistency?**
2. **Should reset styles be editable by users after import or locked?**
3. **How do we handle version control for imported reset styles?**
4. **What's the performance budget for reset style application?**
5. **Should we support multiple reset style "profiles" (normalize.css, reset.css, etc.)?**

### Atomic Widgets Compatibility Questions

6. **Can we modify atomic widget base_styles without core modifications?**
7. **What's the correct format for injecting styles into atomic widgets?**
8. **How do atomic widget style priorities work (base_styles vs props vs styles array)?**
9. **Do atomic widgets support style inheritance from parent containers?**
10. **How do we handle atomic widget updates breaking our reset integration?**

### HTML Tag → Widget Mapping Questions

11. **How do we map `body` styles when there's no body widget?**
12. **Should body styles be applied to page container or flexbox wrapper?**
13. **How do we handle element-specific selectors (h1.title vs h1)?**
14. **What about pseudo-selectors (:hover, :focus) in resets?**
15. **Should we support attribute selectors ([type="text"]) in resets?**

### Storage & Persistence Questions

16. **Where should reset styles be stored: post meta, Kit settings, or both?**
17. **How do we handle storage limits for large reset style sets?**
18. **Should resets be versioned for rollback capability?**
19. **What's the data structure for storing complex CSS resets?**
20. **How do we handle export/import of reset styles between sites?**

### User Experience Questions

21. **Should users see a preview of reset styles before import?**
22. **How do we communicate which resets were applied vs skipped?**
23. **Should there be a UI for editing imported reset styles?**
24. **How do we handle conflicts between imported resets and existing site styles?**
25. **Should users be able to selectively apply resets (e.g., only typography, not colors)?**

### CSS Specificity & Priority Questions

26. **What specificity level ensures reset styles override atomic widget defaults?**
27. **How do we handle !important in source reset styles?**
28. **Should imported resets have higher or lower priority than widget-specific styles?**
29. **How do we handle cascade conflicts between multiple reset sources?**
30. **What's the priority order: theme CSS → resets → atomic widgets → inline styles?**

### Performance Questions

31. **What's the performance impact of applying resets to 100+ widgets on a page?**
32. **Should reset styles be cached and how?**
33. **Is it better to generate CSS files or use inline styles for performance?**
34. **How do we minimize CSS file requests while maintaining flexibility?**
35. **What's the memory footprint of storing complex reset styles?**

### Hello Theme Integration Questions

36. **Should we detect and disable Hello Theme default styles when importing resets?**
37. **How do we handle conflicts with Hello Theme's reset.css and theme.css?**
38. **Can we programmatically toggle Hello Theme style settings during import?**
39. **Should Hello Theme deregistration be automatic or user-controlled?**
40. **What happens if user re-enables Hello Theme styles after importing resets?**

### Edge Cases & Special Scenarios

41. **How do we handle universal selectors (* {}) in resets?**
42. **What about @media queries in reset styles - ignore or support?**
43. **Should we support @font-face declarations in resets?**
44. **How do we handle CSS custom properties (--variables) in resets?**
45. **What about @supports and other at-rules in reset CSS?**

### Testing & Validation Questions

46. **How do we test that resets apply correctly across all atomic widget types?**
47. **What's the test matrix: themes × widget types × reset properties?**
48. **Should we have visual regression tests for reset application?**
49. **How do we validate that imported resets match source page appearance?**
50. **What's the strategy for testing reset priority conflicts?**

### Security & Validation Questions

51. **How do we sanitize reset CSS to prevent XSS attacks?**
52. **Should we validate CSS properties against a whitelist?**
53. **How do we handle malicious CSS (expression(), behavior(), etc.)?**
54. **Should there be a limit on the number of reset rules?**
55. **How do we prevent reset styles from breaking admin or editor interfaces?**

### Migration & Backward Compatibility

56. **How do existing converted pages get updated with new reset handling?**
57. **Should reset application be opt-in or automatic for existing imports?**
58. **What's the migration path from current converter to reset-aware version?**
59. **How do we handle sites with mixed (old + new) conversion approaches?**
60. **Should there be a "convert to new reset system" utility?**

### Future Extensibility Questions

61. **How can third-party developers extend reset handling?**
62. **Should there be hooks/filters for custom reset processors?**
63. **How do we support custom atomic widgets in reset system?**
64. **What's the API for programmatic reset management?**
65. **Should we support reset style imports from popular CSS frameworks?**

### Documentation & Support Questions

66. **What documentation do users need to understand reset handling?**
67. **How do we explain priority/cascade in user-friendly terms?**
68. **Should there be troubleshooting guides for reset conflicts?**
69. **What support is needed for theme developers integrating with this system?**
70. **How do we document the atomic widgets integration requirements?**

---

## 📊 APPROACH COMPARISON MATRIX

| Criteria | Site Settings | Custom CSS File | Customizer | Atomic Base Styles | Hybrid |
|----------|--------------|----------------|------------|-------------------|--------|
| **Per-Page Control** | ❌ Global only | ✅ Per-page | ❌ Global only | ⚠️ Complex | ✅ Both options |
| **Implementation Complexity** | 🟡 Medium | 🟢 Low | 🟡 Medium | 🔴 High | 🔴 Very High |
| **Performance Impact** | 🟢 Low | 🟡 Medium | 🟢 Low | 🟢 Low | 🟡 Medium |
| **User Editability** | ⚠️ Requires UI | 🟢 File editing | ✅ Built-in UI | ❌ Difficult | ✅ Multiple options |
| **Export/Import** | ✅ With kit | ⚠️ Manual | ⚠️ With theme | ⚠️ Complex | ✅ Flexible |
| **Theme Independence** | ✅ Yes | ✅ Yes | ❌ Theme-specific | ✅ Yes | ✅ Yes |
| **Atomic Widget Native** | ❌ No | ❌ No | ❌ No | ✅ Yes | ⚠️ Partial |
| **Debugging Ease** | 🟡 Medium | 🟢 Easy | 🟡 Medium | 🔴 Difficult | 🔴 Very Difficult |
| **Maintenance Burden** | 🟡 Medium | 🟢 Low | 🟡 Medium | 🔴 High | 🔴 Very High |
| **Rollback Capability** | ✅ With kit versions | ✅ File backup | ⚠️ Manual | ❌ Difficult | ⚠️ Complex |

---

## 🎯 RECOMMENDED APPROACH

### Primary Recommendation: **Approach 2 (Custom CSS File) + Selective Atomic Integration**

**Rationale:**
1. **Simplicity**: Custom CSS files are straightforward to implement, debug, and maintain
2. **Per-page control**: Each converted page can have unique resets matching source
3. **Performance**: Browser caching works naturally; minimal overhead
4. **Debugging**: CSS files are visible and editable for troubleshooting
5. **Extensibility**: Can gradually add atomic widget integration for specific cases

**Implementation Priority:**
1. **Phase 1 (MVP)**: Custom CSS file generation and enqueue (Approach 2)
   - Parse reset styles from source CSS
   - Generate per-page reset.css files
   - Enqueue with correct priority
   - Handle cleanup and cache invalidation

2. **Phase 2 (Enhancement)**: Hello Theme integration
   - Detect and optionally disable Hello Theme defaults
   - Provide user control over theme style deregistration
   - Add UI for reset management

3. **Phase 3 (Advanced)**: Selective atomic base styles
   - Identify critical cases where custom CSS isn't sufficient
   - Add atomic base_styles injection for those specific cases only
   - Maintain hybrid approach for robustness

4. **Phase 4 (Optional)**: Site-wide defaults
   - Add Kit Settings storage for common reset patterns
   - Allow users to set site-wide reset preferences
   - Per-page overrides still take priority

### Alternative Recommendation: **Approach 5 (Hybrid) for Advanced Users**

For users requiring maximum control and flexibility, implement the hybrid approach with:
- Clear documentation of priority system
- UI for selecting which layers are active
- Performance optimization through selective application

---

## ✅ NEXT STEPS

### Immediate Actions
1. **Validate approach** with stakeholders and Elementor team
2. **Research atomic widgets** base_styles hook points and limitations
3. **Prototype** custom CSS file generation for MVP
4. **Test** specificity requirements to override atomic widgets and Hello Theme
5. **Document** discovered constraints and update this PRD

### Research Tasks
1. Study atomic widget base_styles schema and injection points
2. Test Hello Theme style deregistration programmatically
3. Measure performance impact of different application methods
4. Analyze common CSS reset patterns (normalize.css, reset.css, etc.)
5. Review Elementor Kit Settings extensibility options

### Development Tasks
1. Create Reset_Style_Parser class for extracting resets from CSS
2. Implement Reset_CSS_File_Generator for per-page CSS generation
3. Build Reset_CSS_Enqueuer with proper priority handling
4. Add cleanup utilities for orphaned reset files
5. Create unit tests for reset parsing and generation

### Documentation Tasks
1. Write user guide for reset style handling
2. Create troubleshooting guide for common reset conflicts
3. Document API for programmatic reset management
4. Add examples for different reset scenarios
5. Create visual diagrams showing priority cascade

---

---

## 🔬 APPROACH 6: DIRECT WIDGET STYLING FOR SIMPLE ELEMENT SELECTORS

### Description
Apply reset styles directly to widget properties when CSS rules use simple element selectors (h1, h2, p, etc.) with no conflicting selectors, eliminating the need for external CSS files or global classes for these common cases.

### Problem Statement
When importing content with simple reset styles like `h1 { font-size: 30px; }`, the current system:
1. Creates global classes or external CSS files even for simple, non-conflicting styles
2. Doesn't leverage the direct widget styling capabilities for element-level resets
3. Misses optimization opportunities for straightforward element selector rules

### Technical Research Findings

#### Current Architecture Analysis

**1. CSS Processing Pipeline:**
```php
// Current flow: widget-conversion-service.php lines 136-175
1. Parse HTML → Extract elements
2. Extract all CSS (inline + external)
3. Map elements to widgets (widget-mapper.php)
4. Process CSS and categorize rules (css-processor.php)
5. Apply styles based on specificity (css-specificity-calculator.php)
```

**2. Specificity System (css-specificity-calculator.php):**
```php
const IMPORTANT_WEIGHT = 10000;
const INLINE_WEIGHT = 1000;
const ID_WEIGHT = 100;
const CLASS_WEIGHT = 10;
const ELEMENT_WEIGHT = 1;

// Element selectors currently route to 'element_styles' (line 188)
// These are applied with lowest priority in compute_final_styles()
```

**3. Current Element Selector Handling:**
- **Category**: `'element'` (line 168 in css-specificity-calculator.php)
- **Target**: `'element_styles'` (line 188)
- **Application**: Merged into `$all_styles` with lowest priority (line 493 in css-processor.php)
- **Specificity**: `ELEMENT_WEIGHT = 1` per element in selector

**4. Widget Mapping (widget-mapper.php):**
```php
// Lines 18-51: HTML tags → Atomic widgets
'h1' => 'e-heading',
'h2' => 'e-heading',
'h3' => 'e-heading',
'h4' => 'e-heading',
'h5' => 'e-heading',
'h6' => 'e-heading',
'p' => 'e-paragraph',
'a' => 'e-link',
'button' => 'e-button',
```

### Proposed Implementation

#### Phase 1: Conflict Detection System

**New Class: `Reset_Selector_Analyzer`**
```php
class Reset_Selector_Analyzer {
    private $specificity_calculator;
    private $supported_simple_selectors = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'span', 'div' ];
    
    public function analyze_element_selector_conflicts( array $css_rules ): array {
        $element_rules = $this->extract_element_selector_rules( $css_rules );
        $conflict_map = [];
        
        foreach ( $element_rules as $selector => $rules ) {
            $conflict_map[ $selector ] = $this->detect_conflicts_for_selector( 
                $selector, 
                $rules, 
                $css_rules 
            );
        }
        
        return $conflict_map;
    }
    
    private function is_simple_element_selector( string $selector ): bool {
        $selector = trim( $selector );
        
        // Must be ONLY an element name (no classes, IDs, pseudo-classes, combinators)
        if ( ! in_array( $selector, $this->supported_simple_selectors, true ) ) {
            return false;
        }
        
        // Verify no additional selectors or combinators
        if ( preg_match( '/[#.\[\]:>+~\s]/', $selector ) ) {
            return false;
        }
        
        return true;
    }
    
    private function detect_conflicts_for_selector( string $selector, array $rules, array $all_rules ): array {
        $conflicts = [];
        
        foreach ( $all_rules as $rule ) {
            // Skip the rule itself
            if ( $rule['selector'] === $selector ) {
                continue;
            }
            
            // Check if this rule targets the same element
            if ( $this->selector_targets_element( $rule['selector'], $selector ) ) {
                $rule_specificity = $this->specificity_calculator->calculate_specificity( 
                    $rule['selector'], 
                    $rule['important'] ?? false 
                );
                
                $base_specificity = $this->specificity_calculator->calculate_specificity( 
                    $selector, 
                    false 
                );
                
                // If other selector has higher or equal specificity, it's a conflict
                if ( $rule_specificity >= $base_specificity ) {
                    $conflicts[] = [
                        'conflicting_selector' => $rule['selector'],
                        'specificity' => $rule_specificity,
                        'properties' => $this->get_overlapping_properties( $rules, [ $rule ] ),
                    ];
                }
            }
        }
        
        return $conflicts;
    }
    
    private function selector_targets_element( string $complex_selector, string $element ): bool {
        // Check if complex selector (e.g., "h1.title", "div h1", "#content h1") targets the element
        
        // Remove pseudo-elements and pseudo-classes for matching
        $clean_selector = preg_replace( '/::?[a-zA-Z][\w-]*(\([^)]*\))?/', '', $complex_selector );
        
        // Check for element name in selector
        // Must match as whole word (not part of class/ID name)
        return preg_match( '/\b' . preg_quote( $element, '/' ) . '\b/', $clean_selector ) === 1;
    }
    
    private function get_overlapping_properties( array $rules1, array $rules2 ): array {
        $props1 = array_column( $rules1, 'property' );
        $props2 = array_column( $rules2, 'property' );
        
        return array_intersect( $props1, $props2 );
    }
    
    public function get_non_conflicting_rules( string $selector, array $rules, array $conflict_map ): array {
        if ( empty( $conflict_map[ $selector ] ) ) {
            // No conflicts - all rules can be applied directly
            return $rules;
        }
        
        $conflicting_properties = [];
        foreach ( $conflict_map[ $selector ] as $conflict ) {
            $conflicting_properties = array_merge( 
                $conflicting_properties, 
                $conflict['properties'] 
            );
        }
        
        // Return only rules that don't have conflicting properties
        return array_filter( $rules, function( $rule ) use ( $conflicting_properties ) {
            return ! in_array( $rule['property'], $conflicting_properties, true );
        } );
    }
}
```

#### Phase 2: Direct Widget Style Application

**Enhanced: `css-processor.php`**
```php
private function process_element_style_rule( $rule, &$processing_result ) {
    $selector = $rule['selector'];
    
    // NEW: Check if this is a simple element selector eligible for direct widget styling
    if ( $this->reset_analyzer->is_simple_element_selector( $selector ) ) {
        // Analyze conflicts
        $conflicts = $this->reset_analyzer->detect_conflicts_for_selector( 
            $selector, 
            [ $rule ], 
            $processing_result['all_rules'] ?? [] 
        );
        
        if ( empty( $conflicts ) ) {
            // No conflicts - mark for direct widget application
            if ( ! isset( $processing_result['direct_widget_styles'] ) ) {
                $processing_result['direct_widget_styles'] = [];
            }
            
            if ( ! isset( $processing_result['direct_widget_styles'][ $selector ] ) ) {
                $processing_result['direct_widget_styles'][ $selector ] = [];
            }
            
            // Convert CSS property to atomic widget format
            $converted_property = $this->convert_css_property( $rule['property'], $rule['value'] );
            
            if ( $converted_property ) {
                $processing_result['direct_widget_styles'][ $selector ][] = [
                    'property' => $rule['property'],
                    'value' => $rule['value'],
                    'converted_property' => $converted_property,
                    'specificity' => $rule['specificity'],
                    'important' => $rule['important'],
                    'source' => 'direct_element_reset',
                ];
                
                error_log( "CSS Processor: Marked {$selector} {$rule['property']} for direct widget styling (no conflicts)" );
                
                // Skip adding to element_styles - will be applied directly to widgets
                return;
            }
        } else {
            error_log( "CSS Processor: {$selector} has conflicts - using standard element_styles approach" );
        }
    }
    
    // EXISTING: Standard element styles processing (fallback)
    if ( ! isset( $processing_result['element_styles'] ) ) {
        $processing_result['element_styles'] = [];
    }
    
    $converted_property = $this->convert_css_property( $rule['property'], $rule['value'] );
    
    $processing_result['element_styles'][] = [
        'selector' => $rule['selector'],
        'property' => $rule['property'],
        'value' => $rule['value'],
        'specificity' => $rule['specificity'],
        'important' => $rule['important'],
        'original_property' => $rule['property'],
        'converted_property' => $converted_property,
    ];
}
```

**Enhanced: `apply_styles_to_widget()`**
```php
public function apply_styles_to_widget( $widget, $processing_result ) {
    // ... existing code ...
    
    // NEW: Apply direct widget styles for simple element selectors
    $direct_styles = [];
    if ( ! empty( $processing_result['direct_widget_styles'] ) ) {
        $widget_tag = $widget['original_tag'] ?? null;
        
        if ( $widget_tag && isset( $processing_result['direct_widget_styles'][ $widget_tag ] ) ) {
            $direct_styles = $processing_result['direct_widget_styles'][ $widget_tag ];
            
            error_log( "CSS Processor: Applying " . count( $direct_styles ) . " direct styles to {$widget_tag} widget" );
        }
    }
    
    // Merge direct styles into computed styles with appropriate priority
    // Direct element resets have higher priority than standard element_styles
    // but lower than classes, IDs, and inline styles
    $result = [
        'widget_styles' => $widget_styles,
        'global_classes' => $applied_classes,
        'element_styles' => $element_styles,
        'direct_element_styles' => $direct_styles,  // NEW
        'id_styles' => $id_styles,
        'computed_styles' => $this->compute_final_styles( 
            $widget_styles, 
            $element_styles, 
            $widget, 
            $id_styles,
            $direct_styles  // NEW parameter
        ),
    ];
    
    return $result;
}
```

**Enhanced: `compute_final_styles()`**
```php
private function compute_final_styles( $widget_styles, $element_styles, $widget, $id_styles = [], $direct_element_styles = [] ) {
    // Priority order (lowest to highest):
    // 1. Standard element_styles (specificity 1)
    // 2. Direct element resets (specificity 1 but marked as direct)
    // 3. Widget styles (classes, etc.)
    // 4. ID styles
    // 5. Inline styles
    // 6. !important
    
    $all_styles = array_merge( $element_styles, $direct_element_styles, $widget_styles );
    
    // ... rest of existing logic ...
}
```

#### Phase 3: Widget Creator Integration

**Enhanced: `widget-creator.php`**
```php
private function merge_settings_with_styles( $settings, $applied_styles ) {
    // ... existing code ...
    
    // NEW: Merge direct element styles into widget settings
    if ( ! empty( $applied_styles['direct_element_styles'] ) ) {
        foreach ( $applied_styles['direct_element_styles'] as $style ) {
            if ( ! empty( $style['converted_property'] ) ) {
                $converted = $style['converted_property'];
                
                // Apply directly to widget settings (not styles array)
                if ( isset( $converted['property'] ) && isset( $converted['value'] ) ) {
                    $settings[ $converted['property'] ] = $converted['value'];
                    
                    error_log( "Widget Creator: Applied direct element style {$converted['property']} to widget settings" );
                }
            }
        }
    }
    
    return $settings;
}
```

### Implementation Details

#### Supported Simple Selectors
```php
$supported_selectors = [
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    
    // Text elements
    'p', 'span', 'a',
    
    // Containers
    'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
    
    // Interactive
    'button',
    
    // Media
    'img',
];
```

#### Conflict Detection Rules

**No Conflict (Apply Directly):**
```css
/* Simple element selector, no other rules targeting h1 */
h1 { font-size: 30px; }
```

**Conflict Detected (Use Standard Approach):**
```css
/* Multiple selectors targeting h1 */
h1 { font-size: 30px; }
h1.title { font-size: 40px; }  /* Higher specificity - conflict! */
```

```css
/* Descendant selector targeting h1 */
h1 { font-size: 30px; }
.content h1 { font-size: 35px; }  /* Higher specificity - conflict! */
```

```css
/* ID selector targeting h1 */
h1 { font-size: 30px; }
#header h1 { font-size: 45px; }  /* Higher specificity - conflict! */
```

#### Specificity Comparison Logic
```php
// Base element selector: h1 = specificity 1
// Conflicting selectors that prevent direct application:
// - h1.class = specificity 11 (1 element + 10 class)
// - #id h1 = specificity 101 (100 ID + 1 element)
// - div h1 = specificity 2 (1 element + 1 element)
// - h1:hover = specificity 11 (1 element + 10 pseudo-class)

// Only apply directly if NO other selectors target the same element
// with equal or higher specificity
```

### Pros
- ✅ **Optimal performance**: No external CSS files or global classes for simple resets
- ✅ **Direct widget control**: Styles applied as widget properties, fully editable in Elementor
- ✅ **Specificity-aware**: Respects CSS cascade rules automatically
- ✅ **Conflict-safe**: Only applies when no conflicting selectors exist
- ✅ **Atomic widget native**: Uses proper atomic widget prop types
- ✅ **Backward compatible**: Falls back to standard approach when conflicts detected
- ✅ **Per-widget granularity**: Each widget instance gets appropriate styles

### Cons
- ❌ **Implementation complexity**: Requires conflict detection system
- ❌ **Processing overhead**: Must analyze all CSS rules for conflicts
- ❌ **Limited scope**: Only works for simple element selectors
- ❌ **Debugging complexity**: Direct widget styles harder to trace than CSS files
- ❌ **Update challenges**: Changing reset styles requires widget updates

### Questions
1. **Should direct widget styling be opt-in or automatic?**
2. **How do we handle responsive breakpoints in direct widget styles?**
3. **Should we provide a UI to view/edit direct element reset styles?**
4. **How do we handle updates when CSS rules change after import?**
5. **Should we log which styles were applied directly vs via CSS?**
6. **What's the performance impact of conflict detection on large CSS files?**
7. **Should we cache conflict analysis results?**
8. **How do we handle pseudo-classes (:hover, :focus) in direct styles?**
9. **Should direct styles be exportable separately from widget data?**
10. **How do we handle !important in element selector rules?**

### Testing Strategy

#### Test Cases
```php
// Test 1: Simple h1 with no conflicts
$css = 'h1 { font-size: 30px; }';
$expected = 'Apply directly to e-heading widgets';

// Test 2: h1 with class conflict
$css = 'h1 { font-size: 30px; } h1.title { font-size: 40px; }';
$expected = 'Use standard element_styles (conflict detected)';

// Test 3: Multiple simple selectors
$css = 'h1 { font-size: 30px; } h2 { font-size: 24px; } p { font-size: 16px; }';
$expected = 'Apply all directly (no conflicts)';

// Test 4: Complex selector chain
$css = 'h1 { font-size: 30px; } .content h1 { font-size: 35px; }';
$expected = 'Use standard element_styles (specificity conflict)';

// Test 5: Pseudo-class
$css = 'h1 { font-size: 30px; } h1:hover { font-size: 32px; }';
$expected = 'Apply base directly, use CSS for :hover';
```

### Performance Considerations

**Conflict Detection Overhead:**
```php
// For each element selector rule:
// - Check against all other rules: O(n²) worst case
// - Optimize with early termination and caching
// - Estimated overhead: +50-100ms for 1000 CSS rules
```

**Memory Impact:**
```php
// Additional data structures:
// - Conflict map: ~1KB per 100 element selector rules
// - Direct styles cache: ~500B per widget with direct styles
// - Total overhead: ~5-10KB for typical page
```

### Integration with Existing Approaches

**Hybrid Strategy:**
1. **Phase 1**: Detect simple element selectors without conflicts
2. **Phase 2**: Apply directly to widgets as properties
3. **Phase 3**: Remaining element styles → Standard element_styles
4. **Phase 4**: Complex resets → Custom CSS file (Approach 2)
5. **Phase 5**: Site-wide defaults → Kit Settings (Approach 1)

**Priority Cascade:**
```
!important (10000)
  ↓
Inline styles (1000)
  ↓
ID selectors (100+)
  ↓
Class selectors (10+)
  ↓
Direct element resets (1 + direct flag)
  ↓
Standard element styles (1)
  ↓
Atomic widget defaults (0)
```

---

## 🎯 UPDATED RECOMMENDED APPROACH

### Primary Recommendation: **Hybrid Approach 6 + Approach 2**

**Phase 1 (MVP)**: Direct Widget Styling for Simple Selectors
- Implement conflict detection system
- Apply non-conflicting element selector styles directly to widgets
- Fall back to standard element_styles for conflicts

**Phase 2**: Custom CSS File for Complex Cases
- Generate reset.css for:
  - Conflicting element selectors
  - Complex selectors (descendant, child, etc.)
  - Pseudo-classes and pseudo-elements
  - Media queries and responsive resets

**Phase 3**: Site-Wide Defaults (Optional)
- Add Kit Settings for common reset patterns
- Allow users to set site-wide preferences
- Per-page direct styles override site defaults

### Implementation Priority

1. **Immediate**: Implement `Reset_Selector_Analyzer` class
2. **Week 1**: Enhance `css-processor.php` with conflict detection
3. **Week 2**: Update `widget-creator.php` to apply direct styles
4. **Week 3**: Add comprehensive testing and logging
5. **Week 4**: Optimize performance and add caching

---

**Document Version**: 2.0  
**Last Updated**: 2025-10-06  
**Status**: Research Complete - Implementation Ready  
**Next Review**: After Phase 1 implementation and testing

**Research Findings Summary:**
- ✅ Current architecture supports direct widget styling
- ✅ Specificity system already in place and functional
- ✅ Widget mapping from HTML tags to atomic widgets exists
- ✅ Conflict detection is feasible with existing infrastructure
- ✅ Performance impact estimated at <100ms for typical pages
- ✅ All simple element selectors (h1-h6, p, a, button, etc.) can be supported
- ✅ Specificity-based conflict resolution aligns with CSS standards

---

## 🔗 Related Research

**See Also:**
- **[3-ZERO-DEFAULT-ATOMIC-WIDGETS.md](./3-ZERO-DEFAULT-ATOMIC-WIDGETS.md)** - Research on disabling ALL atomic widget default styles when created through CSS converter
  - Complements Approach 6 by removing base_styles that would conflict with direct widget styling
  - Ensures perfect source fidelity by eliminating atomic widget defaults
  - Context-aware: Only affects CSS converter widgets, not manual editor widgets
