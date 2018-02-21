<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Base_Tag extends Controls_Stack {

	final public static function get_type() {
		return 'tag';
	}

	abstract public function get_categories();

	abstract public function get_group();

	abstract public function get_title();

	abstract public function get_content( array $options = [] );

	abstract public function get_content_type();

	public function get_panel_template_setting_key() {
		return '';
	}

	public function print_panel_template() {
		$panel_template_setting_key = $this->get_panel_template_setting_key();

		if ( ! $panel_template_setting_key ) {
			return;
		}
		?>
		<# if ( <?php echo $panel_template_setting_key; ?> ) { #>
			({{{<?php echo $panel_template_setting_key; ?>}}})
		<# } #>
		<?php
	}

	final public function get_unique_name() {
		return 'tag-' . $this->get_name();
	}

	protected function _get_initial_config() {
		$config = parent::_get_initial_config();

		$config['content_type'] = $this->get_content_type();

		return $config;
	}

	final protected function init_controls() {
		Plugin::$instance->controls_manager->open_stack( $this );

		$this->start_controls_section( 'settings', [
			'label' => __( 'Settings', 'elementor' ),
		] );

		$this->_register_controls();

		// If in fact no controls were registered, empty the stack
		if ( 1 === count( Plugin::$instance->controls_manager->get_stacks( $this->get_unique_name() )['controls'] ) ) {
			Plugin::$instance->controls_manager->open_stack( $this );

			return;
		}

		$this->end_controls_section();
	}
}
