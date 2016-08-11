<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Control_Base {

	private $_base_settings = [
		'separator' => 'default',
		'label_block' => false,
		'show_label' => true,
	];

	private $_settings = [];

	abstract public function content_template();
	abstract public function get_type();

	public function enqueue() {}

	protected function get_default_settings() {
		return [];
	}

	public function get_default_value() {
		return '';
	}

	public function get_value( $control, $instance ) {
		if ( ! isset( $control['default'] ) )
			$control['default'] = $this->get_default_value();

		if ( ! isset( $instance[ $control['name'] ] ) )
			return $control['default'];

		return $instance[ $control['name'] ];
	}

	public function get_replace_style_values( $css_property, $control_value ) {
		return str_replace( '{{VALUE}}', $control_value, $css_property );
	}

	/**
	 * @param string $setting_key
	 *
	 * @return array
	 * @since 1.0.0
	 */
	final public function get_settings( $setting_key = null ) {
		if ( $setting_key ) {
			if ( isset( $this->_settings[ $setting_key ] ) ) {
				return $this->_settings[ $setting_key ];
			}

			return null;
		}

		return $this->_settings;
	}

	/**
	 * @return void
	 *
	 * @since 1.0.0
	 */
	final public function print_template() {
		?>
		<script type="text/html" id="tmpl-elementor-control-<?php echo esc_attr( $this->get_type() ); ?>-content">
			<div class="elementor-control-content">
				<?php $this->content_template(); ?>
			</div>
		</script>
		<?php
	}

	public function __construct() {
		$this->_settings = wp_parse_args( $this->get_default_settings(), $this->_base_settings );
	}
}
