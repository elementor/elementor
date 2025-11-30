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

		if ( isset( $interactions['items'] ) && is_array( $interactions['items'] ) ) {
			return $this->convert_prop_type_interactions_to_legacy_for_runtime( $interactions );
		}

		return $interactions;
	}

	private function convert_prop_type_interactions_to_legacy_for_runtime( $interactions ) {
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
