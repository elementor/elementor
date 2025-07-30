<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Element_Base extends Element_Base {

	use Has_Atomic_Base;

	protected $version = '0.0';
	protected $styles = [];
	protected $editor_settings = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
		$this->editor_settings = $data['editor_settings'] ?? [];
	}

	abstract protected function define_atomic_controls(): array;

	public function get_global_scripts() {
		return [];
	}

	final public function get_initial_config() {
		$config = parent::get_initial_config();
		$props_schema = static::get_props_schema();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['atomic_props_schema'] = $props_schema;
		$config['dependencies_per_target_mapping'] = Dependency_Manager::get_source_to_dependents( $props_schema );
		$config['base_styles'] = $this->get_base_styles();
		$config['version'] = $this->version;
		$config['show_in_panel'] = true;
		$config['categories'] = [ 'v4-elements' ];
		$config['hide_on_search'] = false;
		$config['controls'] = [];
		$config['keywords'] = $this->get_keywords();

		return $config;
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;

	/**
	 * Get Element keywords.
	 *
	 * Retrieve the element keywords.
	 *
	 * @since 3.29
	 * @access public
	 *
	 * @return array Element keywords.
	 */
	public function get_keywords() {
		return [];
	}
}
