# Atomic Widgets & Global Classes CSS Generation Research

**Date**: 2025-10-12  
**Purpose**: Understand how atomic widgets and global classes generate CSS, focusing on kit storage and cache management.

---

## 🎯 Executive Summary

**CRITICAL FINDING**: Global classes MUST be stored in the Kit's post meta using `_elementor_global_classes` or `_elementor_global_classes_preview` keys to be picked up by the atomic widgets CSS generation system.

Our current approach of storing global classes in widget data (`css_converter_global_classes`) will NOT work because:
1. The atomic styles system doesn't know to look there
2. Global classes are retrieved from the Kit, not from individual widgets
3. CSS is generated from Kit meta data, not widget data

---

## 📊 System Architecture

### **1. Global Classes Storage (Kit Meta Data)**

```php
// Location: plugins/elementor/modules/global-classes/global-classes-repository.php

class Global_Classes_Repository {
    // Meta keys stored in the Kit post
    const META_KEY_FRONTEND = '_elementor_global_classes';
    const META_KEY_PREVIEW = '_elementor_global_classes_preview';
    
    const CONTEXT_FRONTEND = 'frontend';
    const CONTEXT_PREVIEW = 'preview';
    
    // Retrieve all global classes from Kit
    public function all() {
        $meta_key = $this->get_meta_key();
        $all = $this->get_kit()->get_json_meta( $meta_key );
        
        // Fallback to frontend if preview is empty
        if ( $is_preview && $is_empty ) {
            $all = $this->get_kit()->get_json_meta( static::META_KEY_FRONTEND );
        }
        
        return Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );
    }
    
    // Store global classes in Kit
    public function put( array $items, array $order ) {
        $updated_value = [
            'items' => $items,
            'order' => $order,
        ];
        
        $meta_key = $this->get_meta_key();
        $value = $this->get_kit()->update_json_meta( $meta_key, $updated_value );
        
        // Trigger cache invalidation
        do_action( 'elementor/global_classes/update', $this->context, $updated_value, $current_value );
    }
    
    private function get_kit() {
        return Plugin::$instance->kits_manager->get_active_kit();
    }
}
```

**Global Classes Data Structure in Kit**:
```json
{
  "items": {
    "inline-element-1": {
      "id": "inline-element-1",
      "label": "inline-element-1",
      "type": "class",
      "variants": [
        {
          "meta": {
            "breakpoint": "desktop",
            "state": null
          },
          "props": {
            "color": {
              "$$type": "color",
              "value": "#ff0000"
            }
          },
          "custom_css": null
        }
      ]
    }
  },
  "order": ["inline-element-1"]
}
```

---

### **2. Atomic Styles Manager (CSS Generation)**

```php
// Location: plugins/elementor/modules/atomic-widgets/styles/atomic-styles-manager.php

class Atomic_Styles_Manager {
    private array $post_ids = [];
    
    public function register_hooks() {
        // Collect post IDs during rendering
        add_action( 'elementor/post/render', function( $post_id ) {
            $this->post_ids[] = $post_id;
        } );
        
        // Generate CSS after post styles are enqueued
        add_action( 'elementor/frontend/after_enqueue_post_styles', fn() => $this->enqueue_styles() );
    }
    
    private function enqueue_styles() {
        if ( empty( $this->post_ids ) ) {
            return; // No posts to process
        }
        
        // Trigger style registration (CRITICAL HOOK)
        do_action( 'elementor/atomic-widgets/styles/register', $this, $this->post_ids );
        
        // Generate CSS files
        $this->before_render( $styles_by_key );
        $this->render( $styles_by_key );
        $this->after_render( $styles_by_key );
    }
    
    public function register( string $key, callable $get_style_defs, array $cache_keys ) {
        $this->registered_styles_by_key[ $key ] = [
            'get_styles' => $get_style_defs,
            'cache_keys' => $cache_keys,
        ];
    }
}
```

**Hook Priority Order**:
1. **Priority 10**: Base styles (`Atomic_Widget_Base_Styles`)
2. **Priority 20**: Global classes (`Atomic_Global_Styles`)
3. **Priority 25**: CSS Converter global classes (`CSS_Converter_Global_Styles`) ← **OUR HOOK**
4. **Priority 30**: Local/widget styles (`Atomic_Widget_Styles`)

