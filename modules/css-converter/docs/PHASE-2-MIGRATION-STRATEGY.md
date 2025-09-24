# Phase 2: Migration Strategy for Enhanced Property Mapper

## 🔄 **SEAMLESS MIGRATION TO NEW ARCHITECTURE**

This document outlines the migration strategy for transitioning from the current Enhanced Property Mapper to the new modular atomic property mapper architecture, ensuring zero downtime and backward compatibility throughout the process.

---

## **MIGRATION OVERVIEW**

### **Current State Analysis**
- **Single Enhanced Property Mapper** handling 35+ properties
- **Registry System** with basic mapper resolution
- **Working Implementation** for basic prop types (string, size, color)
- **Critical Bugs** in spacing properties (using Size instead of Dimensions)
- **Missing Features** for complex prop types (shadows, filters, transforms)

### **Target State**
- **Modular Mapper System** with dedicated classes for each prop type
- **Enhanced Registry** with caching and performance optimization
- **Complete Prop Type Coverage** for all 50 atomic prop types
- **Validation Framework** ensuring atomic structure compliance
- **Testing Suite** with 100% coverage

### **Migration Principles**
1. **Zero Downtime** - System remains functional throughout migration
2. **Backward Compatibility** - Existing functionality preserved
3. **Incremental Rollout** - Gradual migration with rollback capability
4. **Quality Assurance** - Comprehensive testing at each step
5. **Performance Monitoring** - Continuous performance tracking

---

## **MIGRATION PHASES**

### **Phase 1: Foundation Setup (Week 1)**

#### **Day 1-2: Parallel Architecture Setup**
```php
// Create new architecture alongside existing system
// No changes to existing Enhanced_Property_Mapper yet

// New directory structure:
/convertors/css-properties/
├── implementations/
│   └── enhanced_property_mapper.php          # Existing (unchanged)
├── v2/                                       # New architecture
│   ├── base/
│   │   ├── atomic-property-mapper-base.php
│   │   ├── plain-property-mapper-base.php
│   │   ├── object-property-mapper-base.php
│   │   └── array-property-mapper-base.php
│   ├── contracts/
│   │   ├── atomic-property-mapper-interface.php
│   │   └── css-value-parser-interface.php
│   ├── factory/
│   │   └── atomic-property-mapper-factory.php
│   ├── registry/
│   │   └── enhanced-property-mapper-registry-v2.php
│   └── mappers/
│       ├── string-property-mapper.php
│       ├── size-property-mapper.php
│       └── color-property-mapper.php
```

#### **Day 3-4: Feature Flag System**
```php
// Create: /convertors/css-properties/migration/feature-flags.php
class CSS_Converter_Feature_Flags {
    private const FLAGS = [
        'use_v2_string_mapper' => false,
        'use_v2_size_mapper' => false,
        'use_v2_color_mapper' => false,
        'use_v2_dimensions_mapper' => false,
        'use_v2_shadow_mapper' => false,
        'enable_full_v2_system' => false
    ];
    
    public static function is_enabled( string $flag ): bool {
        $flags = apply_filters( 'css_converter_feature_flags', self::FLAGS );
        return $flags[ $flag ] ?? false;
    }
    
    public static function enable_flag( string $flag ): void {
        add_filter( 'css_converter_feature_flags', function( $flags ) use ( $flag ) {
            $flags[ $flag ] = true;
            return $flags;
        });
    }
    
    public static function get_all_flags(): array {
        return apply_filters( 'css_converter_feature_flags', self::FLAGS );
    }
}

// Create: /convertors/css-properties/migration/hybrid-registry.php
class Hybrid_Property_Mapper_Registry {
    private Enhanced_Property_Mapper_Registry $v1_registry;
    private Enhanced_Property_Mapper_Registry_V2 $v2_registry;
    
    public function __construct() {
        $this->v1_registry = Enhanced_Property_Mapper_Registry::get_instance();
        $this->v2_registry = new Enhanced_Property_Mapper_Registry_V2();
    }
    
    public function resolve_mapper( string $property ): ?object {
        // Check if V2 mapper is enabled for this property type
        if ( $this->should_use_v2_mapper( $property ) ) {
            $v2_mapper = $this->v2_registry->resolve_mapper( $property );
            if ( $v2_mapper ) {
                return $v2_mapper;
            }
        }
        
        // Fallback to V1 mapper
        return $this->v1_registry->resolve_mapper( $property );
    }
    
    private function should_use_v2_mapper( string $property ): bool {
        $property_type_flags = [
            'display' => 'use_v2_string_mapper',
            'position' => 'use_v2_string_mapper',
            'text-align' => 'use_v2_string_mapper',
            'font-size' => 'use_v2_size_mapper',
            'width' => 'use_v2_size_mapper',
            'height' => 'use_v2_size_mapper',
            'color' => 'use_v2_color_mapper',
            'background-color' => 'use_v2_color_mapper',
            'margin' => 'use_v2_dimensions_mapper',
            'padding' => 'use_v2_dimensions_mapper',
            'box-shadow' => 'use_v2_shadow_mapper'
        ];
        
        $flag = $property_type_flags[ $property ] ?? null;
        return $flag ? CSS_Converter_Feature_Flags::is_enabled( $flag ) : false;
    }
}
```

