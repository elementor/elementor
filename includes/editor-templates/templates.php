<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<script type="text/template" id="tmpl-elementor-template-library-header">
	<div id="elementor-template-library-header-logo-area"></div>
	<div id="elementor-template-library-header-menu-area"></div>
	<div id="elementor-template-library-header-items-area">
		<div id="elementor-template-library-header-close-modal" class="elementor-template-library-header-item" title="<?php _e( 'Close', 'elementor' ); ?>">
			<i class="fa fa-times"></i>
		</div>
		<div id="elementor-template-library-header-tools"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-logo">
	<i class="eicon-elementor-square"></i><?php _e( 'Library', 'elementor' ); ?>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-settings">
	<i class="fa fa-cog" title="<?php _e( 'Settings', 'elementor' ); ?>"></i>
	<ul id="elementor-template-library-header-settings-menu">
		<li class="elementor-template-library-header-settings-menu-item">
			<a href="<?php echo admin_url( 'edit.php?post_type=' . TemplateLibrary\Type_Local::CPT );  ?>" target="_blank"><i class="fa fa-external-link"></i> <?php _e( 'Library Manager', 'elementor' ); ?></a>
		</li>
		<li id="elementor-template-library-header-settings-save" class="elementor-template-library-header-settings-menu-item">
			<a><i class="fa fa-floppy-o"></i> <?php _e( 'Save Template', 'elementor' ); ?></a>
		</li>
	</ul>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-menu">
	<div id="elementor-template-library-menu-pre-made-templates" class="elementor-template-library-menu-item" data-template-type="remote"><?php _e( 'Templates', 'elementor' ); ?></div>
	<div id="elementor-template-library-menu-my-templates" class="elementor-template-library-menu-item" data-template-type="local"><?php _e( 'My Templates', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-preview">
	<div id="elementor-template-library-header-preview-insert-wrapper" class="elementor-template-library-header-item">
		<button id="elementor-template-library-header-preview-insert" class="elementor-template-library-template-insert elementor-button elementor-button-success">
			<i class="fa fa-download"></i>
			<?php _e( 'Insert', 'elementor' ); ?>
		</button>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-back">
	<span id="elementor-template-library-header-preview-back">
		<i class="fa"></i><?php _e( 'Back To library', 'elementor' ); ?>
	</span>
</script>

<script type="text/template" id="tmpl-elementor-template-library-loading">
	<i class="fa fa-spin fa-refresh"></i>
</script>

<script type="text/template" id="tmpl-elementor-template-library-template">
	<div class="elementor-template-library-template-body">
		<div class="elementor-template-library-template-screenshot" style="background-image: url(<%- thumbnail %>);"></div>
		<div class="elementor-template-library-template-controls">
			<div class="elementor-template-library-template-preview">
				<i class="fa fa-search-plus"></i>
			</div>
			<button class="elementor-template-library-template-insert elementor-button elementor-button-success">
				<i class="fa fa-download"></i>
				<?php _e( 'Insert', 'elementor' ); ?>
			</button>
		</div>
	</div>
	<div class="elementor-template-library-template-name"><%= title %></div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-save-template">
	<div id="elementor-template-library-save-template-title"><%= elementor.translate( 'save_your_template', [ elementor.translate( sectionID ? 'section' : 'page' ) ] ) %></div>
	<div id="elementor-template-library-save-template-excerpt"><?php _e( 'Save and reuse your page designs with the Elementor Library', 'elementor' ); ?></div>
	<form id="elementor-template-library-save-template-form">
		<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php _e( 'Enter Template Name', 'elementor' ); ?>">
		<input id="elementor-template-library-save-template-submit" class="elementor-button elementor-button-success" type="submit" value="<?php _e( 'Save', 'elementor' ); ?>">
	</form>
	<div id="elementor-template-library-save-template-footer"><?php _e( 'Learn how to use the Elementor Library in our tutorial section.', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-import">
	<form id="elementor-template-library-import-form">
		<input type="file" name="file" />
		<input type="submit">
	</form>
</script>
