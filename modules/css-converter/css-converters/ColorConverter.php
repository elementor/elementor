<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class ColorConverter implements CssPropertyConverterInterface {
    public function convert(string $value, array $schema): array {
        if (!isset($schema['color'])) {
            return [];
        }
        return [
            'color' => $value,
        ];
    }
} 