#### **Day 5: Testing Infrastructure**
```php
// Create: /tests/phpunit/migration/hybrid-system-test.php
class Hybrid_System_Test extends WP_UnitTestCase {
    private Hybrid_Property_Mapper_Registry $registry;
    
    public function setUp(): void {
        parent::setUp();
        $this->registry = new Hybrid_Property_Mapper_Registry();
    }
    
    public function test_falls_back_to_v1_when_v2_disabled(): void {
        // Ensure all V2 flags are disabled
        $this->assertFalse( CSS_Converter_Feature_Flags::is_enabled( 'use_v2_string_mapper' ) );
        
        $mapper = $this->registry->resolve_mapper( 'display' );
        $this->assertInstanceOf( Enhanced_Property_Mapper::class, $mapper );
    }
    
    public function test_uses_v2_when_enabled(): void {
        CSS_Converter_Feature_Flags::enable_flag( 'use_v2_string_mapper' );
        
        $mapper = $this->registry->resolve_mapper( 'display' );
        $this->assertInstanceOf( String_Property_Mapper::class, $mapper );
    }
    
    public function test_mixed_v1_v2_system(): void {
        CSS_Converter_Feature_Flags::enable_flag( 'use_v2_string_mapper' );
        // Keep size mapper on V1
        
        $string_mapper = $this->registry->resolve_mapper( 'display' );
        $size_mapper = $this->registry->resolve_mapper( 'font-size' );
        
        $this->assertInstanceOf( String_Property_Mapper::class, $string_mapper );
        $this->assertInstanceOf( Enhanced_Property_Mapper::class, $size_mapper );
    }
}
```

### **Phase 2: Critical Bug Fixes (Week 2)**

#### **Day 1-2: Dimensions Mapper Migration (CRITICAL)**
```php
// Migration plan for spacing properties bug fix
// This is the most critical migration as it fixes incorrect atomic structures

// Step 1: Create V2 Dimensions Mapper (already done in implementation plan)
// Step 2: Enable feature flag for dimensions properties

// Create: /convertors/css-properties/migration/dimensions-migration.php
class Dimensions_Migration {
    public static function enable_v2_dimensions(): void {
        CSS_Converter_Feature_Flags::enable_flag( 'use_v2_dimensions_mapper' );
        
        // Log migration event
        error_log( 'CSS Converter: Enabled V2 Dimensions Mapper for spacing properties' );
    }
    
    public static function validate_migration(): bool {
        $registry = new Hybrid_Property_Mapper_Registry();
        
        // Test critical spacing properties
        $test_cases = [
            'margin' => '10px 20px',
            'padding' => '5px 10px 15px 20px',
            'margin-top' => '15px'
        ];
        
        foreach ( $test_cases as $property => $value ) {
            $mapper = $registry->resolve_mapper( $property );
            $result = $mapper->map_to_v4_atomic( $property, $value );
            
            // Verify we get Dimensions_Prop_Type, not Size_Prop_Type
            if ( ! $result || $result['value']['$$type'] !== 'dimensions' ) {
                error_log( "CSS Converter: Dimensions migration validation failed for {$property}" );
                return false;
            }
        }
        
        return true;
    }
    
    public static function rollback_if_needed(): bool {
        if ( ! self::validate_migration() ) {
            // Disable V2 dimensions mapper
            add_filter( 'css_converter_feature_flags', function( $flags ) {
                $flags['use_v2_dimensions_mapper'] = false;
                return $flags;
            });
            
            error_log( 'CSS Converter: Rolled back V2 Dimensions Mapper due to validation failure' );
            return true;
        }
        
        return false;
    }
}

// Migration execution hook
add_action( 'init', function() {
    if ( is_admin() && current_user_can( 'manage_options' ) ) {
        // Enable dimensions migration
        Dimensions_Migration::enable_v2_dimensions();
        
        // Validate and rollback if needed
        Dimensions_Migration::rollback_if_needed();
    }
});
```

