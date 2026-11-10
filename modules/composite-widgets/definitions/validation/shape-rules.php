<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The full shape lives in schema/widget-definition.schema.json, which CI checks against the examples.
 * At runtime only the keys the registry and the editor rely on are checked here.
 */
class Shape_Rules {
	const SOURCES = [ Widget_Definition::SOURCE_CODE, Widget_Definition::SOURCE_SITE ];
	const OPTIONAL_STRING_KEYS = [ 'icon', 'category' ];
	const STYLE_LIST_KEYS = [ 'appearance', 'quick_edit' ];

	public function validate( array $definition, Parse_Errors $errors ): void {
		$id = $definition['id'] ?? null;
		$version = $definition['version'] ?? null;

		if ( ! is_string( $id ) || ! preg_match( Widget_Markers::WIDGET_ID_PATTERN, $id ) ) {
			$errors->add( 'id', Definition_Error_Codes::DEFINITION_INVALID );
		}

		if ( ! is_int( $version ) || $version < Widget_Markers::MIN_VERSION ) {
			$errors->add( 'version', Definition_Error_Codes::DEFINITION_INVALID );
		}

		if ( ! $this->is_non_empty_string( $definition['title'] ?? null ) ) {
			$errors->add( 'title', Definition_Error_Codes::DEFINITION_INVALID );
		}

		if ( ! in_array( $definition['source'] ?? null, self::SOURCES, true ) ) {
			$errors->add( 'source', Definition_Error_Codes::DEFINITION_INVALID );
		}

		foreach ( self::OPTIONAL_STRING_KEYS as $key ) {
			if ( isset( $definition[ $key ] ) && ! $this->is_non_empty_string( $definition[ $key ] ) ) {
				$errors->add( $key, Definition_Error_Codes::DEFINITION_INVALID );
			}
		}

		if ( ! is_array( $definition['template'] ?? null ) || ! $this->is_non_empty_string( $definition['template']['elType'] ?? null ) ) {
			$errors->add( 'template', Definition_Error_Codes::DEFINITION_INVALID );
		}

		if ( ! is_array( $definition['general'] ?? null ) ) {
			$errors->add( 'general', Definition_Error_Codes::DEFINITION_INVALID );
		}

		$this->validate_style( $definition['style'] ?? [], $errors );
	}

	private function validate_style( $style, Parse_Errors $errors ): void {
		if ( ! is_array( $style ) ) {
			$errors->add( 'style', Definition_Error_Codes::DEFINITION_INVALID );
			return;
		}

		foreach ( self::STYLE_LIST_KEYS as $key ) {
			if ( isset( $style[ $key ] ) && ! is_array( $style[ $key ] ) ) {
				$errors->add( "style.{$key}", Definition_Error_Codes::DEFINITION_INVALID );
			}
		}
	}

	private function is_non_empty_string( $value ): bool {
		return is_string( $value ) && '' !== $value;
	}
}
