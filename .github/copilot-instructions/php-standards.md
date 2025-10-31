# PHP & WordPress Standards

## Class Naming Conventions

### One Class Per File
- **Enforce one class per file**: Each PHP file should contain exactly one class, interface, or trait
- **No multiple class definitions**: Avoid defining multiple classes in a single file
- **Use statements and autoloading**: Always use `use` statements for importing classes instead of `require_once`
- **Rely on autoloading**: Trust the plugin's autoloader to handle class loading automatically
- **No manual includes**: Remove `require_once`, `include_once`, `require`, and `include` statements for loading classes
- **Exception**: Only use manual includes for non-class files like templates or configuration files

### File and Class Names
- Use underscore-separated file names matching the class name
  - Example: `contact-buttons-section.php` for `Contact_Buttons_Section`
- Class names should use `Pascal_Case_With_Underscores` to follow WordPress coding standards
- Use clear, descriptive names that communicate purpose without redundant prefixes or suffixes

### Interface and Abstract Class Naming
- **Interfaces**: Do not add `_Interface` or `I` prefixes
- **Abstract classes**: Avoid `Abstract_` prefixes
- Instead, use meaningful names like `Base_Header_Section` or `Header_Section_Base` if needed
- Only use a distinguishing prefix/suffix when it significantly improves clarity

### Namespace Conventions
- Use hierarchical namespaces that reflect the directory structure
- Example: `Elementor\Modules\TemplateParts\Widgets\Controls\Header`
- Keep namespace depth reasonable (max 6 levels recommended)

---

## Method Naming and Organization

### Method Naming
- Use `snake_case` for method names to follow WordPress standards
- Public methods should have descriptive names that clearly indicate their purpose
- Private/protected methods should be more specific and implementation-focused
- Template methods (abstract methods) should describe what they return or do

### Method Ordering
Order methods consistently for readability:
1. Abstract methods (if any)
2. Private static methods
3. Private methods
4. Protected static methods
5. Protected methods
6. Public static methods
7. Public methods
8. `__construct` (always last)

Within each visibility group, place static methods before non-static methods.

---

## Constants and Configuration

### Naming
- Use `SCREAMING_SNAKE_CASE` for class constants
- Prefix constants with their context

✅ **Good**:
```php
const DEFAULT_CONFIG = [];
const MAX_UPLOAD_SIZE = 5242880;
const CACHE_EXPIRATION_HOURS = 24;
```

❌ **Bad**:
```php
const CONFIG = [];
const UPLOAD_SIZE = 5242880;
const CACHE = 24;
```

### Organization
- Group related constants into associative arrays when appropriate
- Keep constants at the top of the class

---

## Inheritance and Composition

### Inheritance Patterns
- **Prefer composition over inheritance** when possible
- Use interfaces to define contracts
- Abstract classes should provide common functionality, not just structure
- Concrete classes should focus on specific implementation details

### Constructor Patterns
- Accept dependencies through constructor when possible
- Provide sensible defaults for optional parameters
- Use dependency injection rather than creating dependencies inside the class
- Support both constructor injection and method parameter injection for backward compatibility

Example:
```php
class Widget_Renderer {
    private $template_engine;
    private $cache_service;
    
    public function __construct( Template_Engine $template_engine, Cache_Service $cache_service ) {
        $this->template_engine = $template_engine;
        $this->cache_service = $cache_service;
    }
}
```

---

## WordPress PHP Standards

### Code Style
- Follow WordPress PHP Coding Standards
- Use Yoda conditions: `if ( 'value' === $variable )`
- Use strict typing: `declare(strict_types=1);` when possible
- Use PHP 7.4+ features: typed properties, arrow functions when appropriate

### File Structure
- Follow WordPress theme and plugin directory structures
- Use lowercase with hyphens for directories (e.g., `wp-content/themes/my-theme`)

### Error Handling
- Use WordPress debug logging features
- Create custom error handlers when necessary
- Prefer defensive programming over try-catch blocks
- Implement proper error handling with `WP_Error`

---

## Database Operations

### wpdb Usage
- Use WordPress's database abstraction layer (`$wpdb`)
- Always use `prepare()` statements for secure database queries
- Implement proper database schema changes using `dbDelta()` function

Example:
```php
global $wpdb;

$user_id = 123;
$results = $wpdb->get_results( 
    $wpdb->prepare( 
        "SELECT * FROM {$wpdb->prefix}custom_table WHERE user_id = %d", 
        $user_id 
    ) 
);
```

---

## WordPress APIs and Best Practices

### Hooks and Filters
- Use WordPress hooks (actions and filters) instead of modifying core files
- Favor hooks for extending functionality
- Implement proper hook priorities

### Asset Management
- Use `wp_enqueue_script()` and `wp_enqueue_style()` for proper asset management
- Never hardcode script/style tags in templates

### Caching
- Utilize WordPress's transients API for caching
- Set appropriate expiration times

### Background Processing
- Implement background processing for long-running tasks using `wp_cron()`
- Never block user requests with heavy operations

### Internationalization
- Implement proper internationalization and localization using WordPress i18n functions
- Use text domains consistently

### Custom Post Types and Taxonomies
- Implement custom post types and taxonomies when appropriate
- Use proper registration functions

### Options API
- Use WordPress's built-in options API for storing configuration data
- Avoid direct database access for options

---

## Type Hints and PHPDoc

### Type Hints
- Prefer precise types (e.g., `Widget_Base`) over `mixed`
- Use union types when appropriate (PHP 8.0+)
- Use return type declarations

Example:
```php
public function get_widget( int $widget_id ): ?Widget_Base {
    return $this->widgets[ $widget_id ] ?? null;
}
```

---

## Auto-Linting

Always run automatic lint fixer after finishing changes:
```bash
composer run lint:fix
```

Verify no lint errors remain:
```bash
composer run lint
```