#### **Day 3-4: Shadow Mappers Migration**
```php
// Create: /convertors/css-properties/migration/shadow-migration.php
class Shadow_Migration {
    public static function enable_v2_shadow_system(): void {
        CSS_Converter_Feature_Flags::enable_flag( 'use_v2_shadow_mapper' );
        
        error_log( 'CSS Converter: Enabled V2 Shadow System (Box Shadow + Shadow mappers)' );
    }
    
    public static function validate_shadow_migration(): bool {
        $registry = new Hybrid_Property_Mapper_Registry();
        
        $test_cases = [
            'box-shadow' => '0 2px 4px rgba(0,0,0,0.1)',
            'text-shadow' => '1px 1px 2px #000000'
        ];
        
        foreach ( $test_cases as $property => $value ) {
            $mapper = $registry->resolve_mapper( $property );
            
            if ( ! $mapper ) {
                error_log( "CSS Converter: No mapper found for {$property} in shadow migration" );
                return false;
            }
            
            $result = $mapper->map_to_v4_atomic( $property, $value );
            
            if ( ! $result || $result['value']['$$type'] !== 'box-shadow' ) {
                error_log( "CSS Converter: Shadow migration validation failed for {$property}" );
                return false;
            }
        }
        
        return true;
    }
}
```

#### **Day 5: Migration Validation and Monitoring**
```php
// Create: /convertors/css-properties/migration/migration-monitor.php
class Migration_Monitor {
    private static array $performance_data = [];
    private static array $error_counts = [];
    
    public static function track_conversion( string $property, float $execution_time, bool $success ): void {
        if ( ! isset( self::$performance_data[ $property ] ) ) {
            self::$performance_data[ $property ] = [];
            self::$error_counts[ $property ] = 0;
        }
        
        self::$performance_data[ $property ][] = $execution_time;
        
        if ( ! $success ) {
            self::$error_counts[ $property ]++;
        }
    }
    
    public static function get_migration_report(): array {
        $report = [
            'total_properties' => count( self::$performance_data ),
            'average_performance' => [],
            'error_rates' => [],
            'recommendations' => []
        ];
        
        foreach ( self::$performance_data as $property => $times ) {
            $avg_time = array_sum( $times ) / count( $times );
            $error_rate = self::$error_counts[ $property ] / count( $times );
            
            $report['average_performance'][ $property ] = $avg_time;
            $report['error_rates'][ $property ] = $error_rate;
            
            // Generate recommendations
            if ( $avg_time > 10 ) { // 10ms threshold
                $report['recommendations'][] = "Property '{$property}' performance degraded: {$avg_time}ms";
            }
            
            if ( $error_rate > 0.01 ) { // 1% error rate threshold
                $report['recommendations'][] = "Property '{$property}' error rate high: " . ($error_rate * 100) . "%";
            }
        }
        
        return $report;
    }
    
    public static function should_rollback_property( string $property ): bool {
        if ( ! isset( self::$performance_data[ $property ] ) ) {
            return false;
        }
        
        $times = self::$performance_data[ $property ];
        $avg_time = array_sum( $times ) / count( $times );
        $error_rate = self::$error_counts[ $property ] / count( $times );
        
        // Rollback criteria
        return $avg_time > 50 || $error_rate > 0.05; // 50ms or 5% error rate
    }
}
```

### **Phase 3: Gradual Feature Rollout (Week 3-4)**

