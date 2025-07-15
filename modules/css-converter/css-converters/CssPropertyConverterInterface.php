<?php
namespace Elementor\Modules\CssConverter\CssConverters;

interface CssPropertyConverterInterface {
    public function convert(string $value, array $schema): array;
} 