---

### **3. Global Classes CSS Registration**

```php
// Location: plugins/elementor/modules/global-classes/atomic-global-styles.php

class Atomic_Global_Styles {
    const STYLES_KEY = 'global';
    
    public function register_hooks() {
        add_action(
            'elementor/atomic-widgets/styles/register',
            fn( Atomic_Styles_Manager $styles_manager, array $post_ids ) => $this->register_styles( $styles_manager ),
            20, // Priority 20: After base (10), before local (30)
            2
        );
        
        // Cache invalidation hooks
        add_action( 'elementor/global_classes/update', fn( string $context ) => $this->invalidate_cache( $context ), 10, 1 );
        add_action( 'elementor/core/files/clear_cache', fn() => $this->invalidate_cache() );
    }
    
    private function register_styles( Atomic_Styles_Manager $styles_manager ) {
        $context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;
        
        $get_styles = function () use ( $context ) {
            // CRITICAL: Retrieves global classes from Kit meta
            return Global_Classes_Repository::make()
                ->context( $context )
                ->all()
                ->get_items()
                ->map( function( $item ) {
                    $item['id'] = $item['label'];
                    return $item;
                })
                ->all();
        };
        
        $styles_manager->register(
            self::STYLES_KEY . '-' . $context,
            $get_styles,
            [ self::STYLES_KEY, $context ] // Cache keys
        );
    }
}
```

---

### **4. CSS File Generation & Caching**

```php
// Location: plugins/elementor/modules/atomic-widgets/styles/css-files-manager.php

class CSS_Files_Manager {
    const DEFAULT_CSS_DIR = 'elementor/css/';
    
    public function get( string $handle, string $media, callable $get_css, bool $is_valid_cache ): ?Style_File {
        $filesystem = $this->get_filesystem();
        $path = $this->get_path( $handle );
        
        // Return cached file if cache is valid
        if ( $is_valid_cache ) {
            if ( ! $filesystem->exists( $path ) ) {
                return null;
            }
            
            return Style_File::create(
                $this->sanitize_handle( $handle ),
                $this->get_filesystem_path( $this->get_path( $handle ) ),
                $this->get_url( $handle ),
                $media,
            );
        }
        
        // Generate new CSS if cache is invalid
        $css = $get_css();
        
        if ( empty( $css ) ) {
            return null;
        }
        
        // Write CSS file to filesystem
        $filesystem_path = $this->get_filesystem_path( $path );
        $is_created = $filesystem->put_contents( $filesystem_path, $css, self::PERMISSIONS );
        
        if ( false === $is_created ) {
            return null;
        }
        
        return Style_File::create(
            $this->sanitize_handle( $handle ),
            $filesystem_path,
            $this->get_url( $handle ),
            $media
        );
    }
}
```

**CSS Files Location**: `/wp-content/uploads/elementor/css/`

**File Naming Convention**:
- Base styles: `base-desktop.css`
- Global classes: `global-{context}-desktop.css`
- Local styles: `local-{post_id}-desktop.css`

---

### **5. Cache Validity System**

```php
// Location: plugins/elementor/modules/atomic-widgets/cache-validity/cache-validity.php

class Cache_Validity {
    public function is_valid( array $cache_keys ): bool {
        // Check if cache is still valid for given keys
        foreach ( $cache_keys as $cache_key ) {
            $item = Cache_Validity_Item::make( $cache_key );
            
            if ( ! $item->is_valid() ) {
                return false;
            }
        }
        
        return true;
    }
    
    public function invalidate( array $cache_keys ) {
        // Invalidate cache for given keys
        foreach ( $cache_keys as $cache_key ) {
            Cache_Validity_Item::make( $cache_key )->invalidate();
        }
    }
    
    public function validate( array $cache_keys ) {
        // Mark cache as valid for given keys
        foreach ( $cache_keys as $cache_key ) {
            Cache_Validity_Item::make( $cache_key )->validate();
        }
    }
}
```

**Cache Invalidation Triggers**:
- `elementor/core/files/clear_cache` - Manual cache clear
- `elementor/document/after_save` - After document save
- `elementor/global_classes/update` - After global classes update
- `deleted_post` - Post deletion

---

## 🔍 Widget Data vs Kit Meta: Key Differences