#### **Week 3: Core Property Types**
```php
// Migration schedule for core properties
$migration_schedule = [
    'week_3_day_1' => [ 'use_v2_string_mapper' ],
    'week_3_day_2' => [ 'use_v2_size_mapper' ],
    'week_3_day_3' => [ 'use_v2_color_mapper' ],
    'week_3_day_4' => [ 'use_v2_border_mapper' ],
    'week_3_day_5' => [ 'validation_and_monitoring' ]
];

// Create: /convertors/css-properties/migration/scheduled-migration.php
class Scheduled_Migration {
    public static function execute_daily_migration(): void {
        $current_date = date( 'Y-m-d' );
        $migration_key = "css_converter_migration_{$current_date}";
        
        if ( get_option( $migration_key ) ) {
            return; // Already executed today
        }
        
        $schedule = self::get_migration_schedule();
        $today_migrations = $schedule[ $current_date ] ?? [];
        
        foreach ( $today_migrations as $flag ) {
            CSS_Converter_Feature_Flags::enable_flag( $flag );
            error_log( "CSS Converter: Enabled flag {$flag} on {$current_date}" );
        }
        
        update_option( $migration_key, true );
    }
    
    private static function get_migration_schedule(): array {
        return apply_filters( 'css_converter_migration_schedule', [
            // Define migration schedule based on deployment dates
        ]);
    }
}

// Hook into daily cron
add_action( 'wp_daily_event', [ 'Scheduled_Migration', 'execute_daily_migration' ] );
```

#### **Week 4: Complex Property Types**
```php
// Enable complex property mappers
$complex_migration_schedule = [
    'week_4_day_1' => [ 'use_v2_filter_mapper' ],
    'week_4_day_2' => [ 'use_v2_transform_mapper' ],
    'week_4_day_3' => [ 'use_v2_background_mapper' ],
    'week_4_day_4' => [ 'use_v2_layout_mapper' ],
    'week_4_day_5' => [ 'enable_full_v2_system' ]
];
```

### **Phase 4: Complete Migration (Week 5)**

#### **Day 1-3: Full V2 System Activation**
```php
// Create: /convertors/css-properties/migration/complete-migration.php
class Complete_Migration {
    public static function activate_full_v2_system(): void {
        // Enable all V2 flags
        $all_flags = [
            'use_v2_string_mapper',
            'use_v2_size_mapper', 
            'use_v2_color_mapper',
            'use_v2_dimensions_mapper',
            'use_v2_shadow_mapper',
            'use_v2_border_mapper',
            'use_v2_filter_mapper',
            'use_v2_transform_mapper',
            'use_v2_background_mapper',
            'use_v2_layout_mapper',
            'enable_full_v2_system'
        ];
        
        foreach ( $all_flags as $flag ) {
            CSS_Converter_Feature_Flags::enable_flag( $flag );
        }
        
        error_log( 'CSS Converter: Activated full V2 system' );
    }
    
    public static function validate_complete_system(): bool {
        $registry = new Hybrid_Property_Mapper_Registry();
        
        // Test all property types
        $comprehensive_tests = [
            'display' => 'flex',
            'font-size' => '16px',
            'color' => '#ff0000',
            'margin' => '10px 20px',
            'box-shadow' => '0 2px 4px rgba(0,0,0,0.1)',
            'border-radius' => '5px 10px',
            'filter' => 'blur(5px)',
            'transform' => 'rotate(45deg)',
            'background' => 'linear-gradient(45deg, #ff0000, #0000ff)'
        ];
        
        $success_count = 0;
        $total_count = count( $comprehensive_tests );
        
        foreach ( $comprehensive_tests as $property => $value ) {
            $mapper = $registry->resolve_mapper( $property );
            if ( $mapper ) {
                $result = $mapper->map_to_v4_atomic( $property, $value );
                if ( $result ) {
                    $success_count++;
                }
            }
        }
        
        $success_rate = $success_count / $total_count;
        
        if ( $success_rate < 0.95 ) { // 95% success rate required
            error_log( "CSS Converter: Complete system validation failed. Success rate: " . ($success_rate * 100) . "%" );
            return false;
        }
        
        return true;
    }
}
```

