<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

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

	public function is_settings_required() {
		return false;
	}

	public function print_panel_template() {
		$panel_template_setting_key = $this->get_panel_template_setting_key();

		if ( ! $panel_template_setting_key ) {
			return;
		}
		?><#
		var key = <?php echo esc_html( $panel_template_setting_key ); ?>;

		if ( key ) {
			var settingsKey = "<?php echo esc_html( $panel_template_setting_key ); ?>";

			/*
			 * If the tag has controls,
			 * and key is an existing control (and not an old one),
			 * and the control has options (select/select2),
			 * and the key is an existing option (and not in a group or an old one).
			 */
			if ( controls && controls[settingsKey] ) {
				var controlSettings = controls[settingsKey];

				if ( controlSettings.options && controlSettings.options[ key ] ) {
					key = controlSettings.options[ key ];
				} else if ( controlSettings.groups ) {
					var label = _.filter( _.pluck( _.pluck( controls.key.groups, 'options' ), key ) );

					if ( label ) {
						key = label;
					}
				}
			}

			print( '(' + key + ')' );
		}
		#>
		<?php
	}

	final public function get_unique_name() {
		return 'tag-' . $this->get_name();
	}

	protected function register_advanced_section() {}

	final protected function init_controls() {
		Plugin::$instance->controls_manager->open_stack( $this );

		$this->start_controls_section( 'settings', [
			'label' => __( 'Settings', 'elementor' ),
		] );

		$this->_register_controls();

		$this->end_controls_section();

		// If in fact no controls were registered, empty the stack
		if ( 1 === count( Plugin::$instance->controls_manager->get_stacks( $this->get_unique_name() )['controls'] ) ) {
			Plugin::$instance->controls_manager->open_stack( $this );
		}

		$this->register_advanced_section();
	}
}
