<?php
namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
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

	public function get_keywords() {
		return [ 'Atoms', 'Atomic' ];
	}

	public static function add_common_props(): array
	{
		return [
			'css-id' => String_Prop_Type::make(),
		];
	}

	public static function add_common_controls(): array
	{
		return [
			Text_Control::bind_to('css-id')
				->set_label(__('CSS ID', 'elementor')),
		];
	}

	abstract protected function define_atomic_controls(): array;

	public function get_global_scripts() {
		return [];
	}

	final public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic'] = true;
		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['base_styles'] = $this->get_base_styles();
		$config['atomic_props_schema'] = static::get_props_schema();
		$config['version'] = $this->version;

		return $config;
	}

	public function get_categories(): array {
		return [ 'v4-elements' ];
	}
	/**
	 * TODO: Removes the wrapper div from the widget.
	 */
	public function before_render() {}
	public function after_render() {}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;
}
