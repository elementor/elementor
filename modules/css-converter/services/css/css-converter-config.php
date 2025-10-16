<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Converter_Config {
	const HTML_ELEMENTS = [
		'div',
		'span',
		'p',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'a',
		'img',
		'ul',
		'ol',
		'li',
		'nav',
		'header',
		'footer',
		'section',
		'article',
		'aside',
		'main',
		'button',
		'input',
		'form',
		'table',
		'tr',
		'td',
		'th',
		'tbody',
		'thead',
		'strong',
		'em',
		'b',
		'i',
		'small',
		'code',
		'pre',
	];

	const CSS_PROPERTY_MAPPINGS = [
		'background-color' => 'background',
		'border-top-left-radius' => 'border-radius',
		'border-top-right-radius' => 'border-radius',
		'border-bottom-left-radius' => 'border-radius',
		'border-bottom-right-radius' => 'border-radius',
		'border-left-width' => 'border-width',
		'border-right-width' => 'border-width',
		'border-top-width' => 'border-width',
		'border-bottom-width' => 'border-width',
		'margin-top' => 'margin',
		'margin-right' => 'margin',
		'margin-bottom' => 'margin',
		'margin-left' => 'margin',
		'padding-top' => 'padding',
		'padding-right' => 'padding',
		'padding-bottom' => 'padding',
		'padding-left' => 'padding',
	];

	const SUPPORTED_PSEUDO_CLASSES = [
		'hover',
		'focus',
		'active',
		'visited',
		'first-child',
		'last-child',
		'nth-child',
		'not',
		'before',
		'after',
	];

	const REGEX_PATTERNS = [
		'class_selector' => '/^\.([a-zA-Z0-9_-]+)$/',
		'class_name_extraction' => '/^\.([a-zA-Z0-9_-]+)/',
		'all_class_names' => '/\.([a-zA-Z0-9_-]+)/',
		'element_tag' => '/^([a-z][a-z0-9]*)$/i',
		'element_from_selector' => '/^([a-zA-Z][a-zA-Z0-9]*)\b/',
		'class_from_element_selector' => '/\.([a-zA-Z0-9_-]+)$/',
		'nested_descendant' => '/\s(?![^()]*\)|[^\[]*\]|[^"]*")/',
		'nested_child' => '/>(?![^()]*\)|[^\[]*\]|[^"]*")/',
	];

	const ATOMIC_WIDGET_TYPES = [
		'e-paragraph' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph',
		'e-heading' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading',
		'e-button' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button',
		'e-div-block' => 'Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block',
	];

	const WIDGET_TYPE_MAPPINGS = [
		'e-heading' => 'e-heading',
		'e-paragraph' => 'e-paragraph',
		'e-div-block' => 'e-div-block',
		'e-flexbox' => 'e-flexbox',
		'e-link' => 'e-button',
		'e-button' => 'e-button',
		'e-image' => 'e-image',
	];

	const DIMENSIONS_DIRECTIONS = [
		'block-start' => 'top',
		'inline-end' => 'right',
		'block-end' => 'bottom',
		'inline-start' => 'left',
	];

	const BORDER_RADIUS_CORNERS = [
		'start-start',
		'start-end',
		'end-start',
		'end-end',
	];

	public static function get_html_elements(): array {
		return self::HTML_ELEMENTS;
	}

	public static function get_css_property_mappings(): array {
		return self::CSS_PROPERTY_MAPPINGS;
	}

	public static function get_supported_pseudo_classes(): array {
		return self::SUPPORTED_PSEUDO_CLASSES;
	}

	public static function get_regex_pattern( string $pattern_name ): ?string {
		return self::REGEX_PATTERNS[ $pattern_name ] ?? null;
	}

	public static function get_atomic_widget_class( string $widget_type ): ?string {
		return self::ATOMIC_WIDGET_TYPES[ $widget_type ] ?? null;
	}

	public static function get_widget_type_mapping( string $widget_type ): string {
		return self::WIDGET_TYPE_MAPPINGS[ $widget_type ] ?? 'html';
	}

	public static function get_dimensions_directions(): array {
		return self::DIMENSIONS_DIRECTIONS;
	}

	public static function get_border_radius_corners(): array {
		return self::BORDER_RADIUS_CORNERS;
	}

	public static function is_supported_html_element( string $element ): bool {
		return in_array( strtolower( $element ), self::HTML_ELEMENTS, true );
	}

	public static function get_mapped_property_name( string $property ): string {
		return self::CSS_PROPERTY_MAPPINGS[ $property ] ?? $property;
	}

	public static function is_supported_pseudo_class( string $pseudo_class ): bool {
		return in_array( $pseudo_class, self::SUPPORTED_PSEUDO_CLASSES, true );
	}
}
