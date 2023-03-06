<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor gap control.
 *
 * A base control for creating gap control. Displays input fields for two values,
 * row/column, hight/width/ and the option to link them together.
 *
 * @since 3.13.0
 */

class Control_Gap extends Control_Base_Units {

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
		return 'gap';
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
		return array_merge(
			parent::get_default_value(), [
				'row-gap' => '',
				'column-gap' => '',
				'isLinked' => true,
			]
		);
	}

	/**
	 * Get gap control default settings.
	 *
	 * Retrieve the default settings of the gap control. Used to return the default
	 * settings while initializing the gap control.
	 *
	 * @since 3.13.0
	 * @access public
	 *
	 * @return array Control default settings.
	 */
	public function get_default_settings() {
			return array_merge(
				parent::get_default_settings(), [
					'label_block' => true,
					'allowed_dimensions' => 'all',
					'titles' => [
						'row' => esc_html__( 'Row', 'elementor' ),
						'column' => esc_html__( 'Column', 'elementor' ),
					],
					'placeholder' => '',
				]
			);
	}

	/**
	 * Render gap control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS template.
	 * The variables for the class are available using `data` JS object.
	 *
	 * @since 3.13.0
	 * @access public
	 */
	public function content_template() {
		?>
			<div class="elementor-control-field">
				<label class="elementor-control-title">{{{ data.label }}}</label>
				<?php $this->print_units_template(); ?>
				<div class="elementor-control-input-wrapper">
					<ul class="elementor-control-gaps">
					<# _.each ( data.titles, function( title, property )  {
						const controlUid = `elementor-control-${ property }-${ data._cid }`;
						#>
						<li class="elementor-control-gap">
							<input
									id="{{ controlUid }}"
									type="text"
									data-setting="{{{property}}}"
									placeholder="<#
									placeholder = view.getControlPlaceholder();
									if ( _.isObject( placeholder ) ) {
										if ( ! _.isUndefined( placeholder[property] ) ) {
											print( placeholder[property] );
										}
									} else {
										print( placeholder );
									} #>"
								/>
							<label for="{{ controlUid }}" class="elementor-control-gap-label">
								{{{title}}}
							</label>
						</li>
					<# } ) #>
						<li>
							<button class="elementor-link-gaps tooltip-target" data-tooltip="<?php echo esc_attr__( 'Link values together', 'elementor' ); ?>">
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
