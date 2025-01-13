<?php
namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Modules\AtomicWidgets\Engine;
use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Atomic_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Widget_Base extends Widget_Base {
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

		$config['atomic'] = true;
		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['atomic_props_schema'] = static::get_props_schema();
		$config['atomic_template'] = $this->get_atomic_template();
		$config['version'] = $this->version;

		return $config;
	}

	final protected function render() {
		echo Engine::get_instance()
			->register( $this->get_name(), $this->get_atomic_template() )
			->render( $this->get_name(), $this->get_atomic_settings() );
	}

	// Removes the wrapper div from the widget.
	public function before_render() {}
	public function after_render() {}

	abstract public function get_atomic_template(): string;

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;
}
