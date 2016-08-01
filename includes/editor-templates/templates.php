<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<script type="text/template" id="tmpl-elementor-templates-header">
	<div id="elementor-templates-header-logo-area"></div>
	<div id="elementor-templates-header-menu-area"></div>
	<div id="elementor-templates-header-items-area">
		<div id="elementor-templates-header-close-modal" class="elementor-templates-header-item" title="<?php _e( 'Close', 'elementor' ); ?>">
			<i class="fa fa-times"></i>
		</div>
		<div id="elementor-templates-header-tools"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-templates-header-logo">
	<i class="eicon-elementor-square"></i><?php _e( 'Library', 'elementor' ); ?>
</script>

<script type="text/template" id="tmpl-elementor-templates-header-settings">
	<i class="fa fa-cog" title="<?php _e( 'Settings', 'elementor' ); ?>"></i>
</script>

<script type="text/template" id="tmpl-elementor-templates-header-menu">
	<div id="elementor-templates-menu-pre-made-templates" class="elementor-templates-menu-item"><?php _e( 'Pre Made Templates', 'elementor' ); ?></div>
	<div id="elementor-templates-menu-my-templates" class="elementor-templates-menu-item elementor-active"><?php _e( 'My Templates', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-templates-header-preview">
	<div id="elementor-templates-header-preview-insert-wrapper" class="elementor-templates-header-item">
		<button id="elementor-templates-header-preview-insert" class="elementor-templates-template-insert elementor-button elementor-button-success">
			<i class="fa fa-download"></i>
			<?php _e( 'Insert', 'elementor' ); ?>
		</button>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-templates-header-back">
	<span id="elementor-templates-header-preview-back"><?php _e( 'Back To library', 'elementor' ); ?></span>
</script>

<script type="text/template" id="tmpl-elementor-templates-loading">
	<i class="fa fa-spin fa-refresh"></i>
</script>

<script type="text/template" id="tmpl-elementor-templates-template">
	<div class="elementor-templates-template-body">
		<div class="elementor-templates-template-screenshot" style="background-image: url(<%- thumbnail %>);"></div>
		<div class="elementor-templates-template-controls">
			<div class="elementor-templates-template-preview">
				<i class="fa fa-search-plus"></i>
			</div>
			<button class="elementor-templates-template-insert elementor-button elementor-button-success">
				<i class="fa fa-download"></i>
				<?php _e( 'Insert', 'elementor' ); ?>
			</button>
		</div>
	</div>
	<div class="elementor-templates-template-name"><%= title %></div>
</script>

<script type="text/template" id="tmpl-elementor-templates-save-template">
	<form id="elementor-templates-save-template-form">
		<input name="title" placeholder="<?php _e( 'Enter Template Name', 'elementor' ); ?>">
		<input id="elementor-templates-save-template-submit" class="elementor-button" type="submit">
	</form>
</script>

<script type="text/template" id="tmpl-elementor-templates-import">
	<form id="elementor-templates-import-form">
		<input type="file" name="file" />
		<input type="submit">
	</form>
</script>
