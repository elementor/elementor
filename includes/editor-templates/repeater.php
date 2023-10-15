<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-elementor-repeater-row">
	<div class="elementor-repeater-row-tools">
		<# if ( itemActions.drag_n_drop ) {  #>
			<button class="elementor-repeater-row-handle-sortable">
				<i class="eicon-ellipsis-v" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Drag & Drop', 'elementor' ); ?></span>
			</button>
		<# } #>
		<button class="elementor-repeater-row-item-title"></button>
		<# if ( itemActions.duplicate ) {  #>
			<button class="elementor-repeater-row-tool elementor-repeater-tool-duplicate">
				<i class="eicon-copy" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Duplicate', 'elementor' ); ?></span>
			</button>
		<# }
		if ( itemActions.remove ) {  #>
			<button class="elementor-repeater-row-tool elementor-repeater-tool-remove">
				<i class="eicon-close" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Remove', 'elementor' ); ?></span>
			</button>
		<# } #>
	</div>
	<div class="elementor-repeater-row-controls"></div>
</script>
