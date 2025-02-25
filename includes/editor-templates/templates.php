<?php
namespace Elementor;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-elementor-template-library-header-actions">
	<?php if ( User::is_current_user_can_upload_json() ) { ?>
		<div id="elementor-template-library-header-import" class="elementor-templates-modal__header__item">
			<i class="eicon-upload-circle-o" aria-hidden="true" title="<?php esc_attr_e( 'Import Template', 'elementor' ); ?>"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Import Template', 'elementor' ); ?></span>
		</div>
	<?php } ?>
	<div id="elementor-template-library-header-sync" class="elementor-templates-modal__header__item">
		<i class="eicon-sync" aria-hidden="true" title="<?php esc_attr_e( 'Sync Library', 'elementor' ); ?>"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Sync Library', 'elementor' ); ?></span>
	</div>
	<div id="elementor-template-library-header-save" class="elementor-templates-modal__header__item">
		<i class="eicon-save-o" aria-hidden="true" title="<?php esc_attr_e( 'Save', 'elementor' ); ?>"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Save', 'elementor' ); ?></span>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-menu">
	<# jQuery.each( tabs, ( tab, args ) => { #>
		<div class="elementor-component-tab elementor-template-library-menu-item" data-tab="{{{ tab }}}">{{{ args.title }}}</div>
	<# } ); #>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-preview">
	<div id="elementor-template-library-header-preview-insert-wrapper" class="elementor-templates-modal__header__item">
		{{{ elementor.templates.layout.getTemplateActionButton( obj ) }}}
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-header-back">
	<i class="eicon-" aria-hidden="true"></i>
	<span><?php echo esc_html__( 'Back to Library', 'elementor' ); ?></span>
</script>

