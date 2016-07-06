<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

?>

<script type="text/template" id="tmpl-elementor-templates-header">
	<div id="elementor-templates-header-logo-area">
		<img id="elementor-templates-header-logo-image" src="<?php echo ELEMENTOR_ASSETS_URL; ?>/images/icon.svg">
		<div id="elementor-templates-header-logo-title"><?php _e( 'Library', 'elementor' ); ?></div>
	</div>
	<div id="elementor-templates-header-menu-area">
		<div id="elementor-templates-header-menu">
			<div class="elementor-templates-menu-item">
				<span class="elementor-templates-menu-item-title"><?php _e( 'All', 'elementor' ); ?></span>
			</div>
			<div class="elementor-templates-menu-item">
				<span class="elementor-templates-menu-item-title"><?php _e( 'My Templates', 'elementor' ); ?></span>
				<i class="fa fa-chevron-down"></i>
			</div>
			<div class="elementor-templates-menu-item">
				<span class="elementor-templates-menu-item-title"><?php _e( 'Category', 'elementor' ); ?></span>
				<i class="fa fa-chevron-down"></i>
			</div>
			<div class="elementor-templates-menu-item">
				<span class="elementor-templates-menu-item-title"><?php _e( 'Page', 'elementor' ); ?></span>
				<i class="fa fa-chevron-down"></i>
			</div>
			<div class="elementor-templates-menu-item">
				<span class="elementor-templates-menu-item-title"><?php _e( 'Sort By', 'elementor' ); ?></span>
				<i class="fa fa-chevron-down"></i>
			</div>
		</div>
	</div>
	<div id="elementor-templates-header-search-area">
		<input id="elementor-templates-header-search" type="search">
		<i class="fa fa-search"></i>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-templates-loading">
	<i class="fa fa-spin fa-refresh"></i>
</script>

<script type="text/template" id="tmpl-elementor-templates-template">
	<div class="elementor-templates-template-body">
		<div class="elementor-templates-template-screenshot" style="background-image: url(<%- thumbnail %>);"></div>
		<div class="elementor-templates-template-controls">
			<div class="elementor-templates-template-name"><%= title %></div>
			<div class="elementor-templates-template-delete elementor-templates-template-control"><?php _e( 'Delete', 'elementor' ); ?></div>
			<div class="elementor-templates-template-load elementor-templates-template-control"><?php _e( 'Load', 'elementor' ); ?></div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-templates-save-template">
	<form id="elementor-templates-save-template-form">
		<input name="title" placeholder="<?php _e( 'Enter Template Name', 'elementor' ); ?>">
		<input id="elementor-templates-save-template-submit" class="elementor-button" type="submit">
	</form>
</script>
