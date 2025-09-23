<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Display Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Multiple atomic widgets use String_Prop_Type for display
 * Prop Type: /atomic-widgets/prop-types/string-prop-type.php
 * Expected: {"$$type": "string", "value": "flex"}
 * 
 * REQUIREMENTS:
 * - Must be valid CSS display value
 * - Used across multiple widget types
 * - String type with specific allowed values
 */
class Display_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['display'];
	private const ATOMIC_WIDGET = 'e-flexbox'; // Primary widget, but used by multiple
	private const PROP_TYPE = 'String_Prop_Type';
	
	private const VALID_VALUES = [
		'block',
		'inline',
		'inline-block',
		'flex',
		'inline-flex',
		'grid',
		'inline-grid',
		'none',
		'table',
		'table-cell',
		'table-row',
		'list-item',
	];

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$normalized_value = $this->normalize_display_value( $value );
		if ( null === $normalized_value ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'string', 
			$normalized_value 
		);

		return $this->validate_against_atomic_schema( $property, $atomic_value ) 
			? $atomic_value 
			: null;
	}

	public function get_supported_atomic_widgets(): array {
		return [
			'e-flexbox',
			'e-container', 
			'e-heading',
			'e-paragraph',
		];
	}

	public function get_required_prop_types(): array {
		return [self::PROP_TYPE];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function normalize_display_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$normalized = trim( strtolower( $value ) );
		
		if ( empty( $normalized ) ) {
			return null;
		}

		return in_array( $normalized, self::VALID_VALUES, true ) ? $normalized : null;
	}
}