#### **Day 4-5: V1 System Deprecation**
```php
// Create: /convertors/css-properties/migration/v1-deprecation.php
class V1_System_Deprecation {
    public static function deprecate_v1_system(): void {
        // Mark V1 system as deprecated
        add_action( 'admin_notices', function() {
            if ( ! CSS_Converter_Feature_Flags::is_enabled( 'enable_full_v2_system' ) ) {
                echo '<div class="notice notice-warning"><p>';
                echo 'CSS Converter V1 system is deprecated. Please migrate to V2 system.';
                echo '</p></div>';
            }
        });
        
        // Log deprecation warnings
        if ( ! CSS_Converter_Feature_Flags::is_enabled( 'enable_full_v2_system' ) ) {
            error_log( 'CSS Converter: V1 system is deprecated and will be removed in future version' );
        }
    }
    
    public static function remove_v1_system(): void {
        // This should only be called after extensive validation
        if ( ! self::is_safe_to_remove_v1() ) {
            error_log( 'CSS Converter: V1 system removal aborted - not safe' );
            return;
        }
        
        // Remove V1 Enhanced Property Mapper
        $v1_file = __DIR__ . '/../implementations/enhanced_property_mapper.php';
        if ( file_exists( $v1_file ) ) {
            // Move to backup location instead of deleting
            $backup_file = __DIR__ . '/../backup/enhanced_property_mapper_v1_backup.php';
            rename( $v1_file, $backup_file );
            error_log( 'CSS Converter: V1 system moved to backup location' );
        }
    }
    
    private static function is_safe_to_remove_v1(): bool {
        // Comprehensive safety checks
        $checks = [
            'full_v2_enabled' => CSS_Converter_Feature_Flags::is_enabled( 'enable_full_v2_system' ),
            'no_recent_errors' => self::check_recent_error_logs(),
            'performance_acceptable' => self::check_performance_metrics(),
            'user_approval' => get_option( 'css_converter_approve_v1_removal', false )
        ];
        
        return array_reduce( $checks, function( $carry, $check ) {
            return $carry && $check;
        }, true );
    }
    
    private static function check_recent_error_logs(): bool {
        // Check for CSS converter errors in last 7 days
        // Implementation would check WordPress error logs
        return true; // Simplified for example
    }
    
    private static function check_performance_metrics(): bool {
        $report = Migration_Monitor::get_migration_report();
        
        // Check if any properties have performance issues
        foreach ( $report['average_performance'] as $property => $avg_time ) {
            if ( $avg_time > 20 ) { // 20ms threshold for removal
                return false;
            }
        }
        
        return true;
    }
}
```

---

## **ROLLBACK STRATEGY**

### **Automatic Rollback Triggers**
```php
// Create: /convertors/css-properties/migration/rollback-system.php
class Rollback_System {
    private const ROLLBACK_TRIGGERS = [
        'error_rate_threshold' => 0.05,    // 5% error rate
        'performance_threshold' => 50,      // 50ms average
        'memory_threshold' => 100,          // 100MB memory usage
        'user_complaint_threshold' => 5     // 5 user complaints
    ];
    
    public static function check_rollback_conditions(): void {
        $report = Migration_Monitor::get_migration_report();
        
        foreach ( $report['error_rates'] as $property => $error_rate ) {
            if ( $error_rate > self::ROLLBACK_TRIGGERS['error_rate_threshold'] ) {
                self::execute_property_rollback( $property, 'high_error_rate' );
            }
        }
        
        foreach ( $report['average_performance'] as $property => $avg_time ) {
            if ( $avg_time > self::ROLLBACK_TRIGGERS['performance_threshold'] ) {
                self::execute_property_rollback( $property, 'performance_degradation' );
            }
        }
    }
    
    private static function execute_property_rollback( string $property, string $reason ): void {
        $property_flag_map = [
            'display' => 'use_v2_string_mapper',
            'font-size' => 'use_v2_size_mapper',
            'color' => 'use_v2_color_mapper',
            'margin' => 'use_v2_dimensions_mapper',
            'box-shadow' => 'use_v2_shadow_mapper'
        ];
        
        $flag = $property_flag_map[ $property ] ?? null;
        if ( $flag ) {
            // Disable the V2 flag for this property
            add_filter( 'css_converter_feature_flags', function( $flags ) use ( $flag ) {
                $flags[ $flag ] = false;
                return $flags;
            });
            
            error_log( "CSS Converter: Rolled back {$property} to V1 due to {$reason}" );
            
            // Send alert to administrators
            self::send_rollback_alert( $property, $reason );
        }
    }
    
    private static function send_rollback_alert( string $property, string $reason ): void {
        $admin_email = get_option( 'admin_email' );
        $subject = 'CSS Converter: Automatic Rollback Executed';
        $message = "Property '{$property}' was rolled back to V1 due to: {$reason}";
        
        wp_mail( $admin_email, $subject, $message );
    }
}

// Hook into regular checks
add_action( 'wp_hourly_event', [ 'Rollback_System', 'check_rollback_conditions' ] );
```

