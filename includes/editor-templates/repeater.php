<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-elementor-repeater-row">
	<div class="elementor-repeater-row-tools">
		<div class="elementor-repeater-row-handle-sortable">
			<i class="fa fa-ellipsis-v" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php esc_html_e( 'Drag & Drop', 'elementor' ); ?></span>
		</div>
		<div class="elementor-repeater-row-item-title"></div>
		<div class="elementor-repeater-row-tool elementor-repeater-tool-duplicate">
			<i class="fa fa-copy" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php esc_html_e( 'Duplicate', 'elementor' ); ?></span>
		</div>
		<div class="elementor-repeater-row-tool elementor-repeater-tool-remove">
			<i class="fa fa-remove" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php esc_html_e( 'Remove', 'elementor' ); ?></span>
		</div>
	</div>
	<div class="elementor-repeater-row-controls"></div>
</script>
