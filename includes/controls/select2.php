<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor select2 control.
 *
 * A base control for creating select2 control. Displays a select box control
 * based on select2 jQuery plugin @see https://select2.github.io/ .
 * It accepts an array in which the `key` is the value and the `value` is the
 * option name. Set `multiple` to `true` to allow multiple value selection.
 *
 * @since 1.0.0
 */
class Control_Select2 extends Base_Data_Control {

	/**
	 * Get select2 control type.
	 *
	 * Retrieve the control type, in this case `select2`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'select2';
	}

	/**
	 * Get select2 control default settings.
	 *
	 * Retrieve the default settings of the select2 control. Used to return the
	 * default settings while initializing the select2 control.
	 *
	 * @since 1.8.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'options' => [],
			'multiple' => false,
			'select2options' => [],
		];
	}

	/**
	 * Render select2 control output in the editor.
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
			<# if ( data.label ) {#>
				<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<# } #>
			<div class="elementor-control-input-wrapper elementor-control-unit-5">
				<# var multiple = ( data.multiple ) ? 'multiple' : ''; #>
				<select id="<?php echo $control_uid; ?>" class="elementor-select2" type="select2" {{ multiple }} data-setting="{{ data.name }}">
					<# _.each( data.options, function( option_title, option_value ) {
						var value = data.controlValue;
						if ( typeof value == 'string' ) {
							var selected = ( option_value === value ) ? 'selected' : '';
						} else if ( null !== value ) {
							var value = _.values( value );
							var selected = ( -1 !== value.indexOf( option_value ) ) ? 'selected' : '';
						}
						#>
					<option {{ selected }} value="{{ option_value }}">{{{ option_title }}}</option>
					<# } ); #>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}


	/**
	 * @param string|array $value
	 * @param array $config
	 *
	 * @return string|array
	 */
	public function before_save( $value, array $config ) {
		return $this->validate_value( $value, $config );
	}

	/**
	 * Validate the value is listed in the control options config.
	 *
	 * Avoid change settings like `html_tag` & `title_size` to a `script` tag.
	 *
	 * @param string|array $value
	 * @param array $config
	 *
	 * @return string|array
	 */
	private function validate_value( $value, array $config ) {
		if ( empty( $config['validate'] ) ) {
			return $value;
		}

		// Handle multiple select.
		if ( ! empty( $config['multiple'] ) ) {
			$validated_value = [];

			foreach ( $value as $index => $item ) {
				if ( isset( $config['options'][ $item ] ) ) {
					$validated_value[ $index ] = $item;
				}
			}

			$value = $validated_value;
			$is_valid = true;
		} else {
			$is_valid = isset( $config['options'][ $value ] );
		}

		// If it's not one of the control options. reset it to default.
		if ( ! $is_valid ) {
			$value = $config['default'];
		}

		return $value;
	}
}
