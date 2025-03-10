<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Element_Base extends Element_Base {

	use Has_Atomic_Base;

	protected $version = '0.0';
	protected $styles = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
	}

	abstract protected function define_atomic_controls(): array;

	final public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['atomic_props_schema'] = static::get_props_schema();
		$config['base_styles'] = $this->get_base_styles();
		$config['version'] = $this->version;
		$config['show_in_panel'] = true;
		$config['categories'] = [ 'v4-elements' ];
		$config['hide_on_search'] = false;
		$config['controls'] = [];

		return $config;
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;
}
