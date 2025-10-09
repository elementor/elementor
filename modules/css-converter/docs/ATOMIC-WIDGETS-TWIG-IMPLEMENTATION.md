# Twig Implementation in Atomic Widgets Module

## Overview

The Elementor Atomic Widgets module uses **PHP Twig** for server-side template rendering on the frontend. This is separate from the JavaScript Twing implementation used in the editor.

## Architecture

### Core Components

1. **Template Renderer** (`template-renderer/`)
2. **Template Loader** (`template-renderer/single-file-loader.php`)
3. **Template Trait** (`elements/has-template.php`)
4. **Widget Base Classes** (`elements/atomic-widget-base.php`, `elements/atomic-element-base.php`)

## Template Renderer System

### Template_Renderer Class

**Location**: `template-renderer/template-renderer.php`

```php
class Template_Renderer {
    private static ?self $instance = null;
    private Single_File_Loader $loader;
    private Environment $env;
}
```

**Key Features**:
- **Singleton Pattern**: Single instance across the application
- **Custom Loader**: Uses `Single_File_Loader` for template management
- **Security**: Custom escapers for HTML tags and URLs
- **Debug Support**: Respects `Utils::is_elementor_debug()`

**Initialization**:
```php
private function __construct() {
    $this->loader = new Single_File_Loader();
    
    $this->env = new Environment(
        $this->loader,
        [
            'debug' => Utils::is_elementor_debug(),
            'autoescape' => 'name',
        ]
    );
    
    // Custom escapers
    $escaper = $this->env->getRuntime( EscaperRuntime::class );
    $escaper->setEscaper( 'full_url', 'esc_url' );
    $escaper->setEscaper( 'html_tag', [ Utils::class, 'validate_html_tag' ] );
}
```

### Single_File_Loader Class

**Location**: `template-renderer/single-file-loader.php`

**Purpose**: Custom Twig loader that maps template names to file paths.

**Key Methods**:
- `register( string $name, string $path )` - Register template name → file path mapping
- `is_registered( string $name )` - Check if template is registered
- `getSourceContext( string $name )` - Load template content from file
- `isFresh( string $name, int $time )` - Check if template needs recompilation

**Security Features**:
- Path validation with null byte protection
- File existence and readability checks
- Validity caching to prevent repeated filesystem calls

```php
private function is_valid_file( $path ): bool {
    // Null byte protection
    if ( str_contains( $path, "\0" ) ) {
        throw new LoaderError( 'A template name cannot contain NULL bytes.' );
    }
    
    return is_file( $path ) && is_readable( $path );
}
```

## Template Integration in Widgets

### Has_Template Trait

**Location**: `elements/has-template.php`

**Purpose**: Provides template functionality to atomic widgets.

**Key Methods**:

#### 1. `get_initial_config()`
Sends template data to JavaScript editor:

```php
public function get_initial_config() {
    $config = parent::get_initial_config();
    
    $config['twig_main_template'] = $this->get_main_template();
    $config['twig_templates'] = $this->get_templates_contents();
    
    return $config;
}
```

**Critical**: This is where template content is sent to the JavaScript editor for Twing rendering.

#### 2. `render()`
Server-side rendering process:

```php
protected function render() {
    $renderer = Template_Renderer::instance();
    
    // Register templates (with caching check)
    foreach ( $this->get_templates() as $name => $path ) {
        if ( $renderer->is_registered( $name ) ) {
            continue; // Skip if already registered
        }
        $renderer->register( $name, $path );
    }
    
    // Build context
    $base_styles_dict = $this->get_base_styles_dictionary();
    $context = [
        'id' => $this->get_id(),
        'type' => $this->get_name(),
        'settings' => $this->get_atomic_settings(),
        'base_styles' => $base_styles_dict, // ← Fresh on every render
    ];
    
    // Render and output
    $rendered_html = $renderer->render( $this->get_main_template(), $context );
    echo $rendered_html;
}
```