### **Widget Data (Element Settings)**
```json
{
  "id": "1a072844-5d55-4865-9742-7d175f3897d9",
  "elType": "widget",
  "widgetType": "e-paragraph",
  "settings": {
    "paragraph": "Red text",
    "classes": {
      "$$type": "classes",
      "value": ["inline-element-1"]
    }
  }
}
```

**Purpose**: 
- Tells the widget which classes to use
- Stored in `_elementor_data` post meta
- Applied to HTML elements during rendering

### **Kit Meta (Global Classes)**
```json
{
  "items": {
    "inline-element-1": {
      "id": "inline-element-1",
      "label": "inline-element-1",
      "type": "class",
      "variants": [...]
    }
  },
  "order": ["inline-element-1"]
}
```

**Purpose**:
- Defines what the classes actually look like (CSS rules)
- Stored in `_elementor_global_classes` Kit meta
- Used to generate CSS files

---

## ❌ Why Our Current Approach Doesn't Work

### **Problem 1: Storing Classes in Widget Data**

Our `Widget_Conversion_Service` stores global classes in widget data:

```php
// This is WRONG - atomic system doesn't look here
$widget['css_converter_global_classes'] = $global_classes;
```

The atomic system NEVER reads this data. It only reads from Kit meta via `Global_Classes_Repository`.

### **Problem 2: CSS_Converter_Global_Styles Service**

Our service tries to queue classes in memory:

```php
class CSS_Converter_Global_Styles {
    private static array $pending_global_classes = [];
    
    public static function add_global_classes( array $global_classes ): void {
        foreach ( $global_classes as $class_name => $class_data ) {
            self::$pending_global_classes[ $class_name ] = $class_data;
        }
    }
}
```

**Issues**:
1. ❌ Classes are queued in memory, not stored in Kit
2. ❌ `elementor/post/render` hook may not trigger in editor preview
3. ❌ CSS files are cached - they won't regenerate on page load
4. ❌ Cache invalidation doesn't trigger because we're not using `elementor/global_classes/update`

### **Problem 3: Hook Timing**

The `elementor/post/render` hook is triggered BEFORE `elementor/atomic-widgets/styles/register`:

```php
// Step 1: Post rendering starts
do_action( 'elementor/post/render', $post_id );
// Our hook: extract_global_classes_from_post() runs here

// Step 2: Post rendering completes

// Step 3: CSS enqueuing
do_action( 'elementor/frontend/after_enqueue_post_styles' );
  // Step 3a: Styles manager calls enqueue_styles()
  do_action( 'elementor/atomic-widgets/styles/register', $styles_manager, $post_ids );
    // Our hook: register_styles() runs here
```

But in the **editor preview**, `elementor/post/render` may not trigger at all!

---

## ✅ Solution: Store Classes in Kit Meta

### **Correct Approach**

```php
class Widget_Conversion_Service {
    public function convert_from_html( string $html, string $css, array $options ): array {
        // ... CSS processing ...
        
        // Generate global classes from CSS class rules
        $global_classes = $this->generate_global_classes_from_css_rules( $css_class_rules );
        
        // CRITICAL FIX: Store global classes in Kit meta (not widget data)
        if ( ! empty( $global_classes ) ) {
            $this->store_global_classes_in_kit( $global_classes, $options['createGlobalClasses'] ?? true );
        }
        
        // ... widget creation ...
    }
    
    private function store_global_classes_in_kit( array $global_classes, bool $is_preview ): void {
        $repository = Global_Classes_Repository::make();
        
        // Get context based on whether this is a preview
        $context = $is_preview ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;
        $repository->context( $context );
        
        // Get existing global classes
        $existing = $repository->all();
        $existing_items = $existing->get_items()->all();
        $existing_order = $existing->get_order()->all();
        
        // Merge CSS Converter classes with existing classes
        $updated_items = array_merge( $existing_items, $global_classes );
        $updated_order = array_merge( $existing_order, array_keys( $global_classes ) );
        
        // Store in Kit meta
        $repository->put( $updated_items, $updated_order );
        
        // Cache is automatically invalidated by 'elementor/global_classes/update' action
    }
}
```

---

## 📋 Implementation Checklist

