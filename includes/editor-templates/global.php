<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-elementor-empty-preview">
	<div class="elementor-first-add">
		<div class="elementor-icon eicon-plus"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-add-section">
	<div class="elementor-add-section-inner">
		<div class="elementor-add-section-close">
			<i class="eicon-close" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Close', 'elementor' ); ?></span>
		</div>
		<div class="e-view elementor-add-new-section">
			<?php
				$experiments_manager = Plugin::$instance->experiments;
				$add_container_title = esc_html__( 'Add New Container', 'elementor' );
				$add_section_title = esc_html__( 'Add New Section', 'elementor' );

				$button_title = ( $experiments_manager->is_feature_active( 'container' ) ) ? $add_container_title : $add_section_title;
			?>
			<div class="elementor-add-section-area-button elementor-add-section-button" title="<?php echo esc_attr( $button_title ); ?>">
				<i class="eicon-plus"></i>
			</div>
			<div class="elementor-add-section-area-button elementor-add-template-button" title="<?php echo esc_attr__( 'Add Template', 'elementor' ); ?>">
				<i class="eicon-folder"></i>
			</div>
			<div class="elementor-add-section-drag-title"><?php echo esc_html__( 'Drag widget here', 'elementor' ); ?></div>
		</div>
		<div class="e-view elementor-select-preset">
			<div class="elementor-select-preset-title"><?php echo esc_html__( 'Select your Structure', 'elementor' ); ?></div>
			<ul class="elementor-select-preset-list">
				<#
					const structures = [ 10, 20, 30, 40, 21, 22, 31, 32, 33, 50, 34, 60 ];

					structures.forEach( ( structure ) => {
						const preset = elementor.presetsFactory.getPresetByStructure( structure ); #>

						<li class="elementor-preset elementor-column elementor-col-16" data-structure="{{ structure }}">
							{{{ elementor.presetsFactory.getPresetSVG( preset.preset ).outerHTML }}}
						</li>
					<# } ); #>
			</ul>
		</div>
		<div class="e-view e-con-select-preset">
			<div class="e-con-select-preset__title"><?php echo esc_html__( 'Select your Structure', 'elementor' ); ?></div>
			<div class="e-con-select-preset__list">
				<#
					elementor.presetsFactory.getContainerPresets().forEach( ( preset ) => {
					#>
					<div class="e-con-preset" data-preset="{{ preset }}">
						{{{ elementor.presetsFactory.generateContainerPreset( preset ) }}}
					</div>
					<#
				} );
				#>
			</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-tag-controls-stack-empty">
	<?php echo esc_html__( 'This tag has no settings.', 'elementor' ); ?>
</script>