#### 3. `get_templates_contents()`
Loads template file contents for JavaScript editor:

```php
protected function get_templates_contents() {
    return array_map(
        fn ( $path ) => Utils::file_get_contents( $path ),
        $this->get_templates()
    );
}
```

### Widget Implementation Example

**Atomic Paragraph Widget** (`elements/atomic-paragraph/atomic-paragraph.php`):

```php
class Atomic_Paragraph extends Atomic_Widget_Base {
    use Has_Template;
    
    // Define template mapping
    protected function get_templates(): array {
        return [
            'elementor/elements/atomic-paragraph' => __DIR__ . '/atomic-paragraph.html.twig',
        ];
    }
    
    // Define base styles for template
    protected function define_base_styles(): array {
        return [
            'base' => Style_Definition::make()
                ->add_variant(
                    Style_Variant::make()
                        ->add_prop( 'margin', $margin_value )
                ),
            'link-base' => Style_Definition::make()
                ->add_variant(
                    Style_Variant::make()
                        ->add_prop( 'all', 'unset' )
                        ->add_prop( 'cursor', 'pointer' )
                ),
        ];
    }
}
```

## Template Context Structure

### Standard Context Variables

Every template receives this context:

```php
$context = [
    'id' => $this->get_id(),           // Widget instance ID
    'type' => $this->get_name(),       // Widget type (e.g., 'e-paragraph')
    'settings' => $this->get_atomic_settings(), // Widget settings/props
    'base_styles' => $base_styles_dict, // Base CSS class names
];
```

### Base Styles Dictionary

The `base_styles` context contains CSS class names:

```php
// Example for e-paragraph widget:
$base_styles = [
    'base' => 'e-paragraph-base',
    'link-base' => 'e-paragraph-link-base',
];
```

**Key Point**: This dictionary is generated fresh on every render via `get_base_styles_dictionary()`.

## Template File Structure

### Template Location Pattern
```
elements/{widget-name}/{widget-name}.html.twig
```

### Template Example (`atomic-paragraph.html.twig`)

```twig
{% if settings.paragraph is not empty %}
    {% set id_attribute = settings._cssid is not empty ? 'id=' ~ settings._cssid | e('html_attr') : '' %}
    {% set base_class = base_styles.base ?? '' %}
    <p class="{{ settings.classes | merge( base_class ? [ base_class ] : [] ) | join(' ') }}" {{ id_attribute }} {{ settings.attributes | raw }}>
        {% if settings.link.href %}
            {% set link_base_class = base_styles['link-base'] ?? '' %}
            <a href="{{ settings.link.href }}" target="{{ settings.link.target }}" class="{{ link_base_class }}">
                {{ settings.paragraph }}
            </a>
        {% else %}
            {{ settings.paragraph }}
        {% endif %}
    </p>
{% endif %}
```

**Template Features**:
- **Conditional Base Classes**: `base_styles.base ?? ''` prevents errors if base styles are empty
- **Class Merging**: Combines user classes with base classes
- **Security**: Uses Twig's built-in escaping (`e('html_attr')`)
- **Nested Elements**: Supports complex structures (paragraph with optional link)

## Template Registration and Caching

### Registration Process

1. **Widget Definition**: Widget defines template mapping in `get_templates()`
2. **Runtime Registration**: Templates registered during `render()` call
3. **Caching Check**: `is_registered()` prevents duplicate registration
4. **File Loading**: `Single_File_Loader` loads template content on demand

### Template Caching

**Twig Environment Caching**:
- Templates are compiled and cached by Twig
- Cache invalidation based on file modification time
- Debug mode affects caching behavior

**Registration Caching**:
- Templates registered once per request
- `is_registered()` check prevents re-registration
- Loader maintains internal template registry

## Integration with Base Styles System

### Base Styles Flow