### **Manual Rollback Interface**
```php
// Create: /admin/migration-control-panel.php
class Migration_Control_Panel {
    public static function init(): void {
        add_action( 'admin_menu', [ self::class, 'add_admin_menu' ] );
        add_action( 'admin_post_css_converter_rollback', [ self::class, 'handle_rollback' ] );
    }
    
    public static function add_admin_menu(): void {
        add_options_page(
            'CSS Converter Migration',
            'CSS Converter Migration', 
            'manage_options',
            'css-converter-migration',
            [ self::class, 'render_control_panel' ]
        );
    }
    
    public static function render_control_panel(): void {
        $flags = CSS_Converter_Feature_Flags::get_all_flags();
        $report = Migration_Monitor::get_migration_report();
        
        ?>
        <div class="wrap">
            <h1>CSS Converter Migration Control Panel</h1>
            
            <h2>Current Migration Status</h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Feature Flag</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $flags as $flag => $enabled ): ?>
                    <tr>
                        <td><?php echo esc_html( $flag ); ?></td>
                        <td>
                            <span class="dashicons dashicons-<?php echo $enabled ? 'yes-alt' : 'dismiss'; ?>"></span>
                            <?php echo $enabled ? 'Enabled' : 'Disabled'; ?>
                        </td>
                        <td>
                            <?php if ( $enabled ): ?>
                                <form method="post" action="<?php echo admin_url( 'admin-post.php' ); ?>">
                                    <input type="hidden" name="action" value="css_converter_rollback">
                                    <input type="hidden" name="flag" value="<?php echo esc_attr( $flag ); ?>">
                                    <?php wp_nonce_field( 'css_converter_rollback' ); ?>
                                    <button type="submit" class="button button-secondary">Rollback</button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <h2>Performance Report</h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Avg Performance (ms)</th>
                        <th>Error Rate (%)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $report['average_performance'] as $property => $avg_time ): ?>
                    <tr>
                        <td><?php echo esc_html( $property ); ?></td>
                        <td><?php echo number_format( $avg_time, 2 ); ?>ms</td>
                        <td><?php echo number_format( $report['error_rates'][ $property ] * 100, 2 ); ?>%</td>
                        <td>
                            <?php if ( $avg_time > 20 || $report['error_rates'][ $property ] > 0.02 ): ?>
                                <span class="dashicons dashicons-warning" style="color: orange;"></span> Warning
                            <?php else: ?>
                                <span class="dashicons dashicons-yes-alt" style="color: green;"></span> Good
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    public static function handle_rollback(): void {
        if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'css_converter_rollback' ) ) {
            wp_die( 'Security check failed' );
        }
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( 'Insufficient permissions' );
        }
        
        $flag = sanitize_text_field( $_POST['flag'] );
        
        // Disable the flag
        add_filter( 'css_converter_feature_flags', function( $flags ) use ( $flag ) {
            $flags[ $flag ] = false;
            return $flags;
        });
        
        error_log( "CSS Converter: Manual rollback of flag {$flag} by user " . get_current_user_id() );
        
        wp_redirect( admin_url( 'options-general.php?page=css-converter-migration&rolled_back=' . $flag ) );
        exit;
    }
}

Migration_Control_Panel::init();
```

---

## **MONITORING AND VALIDATION**

