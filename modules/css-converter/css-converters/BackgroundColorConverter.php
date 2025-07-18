<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class BackgroundColorConverter implements CssPropertyConverterInterface {
    public function convert(string $value, array $schema): array {
        if (!isset($schema['background'])) {
            return [];
        }
        return [
            'background' => [
                'color' => $value,
            ],
        ];
    }
} 