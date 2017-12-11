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

<script type="text/template" id="tmpl-elementor-preview">
	<div class="elementor-section-wrap"></div>
</script>

<script type="text/template" id="tmpl-elementor-add-section">
	<div class="elementor-add-section-inner">
		<div class="elementor-add-section-close">
			<i class="eicon-close" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php esc_html_e( 'Close', 'elementor' ); ?></span>
		</div>
		<div class="elementor-add-new-section">
			<button class="elementor-add-section-button elementor-button"><?php _e( 'Add New Section', 'elementor' ); ?></button>
			<button class="elementor-add-template-button elementor-button"><?php _e( 'Add Template', 'elementor' ); ?></button>
			<div class="elementor-add-section-drag-title"><?php _e( 'Or drag widget here', 'elementor' ); ?></div>
		</div>
		<div class="elementor-select-preset">
			<div class="elementor-select-preset-title"><?php _e( 'Select your Structure', 'elementor' ); ?></div>
			<ul class="elementor-select-preset-list">
				<#
					var structures = [ 10, 20, 30, 40, 21, 22, 31, 32, 33, 50, 60, 34 ];

					_.each( structures, function( structure ) {
					var preset = elementor.presetsFactory.getPresetByStructure( structure ); #>

					<li class="elementor-preset elementor-column elementor-col-16" data-structure="{{ structure }}">
						{{{ elementor.presetsFactory.getPresetSVG( preset.preset ).outerHTML }}}
					</li>
					<# } ); #>
			</ul>
		</div>
	</div>
</script>
