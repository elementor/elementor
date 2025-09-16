<?php
/**
 * Script to update test file imports after reorganizing services folder
 */

$base_path = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/';

// Define the import mappings
$import_mappings = [
    // Widget services
    'use Elementor\Modules\CssConverter\Services\Widget_Conversion_Service;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Conversion_Service;',
    'use Elementor\Modules\CssConverter\Services\Widget_Creator;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Creator;',
    'use Elementor\Modules\CssConverter\Services\Widget_Mapper;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Mapper;',
    'use Elementor\Modules\CssConverter\Services\Widget_Hierarchy_Processor;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Hierarchy_Processor;',
    'use Elementor\Modules\CssConverter\Services\Widget_Error_Handler;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Error_Handler;',
    'use Elementor\Modules\CssConverter\Services\Widget_Conversion_Reporter;' => 'use Elementor\Modules\CssConverter\Services\Widget\Widget_Conversion_Reporter;',
    
    // CSS services
    'use Elementor\Modules\CssConverter\Services\Css_Processor;' => 'use Elementor\Modules\CssConverter\Services\Css\Css_Processor;',
    'use Elementor\Modules\CssConverter\Services\Css_Specificity_Calculator;' => 'use Elementor\Modules\CssConverter\Services\Css\Css_Specificity_Calculator;',
    'use Elementor\Modules\CssConverter\Services\Html_Parser;' => 'use Elementor\Modules\CssConverter\Services\Css\Html_Parser;',
    'use Elementor\Modules\CssConverter\Services\Request_Validator;' => 'use Elementor\Modules\CssConverter\Services\Css\Request_Validator;',
    
    // Class services
    'use Elementor\Modules\CssConverter\Services\Class_Conversion_Service;' => 'use Elementor\Modules\CssConverter\Services\Class\Class_Conversion_Service;',
    
    // Variable services
    'use Elementor\Modules\CssConverter\Services\Variable_Conversion_Service;' => 'use Elementor\Modules\CssConverter\Services\Variable\Variable_Conversion_Service;',
    'use Elementor\Modules\CssConverter\Services\Variables_Service;' => 'use Elementor\Modules\CssConverter\Services\Variable\Variables_Service;',
];

// Find all PHP files that might need updates
$files_to_update = [];

// Test files
$test_dirs = [
    'tests/phpunit/elementor/modules/css-converter/',
    'modules/css-converter/docs/',
];

foreach ($test_dirs as $dir) {
    $full_dir = $base_path . $dir;
    if (is_dir($full_dir)) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($full_dir));
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $files_to_update[] = $file->getPathname();
            }
        }
    }
}

$updated_count = 0;

foreach ($files_to_update as $file_path) {
    $content = file_get_contents($file_path);
    $original_content = $content;
    
    // Apply all import mappings
    foreach ($import_mappings as $old_import => $new_import) {
        $content = str_replace($old_import, $new_import, $content);
    }
    
    // Only write if content changed
    if ($content !== $original_content) {
        file_put_contents($file_path, $content);
        $relative_path = str_replace($base_path, '', $file_path);
        echo "Updated: $relative_path\n";
        $updated_count++;
    }
}

echo "Updated $updated_count files with new import paths!\n";
?>