### **Continuous Monitoring System**
```php
// Create: /convertors/css-properties/migration/monitoring-dashboard.php
class Monitoring_Dashboard {
    public static function generate_daily_report(): array {
        $report = [
            'date' => date( 'Y-m-d' ),
            'migration_status' => self::get_migration_status(),
            'performance_metrics' => Migration_Monitor::get_migration_report(),
            'error_summary' => self::get_error_summary(),
            'recommendations' => self::get_recommendations()
        ];
        
        // Store report for historical tracking
        $reports = get_option( 'css_converter_migration_reports', [] );
        $reports[ $report['date'] ] = $report;
        
        // Keep only last 30 days
        $reports = array_slice( $reports, -30, 30, true );
        update_option( 'css_converter_migration_reports', $reports );
        
        return $report;
    }
    
    private static function get_migration_status(): array {
        $flags = CSS_Converter_Feature_Flags::get_all_flags();
        $enabled_count = count( array_filter( $flags ) );
        $total_count = count( $flags );
        
        return [
            'enabled_flags' => $enabled_count,
            'total_flags' => $total_count,
            'completion_percentage' => ( $enabled_count / $total_count ) * 100,
            'flags' => $flags
        ];
    }
    
    private static function get_error_summary(): array {
        // Analyze error logs for CSS converter related errors
        $error_log_file = ini_get( 'error_log' );
        $errors = [];
        
        if ( file_exists( $error_log_file ) ) {
            $log_content = file_get_contents( $error_log_file );
            $css_converter_errors = preg_grep( '/CSS Converter/', explode( "\n", $log_content ) );
            
            $errors = [
                'total_errors' => count( $css_converter_errors ),
                'recent_errors' => array_slice( $css_converter_errors, -10 ),
                'error_types' => self::categorize_errors( $css_converter_errors )
            ];
        }
        
        return $errors;
    }
    
    private static function categorize_errors( array $errors ): array {
        $categories = [
            'validation_errors' => 0,
            'performance_errors' => 0,
            'rollback_events' => 0,
            'other_errors' => 0
        ];
        
        foreach ( $errors as $error ) {
            if ( strpos( $error, 'validation' ) !== false ) {
                $categories['validation_errors']++;
            } elseif ( strpos( $error, 'performance' ) !== false ) {
                $categories['performance_errors']++;
            } elseif ( strpos( $error, 'rollback' ) !== false || strpos( $error, 'Rolled back' ) !== false ) {
                $categories['rollback_events']++;
            } else {
                $categories['other_errors']++;
            }
        }
        
        return $categories;
    }
    
    private static function get_recommendations(): array {
        $recommendations = [];
        $performance_report = Migration_Monitor::get_migration_report();
        
        // Performance recommendations
        foreach ( $performance_report['average_performance'] as $property => $avg_time ) {
            if ( $avg_time > 10 ) {
                $recommendations[] = [
                    'type' => 'performance',
                    'priority' => $avg_time > 20 ? 'high' : 'medium',
                    'message' => "Property '{$property}' performance needs optimization: {$avg_time}ms"
                ];
            }
        }
        
        // Error rate recommendations
        foreach ( $performance_report['error_rates'] as $property => $error_rate ) {
            if ( $error_rate > 0.01 ) {
                $recommendations[] = [
                    'type' => 'reliability',
                    'priority' => $error_rate > 0.05 ? 'high' : 'medium',
                    'message' => "Property '{$property}' has high error rate: " . ($error_rate * 100) . "%"
                ];
            }
        }
        
        return $recommendations;
    }
}

// Schedule daily report generation
add_action( 'wp_daily_event', [ 'Monitoring_Dashboard', 'generate_daily_report' ] );
```

---

## **SUCCESS METRICS**

### **Migration Success Criteria**
- **Zero Downtime**: System remains functional throughout migration
- **Performance Maintained**: <10% performance degradation during migration
- **Error Rate**: <1% error rate for migrated properties
- **Rollback Capability**: Ability to rollback any property within 1 hour
- **Complete Coverage**: All 50 prop types supported by end of migration

### **Quality Gates**
- **Each Phase**: 95% test pass rate before proceeding
- **Performance**: No property exceeds 20ms conversion time
- **Memory**: No memory leaks or excessive usage
- **User Impact**: No user-reported issues during migration

### **Monitoring Metrics**
- **Conversion Success Rate**: >99% for all properties
- **Performance Trends**: Track performance over time
- **Error Patterns**: Identify and resolve error patterns
- **User Satisfaction**: Monitor support tickets and feedback

---

## **CONCLUSION**

This migration strategy ensures:

1. **Seamless Transition** - Zero downtime with gradual rollout
2. **Risk Mitigation** - Comprehensive rollback capabilities
3. **Quality Assurance** - Continuous monitoring and validation
4. **Performance Tracking** - Real-time performance monitoring
5. **User Experience** - Minimal impact on end users

The strategy provides a **safe and systematic approach** to migrating from the current Enhanced Property Mapper to the new modular architecture, ensuring **reliability and performance** throughout the process.

**Next Steps**: Begin Phase 1 implementation with foundation setup and feature flag system.
