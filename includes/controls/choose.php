<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor choose control.
 *
 * A base control for creating choose control. Displays radio button represented
 * as a stylized component with an icon for each option.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'align',
 *    	[
 *    		'label' => __( 'Alignment', 'plugin-domain' ),
 *    		'type' => Controls_Manager::CHOOSE,
 *    		'default' => 'center',
 *    		'options' => [
 *    			'left' => [
 *    				'title' => __( 'Left', 'plugin-domain' ),
 *    				'icon' => 'fa fa-align-left',
 *    			],
 *    			'center' => [
 *    				'title' => __( 'Center', 'plugin-domain' ),
 *    				'icon' => 'fa fa-align-center',
 *    			],
 *    			'right' => [
 *    				'title' => __( 'Right', 'plugin-domain' ),
 *    				'icon' => 'fa fa-align-right',
 *    			],
 *    		],
 *    		'toggle' => true,
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<div style="text-align:' . $this->get_settings( 'align' ) . '"> ... </div>'
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div style="text-align:{{ settings.align }}"> ... </div>
 *
 * @since 1.0.0
 *
 * @param string $label        Optional. The label that appears next of the
 *                             field. Default is empty.
 * @param string $title        Optional. The field title that appears on mouse
 *                             hover. Default is empty.
 * @param string $description  Optional. The description that appears below the
 *                             field. Default is empty.
 * @param string $default      Optional. The field default value. Default is
 *                             empty.
 * @param array  $options      {
 *     Optional. An array of arrays containing the `title` and the `icon` for
 *     each radio button:
 *     `[ [ 'title' => '', 'icon' => '' ], [ 'title' => '', 'icon' => '' ], ... ]`
 *     Default is an empty array.
 *
 *     @type string $title Optional. The text that will be shown as a tooltip on
 *                         hover. Default is empty.
 *     @type string $icon  Optional. Font icon class name. Can be any class in
 *                         the panel, e.g. 'fa fa-align-left' for Font Awesome.
 * }
 * @param bool   $toggle       Optional. Whether to allow toggle / unset the
 *                             selection. Default is true.
 * @param string $separator    Optional. Set the position of the control separator.
 *                             Available values are 'default', 'before', 'after'
 *                             and 'none'. 'default' will position the separator
 *                             depending on the control type. 'before' / 'after'
 *                             will position the separator before/after the
 *                             control. 'none' will hide the separator. Default
 *                             is 'default'.
 * @param bool   $show_label   Optional. Whether to display the label. Default
 *                             is true.
 * @param bool   $label_block  Optional. Whether to display the label in a
 *                             separate line. Default is true.
 */
class Control_Choose extends Base_Data_Control {

	/**
	 * Retrieve choose control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'choose';
	}

	/**
	 * Render choose control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid( '{{value}}' );
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-choices">
					<# _.each( data.options, function( options, value ) { #>
					<input id="<?php echo $control_uid; ?>" type="radio" name="elementor-choose-{{ data.name }}-{{ data._cid }}" value="{{ value }}">
					<label class="elementor-choices-label tooltip-target" for="<?php echo $control_uid; ?>" data-tooltip="{{ options.title }}" title="{{ options.title }}">
						<i class="{{ options.icon }}" aria-hidden="true"></i>
						<span class="elementor-screen-only">{{{ options.title }}}</span>
					</label>
					<# } ); #>
				</div>
			</div>
		</div>

		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Retrieve choose control default settings.
	 *
	 * Get the default settings of the choose control. Used to return the
	 * default settings while initializing the choose control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'options' => [],
			'label_block' => true,
			'toggle' => true,
		];
	}
}
