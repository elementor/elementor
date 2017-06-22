<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A private control for section columns structure.
 *
 * @since 1.0.0
 */
class Control_Structure extends Base_Data_Control {

	public function get_type() {
		return 'structure';
	}

	public function content_template() {
		$preset_control_uid = $this->get_control_uid( '{{ preset.key }}' );
		?>
		<div class="elementor-control-field">
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-structure-title"><?php _e( 'Structure', 'elementor' ); ?></div>
				<# var currentPreset = elementor.presetsFactory.getPresetByStructure( data.controlValue ); #>
				<div class="elementor-control-structure-preset elementor-control-structure-current-preset">
					{{{ elementor.presetsFactory.getPresetSVG( currentPreset.preset, 233, 72, 5 ).outerHTML }}}
				</div>
				<div class="elementor-control-structure-reset"><i class="fa fa-undo"></i><?php _e( 'Reset Structure', 'elementor' ); ?></div>
				<#
				var morePresets = getMorePresets();

				if ( morePresets.length > 1 ) { #>
					<div class="elementor-control-structure-more-presets-title"><?php _e( 'More Structures', 'elementor' ); ?></div>
					<div class="elementor-control-structure-more-presets">
						<# _.each( morePresets, function( preset ) { #>
							<div class="elementor-control-structure-preset-wrapper">
								<input id="<?php echo $preset_control_uid; ?>" type="radio" name="elementor-control-structure-preset-{{ data._cid }}" data-setting="structure" value="{{ preset.key }}">
								<label for="<?php echo $preset_control_uid; ?>" class="elementor-control-structure-preset">
									{{{ elementor.presetsFactory.getPresetSVG( preset.preset, 102, 42 ).outerHTML }}}
								</label>
								<div class="elementor-control-structure-preset-title">{{{ preset.preset.join( ', ' ) }}}</div>
							</div>
						<# } ); #>
					</div>
				<# } #>
			</div>
		</div>
		
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
			'label_block' => true,
		];
	}
}
