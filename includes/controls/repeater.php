<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor repeater control.
 *
 * A base control for creating repeater control. Repeater control allows you to
 * build repeatable blocks of fields. You can create, for example, a set of
 * fields that will contain a title and a WYSIWYG text - the user will then be
 * able to add "rows", and each row will contain a title and a text. The data
 * can be wrapper in custom HTML tags, designed using CSS, and interact using JS
 * or external libraries.
 *
 * NOTE: THIS CONTROL IS UNDER DEVELOPMENT, USE IT AT YOUR OWN RISK.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'list',
 *    	[
 *    		'label' => __( 'Repeater List', 'plugin-domain' ),
 *    		'type' => Controls_Manager::REPEATER,
 *    		'default' => [
 *    			[
 *    				'list_title' => __( 'Title #1', 'plugin-domain' ),
 *    				'list_content' => __( 'Item content. Click the edit button to change this text.', 'plugin-domain' ),
 *    			],
 *    			[
 *    				'list_title' => __( 'Title #2', 'plugin-domain' ),
 *    				'list_content' => __( 'Item content. Click the edit button to change this text.', 'plugin-domain' ),
 *    			],
 *    		],
 *    		'fields' => [
 *    			[
 *    				'name' => 'list_title',
 *    				'label' => __( 'Title', 'plugin-domain' ),
 *    				'type' => Controls_Manager::TEXT,
 *    				'default' => __( 'List Title' , 'plugin-domain' ),
 *    				'label_block' => true,
 *    			],
 *    			[
 *    				'name' => 'list_content',
 *    				'label' => __( 'Content', 'plugin-domain' ),
 *    				'type' => Controls_Manager::WYSIWYG,
 *    				'default' => __( 'List Content' , 'plugin-domain' ),
 *    				'show_label' => false,
 *    			],
 *    		],
 *    		'title_field' => '{{{ list_title }}}',
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $list = $this->get_settings( 'list' );
 *    if ( $list ) {
 *    	echo '<dl>';
 *    	foreach ( $list as $item ) {
 *    		echo '<dt>' . $item['list_title'] . '</dt>';
 *    		echo '<dd>' . $item['list_content'] . '</dd>';
 *    	}
 *    	echo '</dl>';
 *    }
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# if ( settings.list ) { #>
 *    	<dl>
 *    	<# _.each( settings.list, function( item ) { #>
 *    		<dt> {{ item.tab_title }} </dt>
 *    		<dd> {{ item.list_content }} </dd>
 *    	<# }); #>
 *    	</dl>
 *    <# } #>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param array  $default     Optional. Default repeater values. An array of
 *                            arrays containing fields as keys and default
 *                            values for each key as values:
 *                            `[ [ 'title' => '', 'content' => '' ], [ 'title' => '', 'content' => '' ], ... ]`
 *                            Default is an empty array.
 * @param array  $fields      Optional. An array of arrays contaning the repeter
 *                            fields. Default is an empty array.
 * @param string $title_field Optional. Field that will be used as the repeater
 *                            title in the fields list when the item is mnimized.
 *                            Default is empty.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is false.
 */
class Control_Repeater extends Base_Data_Control {

	/**
	 * Retrieve repeater control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'repeater';
	}

	/**
	 * Retrieve repeater control default settings.
	 *
	 * Get the default settings of the repeater control. Used to return the
	 * default settings while initializing the repeater control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'prevent_empty' => true,
			'is_repeater' => true,
		];
	}

	/**
	 * Retrieve repeater control value.
	 *
	 * Get the value of the repeater control from a specific widget.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $control Control
	 * @param array $widget  Widget
	 *
	 * @return mixed Control values.
	 */
	public function get_value( $control, $widget ) {
		$value = parent::get_value( $control, $widget );

		if ( ! empty( $value ) ) {
			foreach ( $value as &$item ) {
				foreach ( $control['fields'] as $field ) {
					$control_obj = Plugin::$instance->controls_manager->get_control( $field['type'] );

					// Prior to 1.5.0 the fields may contains non-data controls.
					if ( ! $control_obj instanceof Base_Data_Control ) {
						continue;
					}

					$item[ $field['name'] ] = $control_obj->get_value( $field, $item );
				}
			}
		}
		return $value;
	}

	/**
	 * Import repeater.
	 *
	 * Used as a wrapper method for inner controls while importing Elementor
	 * template JSON file, and replacing the old data.
	 *
	 * @since 1.8.0
	 * @access public
	 *
	 * @param array $settings     Control settings.
	 * @param array $control_data Optional. Control data. Default is an empty array.
	 *
	 * @return array Control settings.
	 */
	public function on_import( $settings, $control_data = [] ) {
		if ( empty( $settings ) || empty( $control_data['fields'] ) ) {
			return $settings;
		}

		$method = 'on_import';

		foreach ( $settings as &$item ) {
			foreach ( $control_data['fields'] as $field ) {
				if ( empty( $field['name'] ) || empty( $item[ $field['name'] ] ) ) {
					continue;
				}

				$control_obj = Plugin::$instance->controls_manager->get_control( $field['type'] );

				if ( ! $control_obj ) {
					continue;
				}

				if ( method_exists( $control_obj, $method ) ) {
					$item[ $field['name'] ] = $control_obj->{$method}( $item[ $field['name'] ], $field );
				}
			}
		}

		return $settings;
	}

	/**
	 * Render repeater control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title">{{{ data.label }}}</span>
		</label>
		<div class="elementor-repeater-fields"></div>
		<div class="elementor-button-wrapper">
			<button class="elementor-button elementor-button-default elementor-repeater-add" type="button">
				<i class="eicon-plus" aria-hidden="true"></i><?php _e( 'Add Item', 'elementor' ); ?>
			</button>
		</div>
		<?php
	}
}
