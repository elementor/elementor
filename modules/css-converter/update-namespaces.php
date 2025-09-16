<?php
/**
 * Script to update namespaces after reorganizing services folder
 */

// Define the file mappings
$namespace_updates = [
    // Widget services
    'services/widget/widget-creator.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Widget;',
        'imports' => [
            'use Elementor\Modules\CssConverter\Services\Widget_Hierarchy_Processor;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Hierarchy_Processor;',
            'use Elementor\Modules\CssConverter\Services\Widget_Error_Handler;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Error_Handler;',
        ]
    ],
    'services/widget/widget-mapper.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Widget;',
    ],
    'services/widget/widget-hierarchy-processor.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Widget;',
    ],
    'services/widget/widget-error-handler.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Widget;',
    ],
    'services/widget/widget-conversion-reporter.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Widget;',
    ],
    
    // CSS services
    'services/css/css-processor.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Css;',
        'imports' => [
            'use Elementor\Modules\CssConverter\Services\Css_Specificity_Calculator;' => 'use Elementor\Modules\CssConverter\Services\Css\Css_Specificity_Calculator;',
            'use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;' => 'use Elementor\Modules\CssConverter\Services\Class\Class_Conversion_Service;',
        ]
    ],
    'services/css/css-specificity-calculator.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Css;',
    ],
    'services/css/html-parser.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Css;',
    ],
    'services/css/request-validator.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Css;',
    ],
    
    // Class services
    'services/class/class-conversion-service.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Class;',
    ],
    
    // Variable services
    'services/variable/variable-conversion-service.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Variable;',
    ],
    'services/variable/variables-service.php' => [
        'old_namespace' => 'namespace Elementor\Modules\CssConverter\Services;',
        'new_namespace' => 'namespace Elementor\Modules\CssConverter\Services\Variable;',
    ],
];

$base_path = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/modules/css-converter/';

foreach ($namespace_updates as $file_path => $updates) {
    $full_path = $base_path . $file_path;
    
    if (!file_exists($full_path)) {
        echo "File not found: $full_path\n";
        continue;
    }
    
    $content = file_get_contents($full_path);
    
    // Update namespace
    $content = str_replace($updates['old_namespace'], $updates['new_namespace'], $content);
    
    // Update imports if specified
    if (isset($updates['imports'])) {
        foreach ($updates['imports'] as $old_import => $new_import) {
            $content = str_replace($old_import, $new_import, $content);
        }
    }
    
    file_put_contents($full_path, $content);
    echo "Updated: $file_path\n";
}

echo "Namespace updates completed!\n";
?>
