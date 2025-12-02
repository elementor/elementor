<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Base\Element_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Utils;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Element_Base
 */
trait Has_Atomic_Base {
	use Has_Base_Styles;

	public function has_widget_inner_wrapper(): bool {
		return false;
	}

	abstract public static function get_element_type(): string;

	final public function get_name() {
		return static::get_element_type();
	}

	private function get_valid_controls( array $schema, array $controls ): array {
		$valid_controls = [];

		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$cloned_section = clone $control;

				$cloned_section->set_items(
					$this->get_valid_controls( $schema, $control->get_items() )
				);

				$valid_controls[] = $cloned_section;
				continue;
			}

			if ( ( $control instanceof Atomic_Control_Base ) ) {
				$prop_name = $control->get_bind();

				if ( ! $prop_name ) {
					Utils::safe_throw( 'Control is missing a bound prop from the schema.' );
					continue;
				}

				if ( ! array_key_exists( $prop_name, $schema ) ) {
					Utils::safe_throw( "Prop `{$prop_name}` is not defined in the schema of `{$this->get_name()}`." );
					continue;
				}
			}

			$valid_controls[] = $control;
		}

		return $valid_controls;
	}

	private static function validate_schema( array $schema ) {
		$widget_name = static::class;

		foreach ( $schema as $key => $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				Utils::safe_throw( "Prop `$key` must be an instance of `Prop_Type` in `{$widget_name}`." );
			}
		}
	}

	private function parse_atomic_styles( array $styles ): array {
		$style_parser = Style_Parser::make( Style_Schema::get() );

		foreach ( $styles as $style_id => $style ) {
			$result = $style_parser->parse( $style );

			if ( ! $result->is_valid() ) {
				throw new \Exception( esc_html( "Styles validation failed for style `$style_id`. " . $result->errors()->to_string() ) );
			}

			$styles[ $style_id ] = $result->unwrap();
		}

		return $styles;
	}

	private function parse_atomic_settings( array $settings ): array {
		$schema = static::get_props_schema();
		$props_parser = Props_Parser::make( $schema );

		$result = $props_parser->parse( $settings );

		if ( ! $result->is_valid() ) {
			throw new \Exception( esc_html( 'Settings validation failed. ' . $result->errors()->to_string() ) );
		}

		return $result->unwrap();
	}

	private function parse_atomic_interactions( $interactions ) {

		if ( empty( $interactions ) ) {
			return [];
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		if ( is_array( $interactions ) ) {
			return $interactions;
		}

		return [];
	}

	private function convert_prop_type_interactions_to_legacy( $interactions ) {
		$legacy_items = [];

		foreach ( $interactions['items'] as $item ) {
			if ( isset( $item['$$type'] ) && 'interaction-item' === $item['$$type'] ) {
				$legacy_item = $this->extract_legacy_interaction_from_prop_type( $item );
				if ( $legacy_item ) {
					$legacy_items[] = $legacy_item;
				}
			} else {
				$legacy_items[] = $item;
			}
		}

		return [
			'version' => $interactions['version'] ?? 1,
			'items' => $legacy_items,
		];
	}

	private function extract_legacy_interaction_from_prop_type( $item ) {
		if ( ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
			return null;
		}

		$item_value = $item['value'];

		$interaction_id = $this->extract_prop_value( $item_value, 'interaction_id' );
		$trigger = $this->extract_prop_value( $item_value, 'trigger' );
		$animation = $this->extract_prop_value( $item_value, 'animation' );

		if ( ! is_array( $animation ) ) {
			return null;
		}

		$effect = $this->extract_prop_value( $animation, 'effect' );
		$type = $this->extract_prop_value( $animation, 'type' );
		$direction = $this->extract_prop_value( $animation, 'direction' );
		$timing_config = $this->extract_prop_value( $animation, 'timing_config' );

		$duration = 300;
		$delay = 0;

		if ( is_array( $timing_config ) ) {
			$duration = $this->extract_prop_value( $timing_config, 'duration', 300 );
			$delay = $this->extract_prop_value( $timing_config, 'delay', 0 );
		}

		$animation_id = implode( '-', [ $trigger, $effect, $type, $direction, $duration, $delay ] );

		return [
			'interaction_id' => $interaction_id,
			'animation' => [
				'animation_id' => $animation_id,
				'animation_type' => 'full-preset',
			],
		];
	}

	private function extract_prop_value( $data, $key, $default = '' ) {
		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return $default;
		}

		$value = $data[ $key ];

		if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
			return $value['value'];
		}

		return null !== $value ? $value : $default;
	}

	public function get_atomic_controls() {
		$controls = apply_filters(
			'elementor/atomic-widgets/controls',
			$this->define_atomic_controls(),
			$this
		);

		$schema = static::get_props_schema();

		// Validate the schema only in the Editor.
		static::validate_schema( $schema );

		return $this->get_valid_controls( $schema, $controls );
	}

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => true,
		];
	}

	final public function get_controls( $control_id = null ) {
		if ( ! empty( $control_id ) ) {
			return null;
		}

		return [];
	}

	final public function get_data_for_save() {
		$data = parent::get_data_for_save();

		$data['version'] = $this->version;
		$data['settings'] = $this->parse_atomic_settings( $data['settings'] );
		$data['styles'] = $this->parse_atomic_styles( $data['styles'] );
		$data['editor_settings'] = $this->parse_editor_settings( $data['editor_settings'] );

		if ( isset( $data['interactions'] ) && ! empty( $data['interactions'] ) ) {
			$data['interactions'] = $this->transform_interactions_for_save( $data['interactions'] );
		} else {
			$data['interactions'] = [];
		}
		return $data;
	}

	private function transform_interactions_for_save( $interactions ) {
		$decoded = $this->decode_interactions_data( $interactions );

		if ( empty( $decoded['items'] ) ) {
			return [];
		}

		$transformed_items = [];

		foreach ( $decoded['items'] as $item ) {
			if ( isset( $item['$$type'] ) && 'interaction-item' === $item['$$type'] ) {
				$transformed_items[] = $item;
				continue;
			}

			$transformed_item = $this->convert_legacy_to_prop_type( $item );
			if ( $transformed_item ) {
				$transformed_items[] = $transformed_item;
			}
		}

		return [
			'version' => 1,
			'items' => $transformed_items,
		];
	}

	private function decode_interactions_data( $interactions ) {
		if ( is_array( $interactions ) ) {
			return $interactions;
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return [
			'items' => [],
			'version' => 1,
		];
	}

	private function convert_legacy_to_prop_type( $item ) {
		if ( ! isset( $item['animation']['animation_id'] ) || ! isset( $item['interaction_id'] ) ) {
			return null;
		}

		$animation_id = $item['animation']['animation_id'];
		$parsed = $this->parse_animation_id_string( $animation_id );

		if ( ! $parsed ) {
			return null;
		}

		return $this->create_prop_value( 'interaction-item', [
			'interaction_id' => $this->create_prop_value( 'string', $item['interaction_id'] ),
			'trigger' => $this->create_prop_value( 'string', $parsed['trigger'] ),
			'animation' => $this->create_prop_value( 'animation-preset-props', [
				'effect' => $this->create_prop_value( 'string', $parsed['effect'] ),
				'type' => $this->create_prop_value( 'string', $parsed['type'] ),
				'direction' => $this->create_prop_value( 'string', $parsed['direction'] ),
				'timing_config' => $this->create_prop_value( 'timing-config', [
					'duration' => $this->create_prop_value( 'number', (int) $parsed['duration'] ),
					'delay' => $this->create_prop_value( 'number', (int) $parsed['delay'] ),
				] ),
			] ),
		] );
	}

	private function parse_animation_id_string( $animation_id ) {
		$pattern = '/^([^-]+)-([^-]+)-([^-]+)-([^-]*)-(\d+)-(\d+)$/';

		if ( preg_match( $pattern, $animation_id, $matches ) ) {
			return [
				'trigger' => $matches[1],
				'effect' => $matches[2],
				'type' => $matches[3],
				'direction' => $matches[4],
				'duration' => (int) $matches[5],
				'delay' => (int) $matches[6],
			];
		}

		return null;
	}

	private function create_prop_value( $type, $value ) {
		return [
			'$$type' => $type,
			'value' => $value,
		];
	}

	final public function get_raw_data( $with_html_content = false ) {
		$raw_data = parent::get_raw_data( $with_html_content );

		$raw_data['styles'] = $this->styles;
		$raw_data['interactions'] = $this->interactions ?? [];
		$raw_data['editor_settings'] = $this->editor_settings;

		return $raw_data;
	}

	final public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [],
		];
	}

	public function get_atomic_settings(): array {
		$schema = static::get_props_schema();
		$props = $this->get_settings();

		return Render_Props_Resolver::for_settings()->resolve( $schema, $props );
	}

	public function get_atomic_setting( string $key ) {
		$schema = static::get_props_schema();

		if ( ! isset( $schema[ $key ] ) ) {
			return null;
		}

		$props = $this->get_settings();
		$prop_value = $props[ $key ] ?? null;

		$single_schema = [ $key => $schema[ $key ] ];
		$single_props = [ $key => $prop_value ];

		$resolved = Render_Props_Resolver::for_settings()->resolve( $single_schema, $single_props );

		return $resolved[ $key ] ?? null;
	}

	protected function parse_editor_settings( array $data ): array {
		$editor_data = [];

		if ( isset( $data['title'] ) && is_string( $data['title'] ) ) {
			$editor_data['title'] = sanitize_text_field( $data['title'] );
		}

		return $editor_data;
	}

	public static function get_props_schema(): array {
		$schema = static::define_props_schema();
		$schema['_cssid'] = String_Prop_Type::make()->meta( Component_Overridable_Prop_Type::ignore() );

		return apply_filters(
			'elementor/atomic-widgets/props-schema',
			$schema
		);
	}

	public function get_interactions_ids() {
		$animation_ids = [];

		$list_of_interactions = ( is_array( $this->interactions ) && isset( $this->interactions['items'] ) )
			? $this->interactions['items']
			: [];

		foreach ( $list_of_interactions as $interaction ) {
			if ( isset( $interaction['$$type'] ) && 'interaction-item' === $interaction['$$type'] ) {
				$animation_id = $this->extract_animation_id_from_prop_type( $interaction );
				if ( $animation_id ) {
					$animation_ids[] = $animation_id;
				}
			} elseif ( isset( $interaction['animation']['animation_id'] ) ) {
				$animation_ids[] = $interaction['animation']['animation_id'];
			}
		}

		return $animation_ids;
	}

	private function extract_animation_id_from_prop_type( $item ) {
		if ( ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
			return null;
		}

		$item_value = $item['value'];

		$trigger = $this->extract_prop_value( $item_value, 'trigger' );
		$animation = $this->extract_prop_value( $item_value, 'animation' );

		if ( ! is_array( $animation ) ) {
			return null;
		}

		$effect = $this->extract_prop_value( $animation, 'effect' );
		$type = $this->extract_prop_value( $animation, 'type' );
		$direction = $this->extract_prop_value( $animation, 'direction' );
		$timing_config = $this->extract_prop_value( $animation, 'timing_config' );

		$duration = 300;
		$delay = 0;

		if ( is_array( $timing_config ) ) {
			$duration = $this->extract_prop_value( $timing_config, 'duration', 300 );
			$delay = $this->extract_prop_value( $timing_config, 'delay', 0 );
		}

		return implode( '-', [ $trigger, $effect, $type, $direction, $duration, $delay ] );
	}
}
