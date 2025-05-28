<?php
namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Widget_Base;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Widget_Base extends Widget_Base {
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

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic'] = true;
		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['base_styles'] = $this->get_base_styles();
		$config['base_styles_dictionary'] = $this->get_base_styles_dictionary();
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

	protected function register_common_controls() {
		$common_controls = [];
		
		if ( Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_VERSION_3_30 ) ) {
			$common_controls[] = Text_Control::bind_to( '_cssid' )->set_label( __( 'ID', 'elementor' ) )->set_meta( [
				'layout' => 'two-columns',
				'topDivider' => true,
			] );
		}

		return $common_controls;
	}

	protected static function add_common_controls_to_props_scheme( $props ) {
		if ( Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_VERSION_3_30 ) ) {
			$props['_cssid'] = String_Prop_Type::make();
		}

		return $props;
	}
}
