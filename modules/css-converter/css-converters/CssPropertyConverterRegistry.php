<?php
namespace Elementor\Modules\CssConverter\CssConverters;

class CssPropertyConverterRegistry {
    private array $converters = [];

    public function __construct() {
        $this->converters = [
            'background-color' => new BackgroundColorConverter(),
            'color' => new ColorConverter(),
        ];
    }

    public function getConverter(string $property): ?CssPropertyConverterInterface {
        return $this->converters[$property] ?? null;
    }
} 