<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor base control.
 *
 * An abstract class for creating new controls in the panel.
 *
 * @since 1.0.0
 * @abstract
 */
abstract class Base_Control {

	/**
	 * Base settings.
	 *
	 * Holds all the base settings of the control.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $_base_settings = [
		'label' => '',
		'description' => '',
		'show_label' => true,
		'label_block' => false,
		'separator' => 'default',
	];

	/**
	 * Settings.
	 *
	 * Holds all the settings of the control.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $_settings = [];

	/**
	 * Get features.
	 *
	 * Retrieve the list of all the available features. Currently Elementor uses only
	 * the `UI` feature.
	 *
	 * @since 1.5.0
	 * @access public
	 * @static
	 *
	 * @return array Features array.
	 */
	public static function get_features() {
		return [];
	}

	/**
	 * Get control type.
	 *
	 * Retrieve the control type.
	 *
	 * @since 1.5.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_type();

	/**
	 * Control base constructor.
	 *
	 * Initializing the control base class.
	 *
	 * @since 1.5.0
	 * @access public
	 */
	public function __construct() {
		$this->_settings = array_merge( $this->_base_settings, $this->get_default_settings() );

		$this->_settings['features'] = static::get_features();
	}

	/**
	 * Enqueue control scripts and styles.
	 *
	 * Used to register and enqueue custom scripts and styles used by the control.
	 *
	 * @since 1.5.0
	 * @access public
	 */
	public function enqueue() {}

	/**
	 * Get control settings.
	 *
	 * Retrieve the control settings or a specific setting value.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param string $setting_key Optional. Specific key to return from the
	 *                            settings. If key set it will return the
	 *                            specific value of the key, otherwise the
	 *                            entire key array will be returned. Default is
	 *                            null.
	 *
	 * @return mixed The control settings, or specific setting value.
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
	 * Set control settings.
	 *
	 * Used to set or to update the settings of an existing control.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param string $key   Control settings key.
	 * @param mixed  $value Control settings value.
	 */
	final public function set_settings( $key, $value ) {
		$this->_settings[ $key ] = $value;
	}

	/**
	 * Control content template.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * Note that the content template is wrapped by Base_Control::print_template().
	 *
	 * @since 1.5.0
	 * @access public
	 * @abstract
	 */
	abstract public function content_template();

	/**
	 * Print control template.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.5.0
	 * @access public
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

	/**
	 * Get default control settings.
	 *
	 * Retrieve the default settings of the control. Used to return the default
	 * settings while initializing the control.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [];
	}
}
