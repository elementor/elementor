<?php
namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Atomic_Widget_Base extends Widget_Base {
	use Has_Atomic_Base;

	protected $version = '0.0';
	protected $styles = [];
	protected $interactions = [];
	protected $editor_settings = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
		// $this->interactions = $data['interactions'] ?? [];
		$this->interactions = $this->parse_atomic_interactions( $data['interactions'] ?? [] );
		$this->editor_settings = $data['editor_settings'] ?? [];
	}

	private function parse_atomic_interactions( $interactions ) {
		if ( empty( $interactions ) ) {
			return [];
		}
	
		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				$interactions = $decoded;
			}
		}
	
		if ( ! is_array( $interactions ) ) {
			return [];
		}
	
		// Transform prop-type to legacy format for editor/frontend
		if ( isset( $interactions['items'] ) && is_array( $interactions['items'] ) ) {
			return $this->convert_prop_type_interactions_to_legacy_for_runtime( $interactions );
		}
	
		return $interactions;
	}
	
	private function convert_prop_type_interactions_to_legacy_for_runtime( $interactions ) {
		$legacy_items = [];
	
		foreach ( $interactions['items'] as $item ) {
			if ( isset( $item['$$type'] ) && $item['$$type'] === 'interaction-item' ) {
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

	// private function transform_interactions_for_runtime( $interactions ) {
	// 	if ( is_string( $interactions ) ) {
	// 		$decoded = json_decode( $interactions, true );
	// 		if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
	// 			$interactions = $decoded;
	// 		}
	// 	}
		
	// 	if ( isset( $interactions['items'] ) ) {
	// 		return $this->convert_prop_type_interactions_to_legacy( $interactions );
	// 	}
		
	// 	return $interactions;
	// }

	// private function convert_prop_type_interactions_to_legacy( $interactions ) {
	// 	$legacy_items = [];

	// 	foreach ( $interactions['items'] as $item ) {
	// 		if ( isset( $item['$$type'] ) && $item['$$type'] === 'interaction-item' ) {
	// 			$legacy_item = $this->extract_legacy_interaction_from_prop_type( $item );
	// 			if ( $legacy_item ) {
	// 				$legacy_items[] = $legacy_item;
	// 			}
	// 		} else {
	// 			$legacy_items[] = $item;
	// 		}
	// 	}

	// 	return [
	// 		'version' => $interactions['version'] ?? 1,
	// 		'items' => $legacy_items,
	// 	];
	// }

	// private function extract_legacy_interaction_from_prop_type( $item ) {
	// 	if ( ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
	// 		return null;
	// 	}

	// 	$item_value = $item['value'];

	// 	$interaction_id = $this->extract_prop_value( $item_value, 'interaction_id' );
	// 	$trigger = $this->extract_prop_value( $item_value, 'trigger' );
	// 	$animation = $this->extract_prop_value( $item_value, 'animation' );

	// 	if ( ! is_array( $animation ) ) {
	// 		return null;
	// 	}

	// 	$effect = $this->extract_prop_value( $animation, 'effect' );
	// 	$type = $this->extract_prop_value( $animation, 'type' );
	// 	$direction = $this->extract_prop_value( $animation, 'direction' );
	// 	$timing_config = $this->extract_prop_value( $animation, 'timing_config' );

	// 	$duration = 300;
	// 	$delay = 0;

	// 	if ( is_array( $timing_config ) ) {
	// 		$duration = $this->extract_prop_value( $timing_config, 'duration', 300 );
	// 		$delay = $this->extract_prop_value( $timing_config, 'delay', 0 );
	// 	}

	// 	$animation_id = implode( '-', [ $trigger, $effect, $type, $direction, $duration, $delay ] );

	// 	return [
	// 		'interaction_id' => $interaction_id,
	// 		'animation' => [
	// 			'animation_id' => $animation_id,
	// 			'animation_type' => 'full-preset',
	// 		],
	// 	];
	// }

	// private function extract_prop_value( $data, $key, $default = '' ) {
	// 	if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
	// 		return $default;
	// 	}

	// 	$value = $data[ $key ];

	// 	if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
	// 		return $value['value'];
	// 	}

	// 	return $value !== null ? $value : $default;
	// }

	abstract protected function define_atomic_controls(): array;

	public function get_global_scripts() {
		return [];
	}

	public function get_initial_config() {
		$config = parent::get_initial_config();
		$props_schema = static::get_props_schema();

		$config['atomic'] = true;
		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['base_styles'] = $this->get_base_styles();
		$config['base_styles_dictionary'] = $this->get_base_styles_dictionary();
		$config['atomic_props_schema'] = $props_schema;
		$config['dependencies_per_target_mapping'] = Dependency_Manager::get_source_to_dependents( $props_schema );
		$config['version'] = $this->version;

		return $config;
	}

	public function get_categories(): array {
		return [ 'v4-elements' ];
	}

	public function before_render() {}
	public function after_render() {}

	abstract protected static function define_props_schema(): array;

	public static function generate() {
		return Widget_Builder::make( static::get_element_type() );
	}
}