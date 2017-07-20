<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A base control for creation of all controls in the panel. All controls accept all the params listed below.
 *
 * @param string $label               The title of the control
 * @param mixed  $default             The default value
 * @param string $separator           Set the position of the control separator.
 *                                    'default' means that the separator will be posited depending on the control type.
 *                                    'before' || 'after' will force the separator position before/after the control.
 *                                    'none' will hide the separator
 *                                    Default: 'default'
 * @param bool   $show_label          Sets whether to show the title
 *                                    Default: true
 * @param bool   $label_block         Sets whether to display the title in a separate line
 *                                    Default: false
 * @param string $title               The title that will appear on mouse hover
 * @param string $placeholder         Available for fields that support placeholder
 * @param string $description         The field description that appears below the field
 *
 * @since 1.0.0
 */
abstract class Base_Control {
	private $_base_settings = [
		'label' => '',
		'separator' => 'default',
		'show_label' => true,
		'label_block' => false,
		'title' => '',
		'placeholder' => '',
		'description' => '',
	];

	private $_settings = [];

	public static function get_features() {
		return [];
	}

	abstract public function content_template();

	abstract public function get_type();

	public function __construct() {
		$this->_settings = array_merge( $this->_base_settings, $this->get_default_settings() );

		$this->_settings['features'] = static::get_features();
	}

	public function enqueue() {}

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
	 * @param $key
	 * @param $value
	 *
	 * @since    1.5.0
	 */
	final public function set_settings( $key, $value ) {
		$this->_settings[ $key ] = $value;
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
