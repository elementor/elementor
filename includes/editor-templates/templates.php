<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<script type="text/template" id="tmpl-elementor-template-library-header">
	<div id="elementor-template-library-header-logo-area"></div>
	<div id="elementor-template-library-header-menu-area"></div>
	<div id="elementor-template-library-header-items-area">
		<div id="elementor-template-library-header-close-modal" class="elementor-template-library-header-item" title="<?php _e( 'Close', 'elementor' ); ?>">
			<i class="eicon-close" title="<?php _e( 'Close', 'elementor' ); ?>"></i>
		</div>
		<div id="elementor-template-library-header-tools"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-logo">
	<i class="eicon-elementor-square"></i><span><?php _e( 'Library', 'elementor' ); ?></span>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-save">
	<i class="eicon-save" title="<?php _e( 'Save Template', 'elementor' ); ?>"></i>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-menu">
	<div id="elementor-template-library-menu-pre-made-templates" class="elementor-template-library-menu-item" data-template-source="remote"><?php _e( 'Predesigned Templates', 'elementor' ); ?></div>
	<div id="elementor-template-library-menu-my-templates" class="elementor-template-library-menu-item" data-template-source="local"><?php _e( 'My Templates', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-preview">
	<div id="elementor-template-library-header-preview-insert-wrapper" class="elementor-template-library-header-item">
		{{{ elementor.templates.getLayout().getTemplateActionButton( obj ) }}}
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-back">
	<i class="eicon-"></i><span><?php _e( 'Back To library', 'elementor' ); ?></span>
</script>

<script type="text/template" id="tmpl-elementor-template-library-loading">
	<div class="elementor-loader-wrapper">
		<div class="elementor-loader">
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
		</div>
		<div class="elementor-loading-title"><?php _e( 'Loading', 'elementor' ) ?></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-templates">
	<div id="elementor-template-library-templates-container"></div>
	<div id="elementor-template-library-footer-banner">
		<i class="eicon-nerd"></i>
		<div class="elementor-excerpt"><?php echo __( 'Stay tuned! More awesome templates coming real soon.', 'elementor' ); ?></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-template-remote">
	<div class="elementor-template-library-template-body">
		<div class="elementor-template-library-template-screenshot" style="background-image: url({{ thumbnail }});"></div>
		<div class="elementor-template-library-template-controls">
			<div class="elementor-template-library-template-preview">
				<i class="fa fa-search-plus"></i>
			</div>
			{{{ elementor.templates.getLayout().getTemplateActionButton( obj ) }}}
		</div>
	</div>
	<div class="elementor-template-library-template-name">{{{ title }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-insert-button">
	<button class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button elementor-button-success">
		<i class="eicon-file-download"></i><span class="elementor-button-title"><?php _e( 'Insert', 'elementor' ); ?></span>
	</button>
</script>

<script type="text/template" id="tmpl-elementor-template-library-get-pro-button">
	<a href="https://go.elementor.com/pro-library/" target="_blank">
		<button class="elementor-template-library-template-action elementor-button elementor-button-go-pro">
			<i class="fa fa-external-link-square"></i><span class="elementor-button-title"><?php _e( 'Go Pro', 'elementor' ); ?></span>
		</button>
	</a>
</script>

<script type="text/template" id="tmpl-elementor-template-library-template-local">
	<div class="elementor-template-library-template-icon">
		<i class="fa fa-{{ 'section' === type ? 'columns' : 'file-text-o' }}"></i>
	</div>
	<div class="elementor-template-library-template-name">{{{ title }}}</div>
	<div class="elementor-template-library-template-type">{{{ elementor.translate( type ) }}}</div>
	<div class="elementor-template-library-template-controls">
		<button class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button elementor-button-success">
			<i class="eicon-file-download"></i><span class="elementor-button-title"><?php _e( 'Insert', 'elementor' ); ?></span>
		</button>
		<div class="elementor-template-library-template-export">
			<a href="{{ export_link }}">
				<i class="fa fa-sign-out"></i><span class="elementor-template-library-template-control-title"><?php echo __( 'Export', 'elementor' ); ?></span>
			</a>
		</div>
		<div class="elementor-template-library-template-delete">
			<i class="fa fa-trash-o"></i><span class="elementor-template-library-template-control-title"><?php echo __( 'Delete', 'elementor' ); ?></span>
		</div>
		<div class="elementor-template-library-template-preview">
			<i class="eicon-zoom-in"></i><span class="elementor-template-library-template-control-title"><?php echo __( 'Preview', 'elementor' ); ?></span>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-save-template">
	<div class="elementor-template-library-blank-title">{{{ title }}}</div>
	<div class="elementor-template-library-blank-excerpt">{{{ description }}}</div>
	<form id="elementor-template-library-save-template-form">
		<input type="hidden" name="post_id" value="<?php echo get_the_ID(); ?>">
		<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php _e( 'Enter Template Name', 'elementor' ); ?>" required>
		<button id="elementor-template-library-save-template-submit" class="elementor-button elementor-button-success">
			<span class="elementor-state-icon">
				<i class="fa fa-spin fa-circle-o-notch "></i>
			</span>
			<?php _e( 'Save', 'elementor' ); ?>
		</button>
	</form>
	<div class="elementor-template-library-blank-footer">
		<?php _e( 'What is Library?', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php _e( 'Read our tutorial on using Library templates.', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-import">
	<form id="elementor-template-library-import-form">
		<input type="file" name="file" />
		<input type="submit">
	</form>
</script>

<script type="text/template" id="tmpl-elementor-template-library-templates-empty">
	<div id="elementor-template-library-templates-empty-icon">
		<i class="eicon-nerd"></i>
	</div>
	<div class="elementor-template-library-blank-title"><?php _e( 'Haven’t Saved Templates Yet?', 'elementor' ); ?></div>
	<div class="elementor-template-library-blank-excerpt"><?php _e( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ); ?></div>
	<div class="elementor-template-library-blank-footer">
		<?php _e( 'What is Library?', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php _e( 'Read our tutorial on using Library templates.', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-preview">
	<iframe></iframe>
</script>
