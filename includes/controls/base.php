<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * @property string $label          The title of the control
 * @property mixed  $default        The default value
 * @property string $separator      Set the position of the control separator.
 *                                  'default' means that the separator will be posited depending on the control type.
 *                             		'before' || 'after' will force the separator position before/after the control.
 *                             		'none' will hide the separator
 *                             		Default: 'default'
 * @property bool   $show_label     Sets whether to show the title
 *                            		Default: true
 * @property bool   $label_block    Sets whether to display the title in a separate line
 *                             		Default: false
 * @property string $title          The title that will appear on mouse hover
 * @property string $placeholder    Available for fields that support placeholder
 * @property string $description    The field description that appears below the field
 *
 * @since 0.8.1
 */
abstract class Control_Base {

	private $_base_settings = [
		'separator' => 'default',
		'label_block' => false,
		'show_label' => true,
	];

	private $_settings = [];

	abstract public function content_template();

	abstract public function get_type();

	public function __construct() {
		$this->_settings = wp_parse_args( $this->get_default_settings(), $this->_base_settings );
	}

	public function enqueue() {}

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

	public function get_replaced_style_values( $css_property, $control_value ) {
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

	protected function get_default_settings() {
		return [];
	}
}
