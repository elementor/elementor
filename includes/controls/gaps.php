<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor gap control.
 *
 * A base control for creating a gap control. Displays input fields for two values,
 * row/column, height/width and the option to link them together.
 *
 * @since 3.13.0
 */

class Control_Gaps extends Control_Dimensions {
	/**
	 * Get gap control type.
	 *
	 * Retrieve the control type, in this case `gap`.
	 *
	 * @since 3.13.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'gaps';
	}

	/**
	 * Get gap control default values.
	 *
	 * Retrieve the default value of the gap control. Used to return the default
	 * values while initializing the gap control.
	 *
	 * @since 3.13.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'column' => '',
			'row' => '',
			'isLinked' => true,
			'unit' => 'px',
		];
	}

	public function get_singular_name() {
		return 'gap';
	}

	protected function get_dimensions() {
		return [
			'column' => esc_html__( 'Column', 'elementor' ),
			'row' => esc_html__( 'Row', 'elementor' ),
		];
	}

	/**
	 * Render gaps control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 3.16.0
	 * @access public
	 */
	public function content_template() {
		$class_name = $this->get_singular_name();
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<?php $this->print_units_template(); ?>
			<div class="elementor-control-input-wrapper">
				<ul class="elementor-control-<?php echo esc_attr( $class_name ); ?>s">
					<?php
					foreach ( $this->get_dimensions() as $dimension_key => $dimension_title ) :
						?>
						<li class="elementor-control-<?php echo esc_attr( $class_name ); ?>">
							<input id="<?php $this->print_control_uid( $dimension_key ); ?>" type="text" data-setting="<?php
							// PHPCS - the variable $dimension_key is a plain text.
							echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>" placeholder="<#
									placeholder = view.getControlPlaceholder();
									if ( _.isObject( placeholder ) && ! _.isUndefined( placeholder.<?php
									// PHPCS - the variable $dimension_key is a plain text.
									echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									?> ) ) {
											print( placeholder.<?php
											// PHPCS - the variable $dimension_key is a plain text.
											echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
											?> );
									} #>"
							<# if ( -1 === _.indexOf( allowed_dimensions, '<?php
							// PHPCS - the variable $dimension_key is a plain text.
							echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>' ) ) { #>
							disabled
							<# } #>
							/>
							<label for="<?php $this->print_control_uid( $dimension_key ); ?>" class="elementor-control-<?php echo esc_attr( $class_name ); ?>-label"><?php
								// PHPCS - the variable $dimension_title holds an escaped translated value.
								echo $dimension_title; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?></label>
						</li>
					<?php endforeach; ?>
					<li>
						<button class="elementor-link-<?php echo esc_attr( $class_name ); ?>s tooltip-target" data-tooltip="<?php echo esc_attr__( 'Link values together', 'elementor' ); ?>">
							<span class="elementor-linked">
								<i class="eicon-link" aria-hidden="true"></i>
								<span class="elementor-screen-only"><?php echo esc_html__( 'Link values together', 'elementor' ); ?></span>
							</span>
							<span class="elementor-unlinked">
								<i class="eicon-chain-broken" aria-hidden="true"></i>
								<span class="elementor-screen-only"><?php echo esc_html__( 'Unlinked values', 'elementor' ); ?></span>
							</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