<script type="text/template" id="tmpl-elementor-template-library-loading">
	<div class="elementor-loader-wrapper">
		<div class="elementor-loader">
			<div class="elementor-loader-boxes">
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
				<div class="elementor-loader-box"></div>
			</div>
		</div>
		<div class="elementor-loading-title"><?php echo esc_html__( 'Loading', 'elementor' ); ?></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-templates">
	<#
		var activeSource = elementor.templates.getFilter('source');
		/**
		* Filter template source.
		*
		* @param bool   isRemote     - If `true` the source is a remote source.
		* @param string activeSource - The current template source.
		*/
		const isRemote = elementor.hooks.applyFilters( 'templates/source/is-remote', activeSource === 'remote', activeSource );
	#>
	<div id="elementor-template-library-toolbar">
		<# if ( isRemote ) {
			var activeType = elementor.templates.getFilter('type');
			#>
			<div id="elementor-template-library-filter-toolbar-remote" class="elementor-template-library-filter-toolbar">
				<# if ( 'page' === activeType ) { #>
					<div id="elementor-template-library-order">
						<input type="radio" id="elementor-template-library-order-new" class="elementor-template-library-order-input" name="elementor-template-library-order" value="date">
						<label for="elementor-template-library-order-new" class="elementor-template-library-order-label"><?php echo esc_html__( 'New', 'elementor' ); ?></label>
						<input type="radio" id="elementor-template-library-order-trend" class="elementor-template-library-order-input" name="elementor-template-library-order" value="trendIndex">
						<label for="elementor-template-library-order-trend" class="elementor-template-library-order-label"><?php echo esc_html__( 'Trend', 'elementor' ); ?></label>
						<input type="radio" id="elementor-template-library-order-popular" class="elementor-template-library-order-input" name="elementor-template-library-order" value="popularityIndex">
						<label for="elementor-template-library-order-popular" class="elementor-template-library-order-label"><?php echo esc_html__( 'Popular', 'elementor' ); ?></label>
					</div>
				<# } else if ( 'lb' !== activeType ) {
					var config = elementor.templates.getConfig( activeType );
					if ( config.categories ) { #>
						<div id="elementor-template-library-filter">
							<select id="elementor-template-library-filter-subtype" class="elementor-template-library-filter-select" data-elementor-filter="subtype">
								<option></option>
								<# config.categories.forEach( function( category ) {
									var selected = category === elementor.templates.getFilter( 'subtype' ) ? ' selected' : '';
									#>
									<option value="{{ category }}"{{{ selected }}}>{{{ category }}}</option>
								<# } ); #>
							</select>
						</div>
					<# }
				} #>
				<div id="elementor-template-library-my-favorites">
					<# var checked = elementor.templates.getFilter( 'favorite' ) ? ' checked' : ''; #>
					<input id="elementor-template-library-filter-my-favorites" type="checkbox"{{{ checked }}}>
					<label id="elementor-template-library-filter-my-favorites-label" for="elementor-template-library-filter-my-favorites">
						<i class="eicon" aria-hidden="true"></i>
						<?php echo esc_html__( 'My Favorites', 'elementor' ); ?>
					</label>
				</div>
			</div>
		<# } else { #>
			<div id="elementor-template-library-filter-toolbar-local" class="elementor-template-library-filter-toolbar">
			<?php if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) : ?>
				<div id="elementor-template-library-filter">
					<select id="elementor-template-library-filter-subtype" class="elementor-template-library-filter-select-source" data-elementor-filter="source">
						<option value="local" <# if ( activeSource === 'local' ) { #> selected <# } #>><?php echo esc_html__( 'Site Library', 'elementor' ); ?></option>
						<option value="cloud" <# if ( activeSource === 'cloud' ) { #> selected <# } #>><?php echo esc_html__( 'Cloud Library', 'elementor' ); ?></option>
					</select>
				</div>
			<?php endif; ?>
			</div>
		<# } #>

		<div id="elementor-template-library-filter-toolbar-side-actions">
			<?php if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) : ?>
				<# if ( 'cloud' === activeSource ) { #>
					<div id="elementor-template-library-add-new-folder" class="">
						<i class="eicon-folder" aria-hidden="true" title="Create a New Folder"></i>
						<span class="elementor-screen-only"><?php echo esc_html__( 'Create a New Folder', 'elementor' ); ?></span>
					</div>
				<# } #>
			<?php endif; ?>
			<div id="elementor-template-library-filter-text-wrapper">
				<label for="elementor-template-library-filter-text" class="elementor-screen-only"><?php echo esc_html__( 'Search Templates:', 'elementor' ); ?></label>
				<input id="elementor-template-library-filter-text" placeholder="<?php echo esc_attr__( 'Search', 'elementor' ); ?>">
				<i class="eicon-search"></i>
			</div>
		</div>
	</div>
	<# if ( 'local' === activeSource || 'cloud' === activeSource ) { #>
		<div id="elementor-template-library-order-toolbar-local">
			<div class="elementor-template-library-local-column-1">
				<input type="radio" id="elementor-template-library-order-local-title" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="title" data-default-ordering-direction="asc">
				<label for="elementor-template-library-order-local-title" class="elementor-template-library-order-label"><?php echo esc_html__( 'Name', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-2">
				<input type="radio" id="elementor-template-library-order-local-type" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="type" data-default-ordering-direction="asc">
				<label for="elementor-template-library-order-local-type" class="elementor-template-library-order-label"><?php echo esc_html__( 'Type', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-3">
				<input type="radio" id="elementor-template-library-order-local-author" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="author" data-default-ordering-direction="asc">
				<label for="elementor-template-library-order-local-author" class="elementor-template-library-order-label"><?php echo esc_html__( 'Created By', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-4">
				<input type="radio" id="elementor-template-library-order-local-date" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="date">
				<label for="elementor-template-library-order-local-date" class="elementor-template-library-order-label"><?php echo esc_html__( 'Creation Date', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-5">
				<div class="elementor-template-library-order-label"><?php echo esc_html__( 'Actions', 'elementor' ); ?></div>
			</div>
		</div>
	<# } #>
	<div id="elementor-template-library-templates-container"></div>
	<# if ( isRemote ) { #>
		<div id="elementor-template-library-footer-banner">
			<img class="elementor-nerd-box-icon" src="<?php
				Utils::print_unescaped_internal_string( ELEMENTOR_ASSETS_URL . 'images/information.svg' );
			?>" loading="lazy" alt="<?php echo esc_attr__( 'Elementor', 'elementor' ); ?>" />
			<div class="elementor-excerpt"><?php echo esc_html__( 'Stay tuned! More awesome templates coming real soon.', 'elementor' ); ?></div>
		</div>
	<# } #>
	<# if ( 'cloud' === activeSource ) { #>
		<div id="elementor-template-library-load-more-anchor" class="elementor-visibility-hidden"><i class="eicon-loading eicon-animation-spin"></i></div>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-template-library-template-remote">
	<div class="elementor-template-library-template-body">
		<?php // 'lp' stands for Landing Pages Library type. ?>
		<# if ( 'page' === type || 'lp' === type ) { #>
			<div class="elementor-template-library-template-screenshot" style="background-image: url({{ thumbnail }});"></div>
		<# } else { #>
			<img src="{{ thumbnail }}" loading="lazy">
		<# } #>
		<div class="elementor-template-library-template-preview">
			<i class="eicon-zoom-in-bold" aria-hidden="true"></i>
		</div>
	</div>
	<div class="elementor-template-library-template-footer">
		{{{ elementor.templates.layout.getTemplateActionButton( obj ) }}}
		<div class="elementor-template-library-template-name">{{{ title }}} - {{{ type }}}</div>
		<div class="elementor-template-library-favorite">
			<input id="elementor-template-library-template-{{ template_id }}-favorite-input" class="elementor-template-library-template-favorite-input" type="checkbox"{{ favorite ? " checked" : "" }}>
			<label for="elementor-template-library-template-{{ template_id }}-favorite-input" class="elementor-template-library-template-favorite-label">
				<i class="eicon-heart-o" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Favorite', 'elementor' ); ?></span>
			</label>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-template-local">
	<#
		const activeSource = elementor.templates.getFilter('source');
	#>
	<div class="elementor-template-library-template-name elementor-template-library-local-column-1">
		<# if ( 'cloud' === activeSource ) {
			const sourceIcon = 'FOLDER' === subType
				? '<i class="eicon-folder-o" aria-hidden="true"></i>'
				: '<i class="eicon-global-colors" aria-hidden="true"></i>';

				print( sourceIcon );
		} #>
		{{ title }}
	</div>
	<div class="elementor-template-library-template-meta elementor-template-library-template-type elementor-template-library-local-column-2">{{{ elementor.translate( type ) }}}</div>
	<div class="elementor-template-library-template-meta elementor-template-library-template-author elementor-template-library-local-column-3">{{{ author }}}</div>
	<div class="elementor-template-library-template-meta elementor-template-library-template-date elementor-template-library-local-column-4">{{{ human_date }}}</div>
	<div class="elementor-template-library-template-controls elementor-template-library-local-column-5">
		<div class="elementor-template-library-template-preview elementor-button e-btn-txt">
		<#
			const actionText = typeof subType === 'undefined' || 'FOLDER' !== subType
				? '<?php echo esc_html__( 'Preview', 'elementor' ); ?>'
				: '<?php echo esc_html__( 'Open', 'elementor' ); ?>';
		#>
			<i class="eicon-preview-medium" aria-hidden="true"></i>
			<span class="elementor-template-library-template-control-title">{{{ actionText }}}</span>
		</div>
		<# if ( typeof subType === 'undefined' || 'FOLDER' !== subType ) { #>
		<button class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button e-primary e-btn-txt">
			<i class="eicon-file-download" aria-hidden="true"></i>
			<span class="elementor-button-title"><?php echo esc_html__( 'Insert', 'elementor' ); ?></span>
		</button>
		<# } #>
		<div class="elementor-template-library-template-more-toggle">
			<i class="eicon-ellipsis-h" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More actions', 'elementor' ); ?></span>
		</div>
		<div class="elementor-template-library-template-more">
			<div class="elementor-template-library-template-export">
				<a href="{{ export_link }}">
					<i class="eicon-sign-out" aria-hidden="true"></i>
					<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Export', 'elementor' ); ?></span>
				</a>
			</div>
			<?php if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) : ?>
				<div class="elementor-template-library-template-rename">
					<i class="eicon-pencil" aria-hidden="true"></i>
					<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Rename', 'elementor' ); ?></span>
				</div>
			<?php endif; ?>
			<div class="elementor-template-library-template-delete">
				<i class="eicon-trash-o" aria-hidden="true"></i>
				<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Delete', 'elementor' ); ?></span>
			</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-insert-button">
	<a class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button e-primary">
		<i class="eicon-file-download" aria-hidden="true"></i>
		<span class="elementor-button-title"><?php echo esc_html__( 'Insert', 'elementor' ); ?></span>
	</a>
</script>

<script type="text/template" id="tmpl-elementor-template-library-apply-ai-button">
	<a class="elementor-template-library-template-action elementor-template-library-template-apply-ai elementor-button e-primary">
		<i class="eicon-file-download" aria-hidden="true"></i>
		<span class="elementor-button-title"><?php echo esc_html__( 'Apply', 'elementor' ); ?></span>
	</a>
</script>

<script type="text/template" id="tmpl-elementor-template-library-insert-and-ai-variations-buttons">
	<a class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button e-primary">
		<i class="eicon-file-download" aria-hidden="true"></i>
		<span class="elementor-button-title"><?php echo esc_html__( 'Insert', 'elementor' ); ?></span>
	</a>
	<a class="elementor-template-library-template-action elementor-template-library-template-generate-variation elementor-button e-btn-txt e-btn-txt-border">
		<i class="eicon-ai" aria-hidden="true"></i>
		<span class="elementor-button-title"><?php echo esc_html__( 'Generate Variations', 'elementor' ); ?></span>
	</a>
</script>

<script type="text/template" id="tmpl-elementor-template-library-upgrade-plan-button">
	<a
		class="elementor-template-library-template-action elementor-button go-pro"
		href="{{{ promotionLink }}}"
		target="_blank"
	>
		<span class="elementor-button-title">{{{ promotionText }}}</span>
	</a>
</script>

<script type="text/template" id="tmpl-elementor-template-library-save-template">
	<div class="elementor-template-library-blank-icon">
		<i class="eicon-library-upload" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Save', 'elementor' ); ?></span>
	</div>
	<div class="elementor-template-library-blank-title">{{{ title }}}</div>
	<div class="elementor-template-library-blank-message">{{{ description }}}</div>
	<form id="elementor-template-library-save-template-form">
		<input type="hidden" name="post_id" value="<?php echo esc_attr( get_the_ID() ); ?>">
		<?php if ( ! Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) : ?>
		<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php echo esc_attr__( 'Enter Template Name', 'elementor' ); ?>" required>
		<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary">
			<span class="elementor-state-icon">
				<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
			</span>
			<?php echo esc_html__( 'Save', 'elementor' ); ?>
		</button>
		<?php else : ?>
		<div class="cloud-library-form-inputs">
			<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php echo esc_attr__( 'Enter Template Name', 'elementor' ); ?>" required>
			<select name="source[]" id="elementor-template-library-save-template-source" multiple="multiple" required>
				<option value="local">Site Library</option>
				<option value="cloud">Cloud Library</option>
			</select>
			<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<?php echo esc_html__( 'Save', 'elementor' ); ?>
			</button>
		</div>
		<?php endif; ?>
	</form>
	<div class="elementor-template-library-blank-footer">
		<?php echo esc_html__( 'Want to learn more about the Elementor library?', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Click here', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-import">
	<form id="elementor-template-library-import-form">
		<div class="elementor-template-library-blank-icon">
			<i class="eicon-library-upload" aria-hidden="true"></i>
		</div>
		<div class="elementor-template-library-blank-title"><?php echo esc_html__( 'Import Template to Your Library', 'elementor' ); ?></div>
		<div class="elementor-template-library-blank-message"><?php echo esc_html__( 'Drag & drop your .JSON or .zip template file', 'elementor' ); ?></div>
		<div id="elementor-template-library-import-form-or"><?php echo esc_html__( 'or', 'elementor' ); ?></div>
		<label for="elementor-template-library-import-form-input" id="elementor-template-library-import-form-label" class="elementor-button e-primary"><?php echo esc_html__( 'Select File', 'elementor' ); ?></label>
		<input id="elementor-template-library-import-form-input" type="file" name="file" accept=".json,.zip" required/>
		<div class="elementor-template-library-blank-footer">
			<?php echo esc_html__( 'Want to learn more about the Elementor library?', 'elementor' ); ?>
			<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Click here', 'elementor' ); ?></a>
		</div>
	</form>
</script>

<script type="text/template" id="tmpl-elementor-template-library-templates-empty">
	<div class="elementor-template-library-blank-icon">
		<img src="" class="elementor-template-library-no-results" loading="lazy" />
	</div>
	<div class="elementor-template-library-blank-title"></div>
	<div class="elementor-template-library-blank-message"></div>

	<div class="elementor-template-library-cloud-empty__button"></div>

	<div class="elementor-template-library-blank-footer">
		<?php echo esc_html__( 'Want to learn more about the Elementor library?', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Click here', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-preview">
	<iframe></iframe>
</script>

<script type="text/template" id="tmpl-elementor-template-library-connect">
	<div id="elementor-template-library-connect-logo" class="e-logo-wrapper">
		<i class="eicon-elementor" aria-hidden="true"></i>
	</div>
	<div class="elementor-template-library-blank-title">
		{{{ title }}}
	</div>
	<div class="elementor-template-library-blank-message">
		{{{ message }}}
	</div>
		<?php
		$url = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' )->get_admin_url( 'authorize', [
			'utm_source' => 'template-library',
			'utm_medium' => 'wp-dash',
			'utm_campaign' => 'library-connect',
			'utm_content' => '%%template_type%%', // will be replaced in the frontend
		] );
		?>
	<a id="elementor-template-library-connect__button" class="elementor-button e-primary" href="<?php echo esc_url( $url ); ?>">
		{{{ button }}}
	</a>
	<?php
	$base_images_url = $this->get_assets_base_url() . '/assets/images/library-connect/';

	$images = [ 'left-1', 'left-2', 'right-1', 'right-2' ];

	foreach ( $images as $image ) : ?>
		<img id="elementor-template-library-connect__background-image-<?php Utils::print_unescaped_internal_string( $image ); ?>" class="elementor-template-library-connect__background-image" src="<?php Utils::print_unescaped_internal_string( $base_images_url . $image ); ?>.png" draggable="false" loading="lazy" />
	<?php endforeach; ?>
</script>

<script type="text/template" id="tmpl-elementor-template-library-connect-cloud">
	<#
		const activeSource = elementor.templates.getFilter( 'source' );
	#>
	<div id="elementor-template-library-filter-toolbar-local" class="elementor-template-library-filter-toolbar" style="padding-block-end:80px;">
		<div id="elementor-template-library-filter">
			<select id="elementor-template-library-filter-subtype" class="elementor-template-library-filter-select-source" data-elementor-filter="source">
				<option value="local" <# if ( activeSource === 'local' ) { #> selected <# } #>><?php echo esc_html__( 'Site Library', 'elementor' ); ?></option>
				<option value="cloud" <# if ( activeSource === 'cloud' ) { #> selected <# } #>><?php echo esc_html__( 'Cloud Library', 'elementor' ); ?></option>
			</select>
		</div>
	</div>
	<div class="elementor-template-library-blank-icon">
	<svg width="105" height="104" viewBox="0 0 105 104" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M58.368 19.6924C52.3939 18.6062 46.1946 19.7043 41.1427 22.7227C36.0944 25.739 32.6315 30.406 31.4518 35.6618C31.298 36.3466 30.69 36.8333 29.9882 36.8333C24.9582 36.8333 20.147 38.7451 16.6097 42.1286C13.0747 45.51 11.1018 50.0814 11.1018 54.8333C11.1018 59.5851 13.0747 64.1566 16.6097 67.5379C20.147 70.9214 24.9582 72.8333 29.9882 72.8333H39.8075C39.7411 72.2636 39.712 71.6889 39.7208 71.1129V64.1455C39.7208 63.7477 39.8788 63.3661 40.1601 63.0848C40.4414 62.8035 40.823 62.6455 41.2208 62.6455H44.3738V54.8396C44.3738 54.0112 45.0453 53.3396 45.8738 53.3396C46.7022 53.3396 47.3738 54.0112 47.3738 54.8396V62.6455H58.3321V54.8396C58.3321 54.0112 59.0036 53.3396 59.8321 53.3396C60.6605 53.3396 61.3321 54.0112 61.3321 54.8396V62.6455H64.4849C65.3133 62.6455 65.9849 63.3171 65.9849 64.1455V71.1129C65.9937 71.6889 65.9646 72.2635 65.8982 72.8333H81.9882C85.6128 72.8333 89.089 71.3934 91.652 68.8304C94.215 66.2674 95.6548 62.7912 95.6548 59.1666C95.6548 55.542 94.215 52.0658 91.652 49.5028C89.089 46.9398 85.6128 45.4999 81.9882 45.4999H77.6548C77.1993 45.4999 76.7684 45.2929 76.4838 44.9373C76.1991 44.5816 76.0915 44.1159 76.1913 43.6714C77.3697 38.4214 76.1892 32.9513 72.8717 28.4537C69.5486 23.9486 64.3415 20.7785 58.368 19.6924ZM29.9882 75.8333H40.5214C40.5654 75.9532 40.6112 76.0727 40.6587 76.1915C41.3059 77.8095 42.2687 79.2825 43.4909 80.5247C44.7131 81.767 46.1703 82.7535 47.7776 83.427C48.8599 83.8804 49.9956 84.1858 51.1541 84.3369V94.5872C51.1541 95.4156 51.8257 96.0872 52.6541 96.0872C53.4825 96.0872 54.1541 95.4156 54.1541 94.5872V84.3826C55.4502 84.2535 56.7223 83.9321 57.928 83.4269C59.5353 82.7535 60.9925 81.767 62.2148 80.5247C63.437 79.2825 64.3997 77.8095 65.047 76.1915C65.0945 76.0727 65.1403 75.9532 65.1842 75.8333H81.9882C86.4084 75.8333 90.6477 74.0773 93.7733 70.9517C96.8989 67.8261 98.6548 63.5869 98.6548 59.1666C98.6548 54.7463 96.8989 50.5071 93.7733 47.3815C90.6477 44.2559 86.4084 42.4999 81.9882 42.4999H79.4463C80.1939 36.9518 78.7233 31.3328 75.2859 26.6729C71.4757 21.5073 65.5732 17.9532 58.9047 16.7408C52.2368 15.5284 45.2973 16.7458 39.604 20.1473C34.2642 23.3378 30.4078 28.2221 28.8137 33.8635C23.4564 34.1396 18.3661 36.2971 14.536 39.9607C10.4246 43.8933 8.10181 49.2417 8.10181 54.8333C8.10181 60.4249 10.4246 65.7732 14.536 69.7058C18.6451 73.6362 24.2045 75.8333 29.9882 75.8333ZM42.7208 65.6455V71.1247L42.7206 71.1491C42.6988 72.4935 42.9447 73.8288 43.4441 75.0773C43.9435 76.3257 44.6863 77.4623 45.6294 78.4207C46.5724 79.3792 47.6968 80.1404 48.9369 80.66C50.1771 81.1796 51.5082 81.4472 52.8528 81.4472C54.1974 81.4472 55.5286 81.1796 56.7687 80.66C58.0089 80.1404 59.1333 79.3792 60.0763 78.4207C61.0193 77.4623 61.7622 76.3257 62.2616 75.0773C62.761 73.8288 63.0069 72.4935 62.9851 71.1491L62.9849 71.1247V65.6455H42.7208Z" fill="var(--e-a-color-txt)"/>
	</svg>

	</div>
	<div class="elementor-template-library-blank-title">{{{ elementorAppConfig?.['cloud-library']?.library_connect_title }}}</div>
	<div class="elementor-template-library-blank-message">{{{ elementorAppConfig?.['cloud-library']?.library_connect_sub_title }}}</div>

	<div class="elementor-template-library-cloud-empty__button">
		<a class="elementor-button e-primary" href="{{{ elementorAppConfig?.['cloud-library']?.library_connect_url }}}" target="_blank">{{{ elementorAppConfig?.['cloud-library']?.library_connect_button_text }}}</a>
	</div>
</script>
