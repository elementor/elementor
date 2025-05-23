<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor dimension control.
 *
 * A base control for creating dimension control. Displays input fields for top,
 * right, bottom, left and the option to link them together.
 *
 * @since 1.0.0
 */
class Control_Dimensions extends Control_Base_Units {

	/**
	 * Get dimensions control type.
	 *
	 * Retrieve the control type, in this case `dimensions`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'dimensions';
	}

	/**
	 * Get dimensions control default values.
	 *
	 * Retrieve the default value of the dimensions control. Used to return the
	 * default values while initializing the dimensions control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return array_merge(
			parent::get_default_value(), [
				'top' => '',
				'right' => '',
				'bottom' => '',
				'left' => '',
				'isLinked' => true,
			]
		);
	}

	/**
	 * Get dimensions control default settings.
	 *
	 * Retrieve the default settings of the dimensions control. Used to return the
	 * default settings while initializing the dimensions control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return array_merge(
			parent::get_default_settings(), [
				'label_block' => true,
				'allowed_dimensions' => 'all',
				'placeholder' => '',
			]
		);
	}

	/**
	 * Render dimensions control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$dimensions = [
			'top' => esc_html__( 'Top', 'elementor' ),
			'right' => esc_html__( 'Right', 'elementor' ),
			'bottom' => esc_html__( 'Bottom', 'elementor' ),
			'left' => esc_html__( 'Left', 'elementor' ),
		];
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<?php $this->print_units_template(); ?>
			<div class="elementor-control-input-wrapper">
				<ul class="elementor-control-dimensions">
					<?php
					foreach ( $dimensions as $dimension_key => $dimension_title ) :
						?>
						<li class="elementor-control-dimension">
							<input id="<?php $this->print_control_uid( $dimension_key ); ?>" type="text" data-setting="<?php
								// PHPCS - the variable $dimension_key is a plain text.
								echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>" placeholder="<#
								placeholder = view.getControlPlaceholder();
								if ( _.isObject( placeholder ) ) {
									if ( ! _.isUndefined( placeholder.<?php
										// PHPCS - the variable $dimension_key is a plain text.
										echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									?> ) ) {
										print( placeholder.<?php
											// PHPCS - the variable $dimension_key is a plain text.
											echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
										?> );
									}
								} else {
								print( placeholder );
								} #>"
							<# if ( -1 === _.indexOf( allowed_dimensions, '<?php
								// PHPCS - the variable $dimension_key is a plain text.
								echo $dimension_key; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>' ) ) { #>
								disabled
								<# } #>
									/>
							<label for="<?php $this->print_control_uid( $dimension_key ); ?>" class="elementor-control-dimension-label"><?php
								// PHPCS - the variable $dimension_title holds an escaped translated value.
								echo $dimension_title; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?></label>
						</li>
					<?php endforeach; ?>
					<li>
						<button class="elementor-link-dimensions tooltip-target" data-tooltip="<?php echo esc_attr__( 'Link values together', 'elementor' ); ?>">
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