1. **Definition**: Widget defines base styles in `define_base_styles()`
2. **Dictionary Generation**: `get_base_styles_dictionary()` creates class name mapping
3. **Context Injection**: Dictionary passed to template as `base_styles`
4. **Template Usage**: Template conditionally applies base classes

### CSS Converter Integration

**Problem**: CSS converter widgets should not have base classes.

**Current Solution**: `get_base_styles_dictionary()` returns empty array for CSS converter widgets:

```php
public function get_base_styles_dictionary() {
    // If CSS converter widget, return EMPTY array (no base classes)
    if ( $this->is_css_converter_widget() ) {
        return [];
    }
    
    // Normal widgets - return standard base classes
    $result = [];
    $base_styles = array_keys( $this->define_base_styles() );
    
    foreach ( $base_styles as $key ) {
        $base_class_id = $this->generate_base_style_id( $key );
        $result[ $key ] = $base_class_id;
    }
    
    return $result;
}
```

## Configuration Flow to JavaScript Editor

### Initial Config Generation

When widget is loaded in editor, `get_initial_config()` sends:

```php
$config['twig_main_template'] = $this->get_main_template();
$config['twig_templates'] = $this->get_templates_contents(); // File contents as strings
$config['base_styles_dictionary'] = $this->get_base_styles_dictionary();
```

**Critical Issue**: The `base_styles_dictionary` is sent ONCE during initialization, not on every render. This creates a disconnect between PHP and JavaScript rendering.

## Comparison: PHP vs JavaScript Rendering

| Aspect | PHP (Frontend) | JavaScript (Editor) |
|--------|----------------|-------------------|
| **Engine** | PHP Twig | Twing (JS) |
| **Templates** | Loaded from files | Sent as strings in config |
| **Context** | Fresh on every render | Settings change, base_styles static |
| **Base Styles** | `get_base_styles_dictionary()` called fresh | Cached from initial config |
| **Caching** | Twig template compilation | Template strings stored in memory |

## Security Considerations

### Template Security

1. **Path Validation**: Null byte protection in loader
2. **File Access**: Readable file checks
3. **Escaping**: Custom escapers for HTML and URLs
4. **Content Security**: Templates loaded from controlled paths only

### Custom Escapers

```php
$escaper->setEscaper( 'full_url', 'esc_url' );
$escaper->setEscaper( 'html_tag', [ Utils::class, 'validate_html_tag' ] );
```

**Usage in Templates**:
```twig
<{{ tag | e('html_tag') }}>  <!-- Validates HTML tag names -->
<a href="{{ url | e('full_url') }}">  <!-- Validates URLs -->
```

## Performance Considerations

### Template Loading

- **Lazy Loading**: Templates loaded only when needed
- **Registration Caching**: Prevents duplicate file operations
- **Twig Compilation**: Templates compiled and cached by Twig

### Memory Usage

- **Singleton Renderer**: Single instance across request
- **Template Registry**: In-memory mapping of names to paths
- **Validity Cache**: Prevents repeated file system checks

## Debugging and Development

### Debug Mode

When `Utils::is_elementor_debug()` is true:
- Twig debug mode enabled
- Exceptions propagated instead of caught
- More verbose error reporting

### Template Development

1. **File Watching**: Twig automatically detects template changes
2. **Error Reporting**: Clear error messages for template issues
3. **Context Inspection**: Debug context variables in templates

## Conclusion

The Atomic Widgets Twig implementation provides:

1. **Secure Template Rendering**: Custom loader with security validations
2. **Flexible Template System**: Easy widget-to-template mapping
3. **Performance Optimization**: Caching at multiple levels
4. **Editor Integration**: Template content sent to JavaScript editor
5. **Base Styles Integration**: Dynamic base class application

**Key Insight**: The PHP Twig system is the authoritative renderer for frontend output, while the JavaScript Twing system mirrors this for editor preview. Understanding both systems is crucial for implementing features like CSS converter base class removal.
