<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor URL control.
 *
 * A base control for creating url control. Displays a URL input with the
 * ability to set the target of the link to `_blank` to open in a new tab.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'link',
 *    	[
 *    		'label' => __( 'Link', 'plugin-domain' ),
 *    		'type' => Controls_Manager::URL,
 *    		'placeholder' => __( 'https://your-link.com', 'plugin-domain' ),
 *    		'default' => [
 *    			'url' => '',
 *    			'is_external' => true,
 *    		]
 *    		'show_external' => true
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $website_link = $this->get_settings( 'website_link' );
 *    $target = $website_link['is_external'] ? 'target="_blank"' : '';
 *    echo '<a href="' . $website_link['url'] . '" ' . $target .'>Visit Website</a>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# var target = settings.website_link.is_external ? 'target="_blank"' : ''; #>
 *    <a href="{{ settings.website_link.url }}" {{ target }}>Visit Website</a>
 *
 * @since 1.0.0
 *
 * @param string $label         Optional. The label that appears above of the
 *                              field. Default is empty.
 * @param string $title         Optional. The field title that appears on mouse
 *                              hover. Default is empty.
 * @param string $placeholder   Optional. The field placeholder that appears
 *                              when the field has no values. Default is empty.
 * @param string $description   Optional. The description that appears below the
 *                              field. Default is empty.
 * @param array  $default       {
 *     Optional. The field default values.
 *
 *     @type string $url         Optional. Default is empty.
 *     @type bool   $is_external Optional. Determine whether to open the url in
 *                               the same tab or in a new one. Default is empty.
 *     @type bool   $nofollow    Optional. Determine whether to add nofolloe
 *                               attribute. Default is empty.
 * }
 * @param bool   $show_external Optional. Whether to show 'Is External' button.
 *                              Default is true.
 * @param string $separator     Optional. Set the position of the control separator.
 *                              Available values are 'default', 'before', 'after'
 *                              and 'none'. 'default' will position the separator
 *                              depending on the control type. 'before' / 'after'
 *                              will position the separator before/after the
 *                              control. 'none' will hide the separator. Default
 *                              is 'default'.
 * @param bool   $show_label    Optional. Whether to display the label. Default
 *                              is true.
 * @param bool   $label_block   Optional. Whether to display the label in a
 *                              separate line. Default is false.
 */
class Control_URL extends Control_Base_Multiple {

	/**
	 * Retrieve url control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'url';
	}

	/**
	 * Retrieve url control default values.
	 *
	 * Get the default value of the url control. Used to return the default
	 * values while initializing the url control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'url' => '',
			'is_external' => '',
			'nofollow' => '',
		];
	}

	/**
	 * Retrieve url control default settings.
	 *
	 * Get the default settings of the url control. Used to return the default
	 * settings while initializing the url control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_block' => true,
			'show_external' => true,
		];
	}

	/**
	 * Render url control output in the editor.
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

		$more_input_control_uid = $this->get_control_uid( 'more-input' );

		$is_external_control_uid = $this->get_control_uid( 'is_external' );

		$nofollow_control_uid = $this->get_control_uid( 'nofollow' );
		?>
		<div class="elementor-control-field elementor-control-url-external-{{{ data.show_external ? 'show' : 'hide' }}}">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<input id="<?php echo $control_uid; ?>" type="url" class="elementor-input" data-setting="url" placeholder="{{ data.placeholder }}" />
				<label for="<?php echo $more_input_control_uid; ?>" class="elementor-control-url-more tooltip-target" data-tooltip="<?php _e( 'Link Options', 'elementor' ); ?>">
					<i class="fa fa-cog" aria-hidden="true"></i>
				</label>
				<input id="<?php echo $more_input_control_uid; ?>" type="checkbox" class="elementor-control-url-more-input">
				<div class="elementor-control-url-more-options">
					<div class="elementor-control-url-option">
						<input id="<?php echo $is_external_control_uid; ?>" type="checkbox" class="elementor-control-url-option-input" data-setting="is_external">
						<label for="<?php echo $is_external_control_uid; ?>"><?php echo __( 'Open in new window', 'elementor' ); ?></label>
					</div>
					<div class="elementor-control-url-option">
						<input id="<?php echo $nofollow_control_uid; ?>" type="checkbox" class="elementor-control-url-option-input" data-setting="nofollow">
						<label for="<?php echo $nofollow_control_uid; ?>"><?php echo __( 'Add nofollow', 'elementor' ); ?></label>
					</div>
				</div>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
