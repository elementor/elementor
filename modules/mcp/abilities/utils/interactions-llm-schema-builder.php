<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Props\Animation_Config_Prop_Type;
use Elementor\Modules\Interactions\Props\Animation_Preset_Prop_Type;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Interactions\Props\Timing_Config_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Llm_Schema_Builder {

	public static function build( ?bool $is_pro_active = null ): array {
		$is_pro_active = $is_pro_active ?? defined( 'ELEMENTOR_PRO_VERSION' );

		$item_shape = Interaction_Item_Prop_Type::make()->get_shape();
		$animation_shape = Animation_Preset_Prop_Type::make()->get_shape();
		$timing_shape = Timing_Config_Prop_Type::make()->get_shape();
		$config_shape = Animation_Config_Prop_Type::make()->get_shape();

		$schema = [
			'on' => self::string_field( $item_shape['trigger'], true ),
			'effect' => self::string_field( $animation_shape['effect'], true ),
			'type' => self::string_field( $animation_shape['type'], true ),
			'direction' => self::string_field( $animation_shape['direction'], false, '' ),
			'for' => self::timing_field( $timing_shape['duration'], Presets::DEFAULT_DURATION ),
			'after' => self::timing_field( $timing_shape['delay'], Presets::DEFAULT_DELAY ),
			'ease' => self::string_field( $config_shape['easing'], false, Presets::DEFAULT_EASING ),
			'except' => [
				'type' => 'array',
				'items' => [ 'type' => 'string' ],
				'description' => 'Breakpoint IDs on which this interaction is disabled.',
			],
		];

		if ( $is_pro_active ) {
			$schema['repeat'] = self::repeat_field( $config_shape['repeat'] );
			$schema['replay'] = self::boolean_field( $config_shape['replay'] );
			$schema['relativeTo'] = self::string_field( $config_shape['relativeTo'], false );
			$schema['start'] = self::percent_field( $config_shape['start'], Presets::DEFAULT_START );
			$schema['end'] = self::percent_field( $config_shape['end'], Presets::DEFAULT_END );
			$schema['keyframes'] = [
				'type' => 'object',
				'description' => 'Transformable keyframes object ($$type "keyframes"). Required when effect is "custom".',
			];
		}

		return self::filter_pro_fields( $schema, $is_pro_active );
	}

	private static function filter_pro_fields( array $schema, bool $is_pro_active ): array {
		if ( $is_pro_active ) {
			return $schema;
		}

		$pro_shape = [
			'trigger' => Interaction_Item_Prop_Type::make()->get_shape()['trigger'],
			'effect' => Animation_Preset_Prop_Type::make()->get_shape()['effect'],
			'easing' => Animation_Config_Prop_Type::make()->get_shape()['easing'],
		];

		$schema['on']['enum'] = self::allowed_enum( $pro_shape['trigger'] );
		$schema['effect']['enum'] = self::allowed_enum( $pro_shape['effect'] );
		$schema['ease']['enum'] = self::allowed_enum( $pro_shape['easing'] );

		return $schema;
	}

	private static function string_field( Prop_Type $prop, bool $required, ?string $default = null ): array {
		$field = [
			'type' => 'string',
			'required' => $required,
		];

		$enum = self::allowed_enum( $prop );
		if ( null !== $enum ) {
			$field['enum'] = $enum;
		}

		if ( null !== $default ) {
			$field['default'] = $default;
		}

		$description = $prop->get_meta_item( 'description' );
		if ( is_string( $description ) ) {
			$field['description'] = $description;
		}

		return $field;
	}

	private static function timing_field( Prop_Type $prop, int $default ): array {
		return [
			'type' => 'number',
			'default' => $default,
			'unit' => 'ms',
			'description' => $prop->get_meta_item( 'description' ),
		];
	}

	private static function percent_field( Prop_Type $prop, int $default ): array {
		return [
			'type' => 'number',
			'default' => $default,
			'unit' => '%',
			'minimum' => 0,
			'maximum' => 100,
			'description' => $prop->get_meta_item( 'description' ),
		];
	}

	private static function boolean_field( Prop_Type $prop ): array {
		return [
			'type' => 'boolean',
			'description' => $prop->get_meta_item( 'description' ),
		];
	}

	private static function repeat_field( Prop_Type $prop ): array {
		return [
			'description' => $prop->get_meta_item( 'description' ),
			'oneOf' => [
				[ 'type' => 'string', 'enum' => Presets::REPEAT_OPTIONS ],
				[ 'type' => 'number', 'minimum' => 1, 'description' => 'Shorthand for repeat "times".' ],
			],
		];
	}

	private static function allowed_enum( Prop_Type $prop ): ?array {
		$enum = null;

		if ( $prop instanceof String_Prop_Type && $prop->get_enum() ) {
			$enum = $prop->get_enum();
		}

		$meta_enum = $prop->get_meta_item( 'enum' );
		if ( is_array( $meta_enum ) ) {
			$enum = $meta_enum;
		}

		if ( ! is_array( $enum ) ) {
			return null;
		}

		$pro_values = $prop->get_meta_item( 'pro' );
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) && is_array( $pro_values ) ) {
			$enum = array_values( array_diff( $enum, $pro_values ) );
		}

		return $enum;
	}
}
