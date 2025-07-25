<?php

namespace Elementor\Modules\CssConverter\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use function Elementor\Modules\CssConverter\elementor_css_converter_map_css_to_props;

class ParagraphWidgetHandler {
    public function handle($element) {
        $tag = isset($element['tag']) ? $element['tag'] : null;
        $css = isset($element['css']) ? $element['css'] : '';
        $children = isset($element['children']) ? $element['children'] : [];
        $schema = Atomic_Paragraph::get_props_schema();
        $props = elementor_css_converter_map_css_to_props($tag, $css, $schema);
        return [
            'tag' => $tag,
            'widget' => 'e-paragraph',
            'props' => $props,
            'children' => $children,
        ];
    }
} 