### **Step 1: Update Widget_Conversion_Service**
- [ ] Remove `store_global_classes_in_widgets()` method
- [ ] Add `store_global_classes_in_kit()` method
- [ ] Call `store_global_classes_in_kit()` instead of storing in widget data
- [ ] Handle frontend vs preview context correctly

### **Step 2: Remove Unused CSS_Converter_Global_Styles Service**
- [ ] Delete `extract_global_classes_from_post()` method
- [ ] Delete `traverse_elements_for_global_classes()` method
- [ ] Keep only `register_styles()` for querying CSS Converter classes
- [ ] Or delete entirely and rely on Elementor's `Atomic_Global_Styles`

### **Step 3: Update Atomic_Widget_Data_Formatter**
- [ ] Continue extracting CSS classes from widget attributes
- [ ] Continue formatting classes in atomic format `{$$type: 'classes', value: [...]}`
- [ ] Do NOT store global class definitions in widget data

### **Step 4: Test Cache Invalidation**
- [ ] Verify cache invalidates when global classes are added
- [ ] Verify CSS files regenerate on next page load
- [ ] Verify editor preview shows updated styles

### **Step 5: Test Complete Pipeline**
- [ ] API call creates widgets with CSS classes
- [ ] Global classes stored in Kit meta
- [ ] CSS files generated in `/wp-content/uploads/elementor/css/`
- [ ] HTML elements have correct classes
- [ ] CSS rules applied correctly
- [ ] Playwright tests pass

---

## 🎯 Expected Behavior After Fix

### **1. API Call**
```
POST /wp-json/elementor/v2/widget-converter
{
  "type": "html",
  "content": "<div><p style=\"color: red;\">Red text</p></div>"
}
```

### **2. CSS Converter Processing**
```
✅ Parse HTML → <p> with inline style
✅ Generate CSS class → .inline-element-1
✅ Create atomic props → {"color": {"$$type": "color", "value": "#ff0000"}}
✅ Store in Kit meta → _elementor_global_classes
✅ Create widget → {"settings": {"classes": {"$$type": "classes", "value": ["inline-element-1"]}}}
✅ Save to post → Widget data saved
```

### **3. Page Rendering**
```
✅ elementor/post/render → Collect post IDs
✅ elementor/frontend/after_enqueue_post_styles → Start CSS generation
✅ elementor/atomic-widgets/styles/register → Register all style providers
  ✅ Priority 10: Base styles
  ✅ Priority 20: Global classes → Reads from Kit meta
  ✅ Priority 30: Local styles
✅ CSS generation → Creates /wp-content/uploads/elementor/css/global-preview-desktop.css
✅ CSS enqueue → <link rel="stylesheet" href="...global-preview-desktop.css">
✅ HTML rendering → <p class="inline-element-1">Red text</p>
✅ Browser applies CSS → color: red
```

---

## 📚 References

**Key Files**:
- `plugins/elementor/modules/global-classes/global-classes-repository.php`
- `plugins/elementor/modules/global-classes/atomic-global-styles.php`
- `plugins/elementor/modules/atomic-widgets/styles/atomic-styles-manager.php`
- `plugins/elementor/modules/atomic-widgets/styles/css-files-manager.php`
- `plugins/elementor/modules/atomic-widgets/cache-validity/cache-validity.php`
- `plugins/elementor/core/base/document.php` (get_json_meta, update_json_meta)
- `plugins/elementor/core/kits/documents/kit.php`

**Key Actions**:
- `elementor/post/render` - Triggered when post is rendered
- `elementor/frontend/after_enqueue_post_styles` - Triggered after post styles enqueued
- `elementor/atomic-widgets/styles/register` - Triggered to register style providers
- `elementor/global_classes/update` - Triggered after global classes updated
- `elementor/core/files/clear_cache` - Triggered to clear CSS cache

---

## 🚨 Critical Takeaways

1. **Global classes MUST be stored in Kit meta** (`_elementor_global_classes` or `_elementor_global_classes_preview`)
2. **Widget data only stores class names**, not class definitions
3. **CSS is generated from Kit meta**, not widget data
4. **Cache invalidation is automatic** via `elementor/global_classes/update` action
5. **Editor preview uses `_elementor_global_classes_preview`**, frontend uses `_elementor_global_classes`

---

**Next Steps**: Implement `store_global_classes_in_kit()` method and update the conversion pipeline to use Kit meta storage instead of widget data storage.

