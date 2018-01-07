<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor date/time control.
 *
 * A base control for creating date time control. Displays a date/time picker
 * based on the Flatpickr library
 * @see https://chmln.github.io/flatpickr/
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'due_date',
 *    	[
 *    		'label' => __( 'Due Date', 'plugin-domain' ),
 *    		'type' => Controls_Manager::DATE_TIME,
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $due_date = strtotime( $this->get_settings( 'due_date' ) );
 *    // GMT timezone
 *    // $due_date -= ( get_option( 'gmt_offset' ) * HOUR_IN_SECONDS );
 *    $due_date_in_days = $due_date / DAY_IN_SECONDS;
 *    echo '<p>' . sprintf( __( 'Something will happen in %s days.', 'plugin-domain' ), $due_date_in_days ) . '</p>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <#
 *    var due_date = new Date( settings.due_date ),
 *        now_date = new Date(),
 *        due_date_in_days = Math.floor( ( due_date - now_date ) / 86400000 ); // 86400000 miliseconds in one Day.
 *    #>
 *    <p> Something will happen in {{{ due_date_in_days }}} days. </p>
 *
 * @since 1.0.0
 *
 * @param string $label          Optional. The label that appears next of the
 *                               field. Default is empty.
 * @param string $title          Optional. The field title that appears on mouse
 *                               hover. Default is empty.
 * @param string $description    Optional. The description that appears below
 *                               the field. Default is empty.
 * @param string $default        Optional. Default date in mysql format
 *                               `(YYYY-mm-dd HH:ii)`. Default is empty.
 * @param array  $picker_options Optional. The picker configurations.
 *                               @see https://chmln.github.io/flatpickr/options/
 *                               But you cannot use `onHide` callback that is
 *                               already in use (`onHide: saveValue()`).
 *                               Default is an empty array.
 * @param string $separator      Optional. Set the position of the control separator.
 *                               Available values are 'default', 'before', 'after'
 *                               and 'none'. 'default' will position the separator
 *                               depending on the control type. 'before' / 'after'
 *                               will position the separator before/after the
 *                               control. 'none' will hide the separator. Default
 *                               is 'default'.
 * @param bool   $show_label     Optional. Whether to display the label. Default
 *                               is true.
 * @param bool   $label_block    Optional. Whether to display the label in a
 *                               separate line. Default is true.
 */
class Control_Date_Time extends Base_Data_Control {

	/**
	 * Retrieve date time control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'date_time';
	}

	/**
	 * Retrieve date time control default settings.
	 *
	 * Get the default settings of the date time control. Used to return the
	 * default settings while initializing the date time control.
	 *
	 * @since 1.8.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'picker_options' => [],
			'label_block' => true,
		];
	}

	/**
	 * Render date time control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<input id="<?php echo $control_uid; ?>" class="elementor-date-time-picker flatpickr" type="text" data-setting="{{ data.name }}">
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
