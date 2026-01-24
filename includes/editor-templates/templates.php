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
			<i class="eicon-upload-circle-o" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Import Template', 'elementor' ); ?></span>
		</div>
	<?php } ?>
	<div id="elementor-template-library-header-sync" class="elementor-templates-modal__header__item">
		<i class="eicon-sync" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Sync Library', 'elementor' ); ?></span>
	</div>
	<div id="elementor-template-library-header-save" class="elementor-templates-modal__header__item">
		<i class="eicon-save-o" aria-hidden="true"></i>
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
	<i class="eicon-chevron-left" aria-hidden="true"></i>
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
				<div id="elementor-template-library-filter">
					<div class="elementor-template-library-filter-select-source">
						<div class="source-option<# if ( activeSource === 'local' ) { #> selected<# } #>" data-source="local">
							<i class="eicon-header" aria-hidden="true"></i>
							<?php echo esc_html__( 'Site templates', 'elementor' ); ?>
						</div>
						<div class="source-option<# if ( activeSource === 'cloud' ) { #> selected<# } #>" data-source="cloud">
							<i class="eicon-library-cloud-empty" aria-hidden="true"></i>
							<?php echo esc_html__( 'Cloud templates', 'elementor' ); ?>
							<#
								const tabIcon = elementor.templates.hasCloudLibraryQuota()
									? '<span class="new-badge"><?php echo esc_html__( 'New', 'elementor' ); ?></span>'
									: '<span class="new-badge"><i class="eicon-upgrade-crown" style="margin-inline-end: 0;"></i> <?php echo esc_html__( 'Pro', 'elementor' ); ?></span>';

								print( tabIcon );
							#>
						</div>
					</div>
				</div>
			</div>
			<span class="source-option-badge site-badge variant-b-only" style="display: none;">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
					<path d="M7.33301 9.5C8.17286 9.5 8.9784 9.83387 9.57227 10.4277C10.1661 11.0216 10.5 11.8271 10.5 12.667V14C10.5 14.2761 10.2761 14.5 10 14.5H2C1.72386 14.5 1.5 14.2761 1.5 14V12.667C1.5 11.8271 1.83387 11.0216 2.42773 10.4277C3.0216 9.83387 3.82714 9.5 4.66699 9.5H7.33301ZM11.833 9.5C12.6729 9.5 13.4784 9.83387 14.0723 10.4277C14.6661 11.0216 15 11.8271 15 12.667V14C15 14.2761 14.7761 14.5 14.5 14.5H11.5C11.7761 14.5 12 14.2761 12 14V12.667C12 11.8271 11.6661 11.0216 11.0723 10.4277C10.5178 9.87327 9.77915 9.54493 9 9.50391C9.05536 9.50099 9.11128 9.5 9.16699 9.5H11.833ZM6 1.5C6.83985 1.5 7.64539 1.83387 8.23926 2.42773C8.83302 3.02158 9.16699 3.82722 9.16699 4.66699C9.16691 5.50673 8.83305 6.31246 8.23926 6.90625C7.64541 7.50001 6.83978 7.83301 6 7.83301C5.16022 7.83301 4.35459 7.50001 3.76074 6.90625C3.16695 6.31246 2.83309 5.50673 2.83301 4.66699C2.83301 3.82722 3.16698 3.02158 3.76074 2.42773C4.35461 1.83387 5.16015 1.5 6 1.5ZM11 1.5C12.6569 1.5 14 2.84315 14 4.5C14 6.15685 12.6569 7.5 11 7.5C10.4529 7.5 9.94164 7.35059 9.5 7.09473C10.3958 6.57577 11 5.60972 11 4.5C11 3.3901 10.396 2.42319 9.5 1.9043C9.94155 1.64858 10.453 1.5 11 1.5Z" fill="#B15211" />
				</svg>
				<?php echo esc_html__( 'Anyone on this site', 'elementor' ); ?>
			</span>
			<span class="source-option-badge cloud-badge variant-b-only" style="display: none;">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M7.83317 2.33331C7.25853 2.33331 6.70743 2.56159 6.30111 2.96791C5.89478 3.37424 5.6665 3.92534 5.6665 4.49998V6.66665H9.99984V4.49998C9.99984 3.92534 9.77156 3.37424 9.36524 2.96791C8.95891 2.56159 8.40781 2.33331 7.83317 2.33331ZM10.9998 6.66665V4.49998C10.9998 3.66013 10.6662 2.85467 10.0723 2.26081C9.47848 1.66694 8.67302 1.33331 7.83317 1.33331C6.99332 1.33331 6.18786 1.66694 5.594 2.26081C5.00013 2.85467 4.6665 3.66013 4.6665 4.49998V6.66665H4.49984C4.01361 6.66665 3.54729 6.8598 3.20347 7.20362C2.85966 7.54743 2.6665 8.01375 2.6665 8.49998V12.5C2.6665 12.9862 2.85966 13.4525 3.20347 13.7963C3.54729 14.1402 4.01361 14.3333 4.49984 14.3333H11.1665C11.6527 14.3333 12.119 14.1402 12.4629 13.7963C12.8067 13.4525 12.9998 12.9862 12.9998 12.5V8.49998C12.9998 8.01375 12.8067 7.54743 12.4629 7.20362C12.119 6.8598 11.6527 6.66665 11.1665 6.66665H10.9998Z" fill="#1945A4" />
				</svg>
				<?php echo esc_html__( 'My Elementor account', 'elementor' ); ?>
			</span>
		<# } #>

		<div class="elementor-template-library-filter-toolbar-side-actions">
				<# if ( 'cloud' === activeSource ) { #>
					<div id="elementor-template-library-add-new-folder" class="elementor-template-library-action-item">
						<i class="eicon-folder-plus" aria-hidden="true"></i>
						<span class="elementor-screen-only"><?php echo esc_html__( 'Create a New Folder', 'elementor' ); ?></span>
					</div>
					<span class="divider"></span>
					<div id="elementor-template-library-view-grid" class="elementor-template-library-action-item">
						<i class="eicon-library-grid" aria-hidden="true"></i>
						<span class="elementor-screen-only"><?php echo esc_html__( 'Grid view', 'elementor' ); ?></span>
					</div>
					<div id="elementor-template-library-view-list" class="elementor-template-library-action-item">
						<i class="eicon-library-list" aria-hidden="true"></i>
						<span class="elementor-screen-only"><?php echo esc_html__( 'List view', 'elementor' ); ?></span>
					</div>
				<# } #>
			<div id="elementor-template-library-filter-text-wrapper">
				<label for="elementor-template-library-filter-text" class="elementor-screen-only"><?php echo esc_html__( 'Search Templates:', 'elementor' ); ?></label>
				<input id="elementor-template-library-filter-text" placeholder="<?php echo esc_attr__( 'Search', 'elementor' ); ?>">
				<i class="eicon-search"></i>
			</div>
		</div>
	</div>
	<# if ( 'local' === activeSource || 'cloud' === activeSource ) { #>
		<div class="toolbar-container">
				<div class="bulk-selection-action-bar">
					<span class="clear-bulk-selections"><i class="eicon-editor-close"></i></span>
					<span class="selected-count"></span>
					<# if ( elementor.templates.hasCloudLibraryQuota() && ! elementor.templates.cloudLibraryIsDeactivated() ) { #>
					<span class="bulk-copy"><i class="eicon-library-copy" aria-hidden="true" title="<?php esc_attr_e( 'Copy', 'elementor' ); ?>"></i></span>
					<span class="bulk-move"><i class="eicon-library-move"  aria-hidden="true" title="<?php esc_attr_e( 'Move', 'elementor' ); ?>"></i></span>
					<# } #>
					<span class="bulk-delete"><i class="eicon-library-delete" aria-hidden="true" title="<?php esc_attr_e( 'Delete', 'elementor' ); ?>"></i></span>
				</div>
			<div id="elementor-template-library-navigation-container"></div>

			<# if ( 'cloud' === activeSource ) { #>
				<div class="quota-progress-container">
					<span class="quota-progress-info">
						<?php echo esc_html__( 'Usage', 'elementor' ); ?>
					</span>
					<div class="progress-bar-container">
						<div class="quota-progress-bar quota-progress-bar-normal">
							<div class="quota-progress-bar-fill"></div>
						</div>
						<span class="quota-warning"></span>
					</div>
					<div class="quota-progress-bar-value"></div>
				</div>
			<# } #>
		</div>
		<div id="elementor-template-library-order-toolbar-local">
			<div class="elementor-template-library-local-column-1">
				<input type="checkbox" id="bulk-select-all">
				<input type="radio" id="elementor-template-library-order-local-title" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="title" data-default-ordering-direction="asc">
				<label for="elementor-template-library-order-local-title" class="elementor-template-library-order-label"><?php echo esc_html__( 'Name', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-2">
				<input type="radio" id="elementor-template-library-order-local-type" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="type" data-default-ordering-direction="asc">
				<label for="elementor-template-library-order-local-type" class="elementor-template-library-order-label"><?php echo esc_html__( 'Type', 'elementor' ); ?></label>
			</div>
			<div class="elementor-template-library-local-column-3">
				<# if ( 'cloud' !== activeSource ) { #>
					<input type="radio" id="elementor-template-library-order-local-author" class="elementor-template-library-order-input" name="elementor-template-library-order-local" value="author" data-default-ordering-direction="asc">
				<# } #>
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

<script type="text/template" id="tmpl-elementor-template-library-navigation-container">
	<button class="elementor-template-library-navigation-back-button elementor-button e-button">
		<i class="eicon-chevron-left"></i>
		<?php echo esc_html__( 'Back', 'elementor' ); ?>
	</button>
	<span class="elementor-template-library-current-folder-title"></span>
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
		const view = elementor.templates.getFilter('view') ?? elementor.templates.getViewSelection() ?? 'list';

		if ( ( 'cloud' === activeSource && view === 'list' ) || 'local' === activeSource ) {
	#>
		<div class="elementor-template-library-template-name elementor-template-library-local-column-1">
			<input type="checkbox" class="bulk-selection-item-checkbox" data-template_id="{{ template_id }}" data-type="{{ type }}" data-status="{{ status }}">
			<# if ( 'cloud' === activeSource ) {
				const sourceIcon = typeof subType !== 'undefined' && 'FOLDER' === subType
					? '<i class="eicon-library-folder" aria-hidden="true"></i>'
					: 'locked' === status
						? '<i class="eicon-lock-outline" aria-hidden="true" title="<?php esc_attr_e( 'Upgrade to get more storage space or delete old templates to make room.', 'elementor' ); ?>"></i>'
						: '<i class="eicon-global-colors" aria-hidden="true"></i>';

					print( sourceIcon );
			} #>
			<span>{{ title }}</span>
		</div>
		<div class="elementor-template-library-template-meta elementor-template-library-template-type elementor-template-library-local-column-2">{{{ elementor.translate( type ) }}}</div>
		<div class="elementor-template-library-template-meta elementor-template-library-template-author elementor-template-library-local-column-3">{{{ author }}}</div>
		<div class="elementor-template-library-template-meta elementor-template-library-template-date elementor-template-library-local-column-4">{{{ human_date }}}</div>
		<div class="elementor-template-library-template-controls elementor-template-library-local-column-5">
		<#
			const previewClass = typeof subType !== 'undefined' && 'FOLDER' !== subType
				? 'elementor-hidden'
				: '';
		#>
		<div class="elementor-template-library-template-preview elementor-button e-btn-txt {{{previewClass}}}">
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
			<i class="eicon-library-download" aria-hidden="true"></i>
			<span class="elementor-button-title"><?php echo esc_html__( 'Insert', 'elementor' ); ?></span>
		</button>
		<# } #>
		<div class="elementor-template-library-template-more-toggle">
			<i class="eicon-ellipsis-h" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More actions', 'elementor' ); ?></span>
		</div>
		<div class="elementor-template-library-template-more">
				<# if ( ( typeof subType === 'undefined' || 'FOLDER' !== subType ) && elementor.templates.hasCloudLibraryQuota() && ! elementor.templates.cloudLibraryIsDeactivated() ) { #>
					<div class="elementor-template-library-template-move">
						<i class="eicon-library-move" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Move to', 'elementor' ); ?></span>
					</div>
					<div class="elementor-template-library-template-copy">
						<i class="eicon-library-copy" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Copy to', 'elementor' ); ?></span>
					</div>
				<# } #>
			<div class="elementor-template-library-template-export">
				<a href="{{ export_link }}">
					<i class="eicon-library-download" aria-hidden="true"></i>
					<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Export', 'elementor' ); ?></span>
				</a>
			</div>
			<div class="elementor-template-library-template-rename">
				<i class="eicon-library-edit" aria-hidden="true"></i>
				<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Rename', 'elementor' ); ?></span>
			</div>
			<div class="elementor-template-library-template-delete">
				<i class="eicon-library-delete" aria-hidden="true"></i>
				<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Delete', 'elementor' ); ?></span>
			</div>
		</div>
	</div>
	<# } else {
		if ( typeof subType !== 'undefined' && 'FOLDER' === subType ) {
	#>
		<div class="elementor-template-library-template-type-icon">
			<i class="eicon-library-folder-view" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Folder', 'elementor' ); ?></span>
		</div>
		<div class="elementor-template-library-template-name">
			<span>{{ title }}</span>
		</div>
		<div class="elementor-template-library-template-more-toggle">
			<i class="eicon-ellipsis-v" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More actions', 'elementor' ); ?></span>
		</div>
		<div class="elementor-template-library-template-more" style="display: none;">
			<div class="elementor-template-library-template-export">
				<a href="{{ export_link }}">
					<i class="eicon-library-download" aria-hidden="true"></i>
					<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Export', 'elementor' ); ?></span>
				</a>
			</div>
			<div class="elementor-template-library-template-rename">
				<i class="eicon-library-edit" aria-hidden="true"></i>
				<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Rename', 'elementor' ); ?></span>
			</div>
			<div class="elementor-template-library-template-delete">
				<i class="eicon-library-delete" aria-hidden="true"></i>
				<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Delete', 'elementor' ); ?></span>
			</div>
		</div>
		<# } else { #>
			<#
				const imageSource = preview_url || '<?php echo esc_html( ELEMENTOR_ASSETS_URL . 'images/placeholder-cloud-grid.png' ); ?>';
			#>
			<div class="elementor-template-library-template-thumbnail">
				<img src="{{{ imageSource }}}"/>
				<div class="elementor-template-library-template-preview"></div>
			</div>
			<div class="elementor-template-library-card-footer">
				<div class="elementor-template-library-template-name">
					<# if ( 'locked' === status ) { #>
						<i class="eicon-lock-outline" aria-hidden="true" title="<?php esc_attr_e( 'Upgrade to get more storage space or delete old templates to make room.', 'elementor' ); ?>"></i>
					<# } #>
					<span>{{ title }}</span>
				</div>
				<div class="elementor-template-library-template-card-footer-overlay">
					<button class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button e-primary">
						<i class="eicon-library-download" aria-hidden="true"></i>
						<span class="elementor-button-title"><?php echo esc_html__( 'Insert', 'elementor' ); ?></span>
					</button>
					<div class="elementor-template-library-template-card-footer-overlay-info">
						<div class="elementor-template-library-template-meta">{{{ author }}}</div>
						<div class="elementor-template-library-template-meta">{{{ human_date }}}</div>
					</div>
				</div>
				<div class="elementor-template-library-template-more-toggle">
					<i class="eicon-ellipsis-v" aria-hidden="true"></i>
					<span class="elementor-screen-only"><?php echo esc_html__( 'More actions', 'elementor' ); ?></span>
				</div>
				<div class="elementor-template-library-template-more" style="display: none;">
					<div class="elementor-template-library-template-move">
						<i class="eicon-library-move" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Move to', 'elementor' ); ?></span>
					</div>
					<div class="elementor-template-library-template-copy">
						<i class="eicon-library-copy" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Copy to', 'elementor' ); ?></span>
					</div>
					<div class="elementor-template-library-template-export">
						<a href="{{ export_link }}">
							<i class="eicon-library-download" aria-hidden="true"></i>
							<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Export', 'elementor' ); ?></span>
						</a>
					</div>
					<div class="elementor-template-library-template-rename">
						<i class="eicon-library-edit" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Rename', 'elementor' ); ?></span>
					</div>
					<div class="elementor-template-library-template-delete">
						<i class="eicon-library-delete" aria-hidden="true"></i>
						<span class="elementor-template-library-template-control-title"><?php echo esc_html__( 'Delete', 'elementor' ); ?></span>
					</div>
				</div>
			</div>
	<# } } #>
</script>

<script type="text/template" id="tmpl-elementor-template-library-insert-button">
	<a class="elementor-template-library-template-action elementor-template-library-template-insert elementor-button e-primary">
		<i class="eicon-library-download" aria-hidden="true"></i>
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
		<i class="eicon-library-download" aria-hidden="true"></i>
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
		<#
			const templateIcon = typeof icon === 'undefined' ? '<i class="eicon-library-upload" aria-hidden="true"></i>' : icon;
			print( templateIcon );
		#>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Save', 'elementor' ); ?></span>
	</div>
	<div class="elementor-template-library-blank-title">{{{ title }}}</div>
	<div class="elementor-template-library-blank-message">{{{ description }}}</div>
	<form id="elementor-template-library-save-template-form">
		<input type="hidden" name="post_id" value="<?php echo esc_attr( get_the_ID() ); ?>">
		<# if ( typeof canSaveToCloud === 'undefined' || ! canSaveToCloud ) { #>
		<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php echo esc_attr__( 'Enter Template Name', 'elementor' ); ?>" required>
		<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary">
			<span class="elementor-state-icon">
				<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
			</span>
			<?php echo esc_html__( 'Save', 'elementor' ); ?>
		</button>
		<# } else { #>
		<div class="cloud-library-form-inputs">
			<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php echo esc_attr__( 'Give your template a name', 'elementor' ); ?>" required>
			<div class="source-selections">
				<div class="cloud-folder-selection-dropdown">
					<div class="cloud-folder-selection-dropdown-list"></div>
				</div>
				<div class="source-selections-input cloud">
					<input type="checkbox" id="cloud" name="cloud" value="cloud">
					<label for="cloud"> <?php echo esc_html__( 'Cloud Templates', 'elementor' ); ?></label> <span class="divider">/</span>  <div class="ellipsis-container"><i class="eicon-ellipsis-h"></i></div>
					<span class="selected-folder">
						<span class="selected-folder-text"></span>
						<i class="eicon-editor-close" aria-hidden="true"></i>
					</span>
					<# if ( elementor.config.library_connect.is_connected ) { #>
						<#
							const goLink = elementor.templates.hasCloudLibraryQuota()
								? 'https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-badge'
								: 'https://go.elementor.com/go-pro-cloud-templates-save-to-free-badge/';
						#>
						<span class="upgrade-badge">
							<a href="{{{ goLink }}}" target="_blank">
								<i class="eicon-upgrade-crown"></i><?php echo esc_html__( 'Upgrade', 'elementor' ); ?>
							</a>
						</span>
						<i class="eicon-info upgrade-tooltip" aria-hidden="true"></i>
					<# } else { #>
						<span class="connect-badge">
							<span class="connect-divider">|</span>
							<a id="elementor-template-library-connect__badge" href="{{{ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url }}}">
								<?php echo esc_html__( 'Connect', 'elementor' ); ?>
							</a>
						</span>
					<# } #>
				</div>
				<div class="source-selections-input local">
					<input type="checkbox" id="local" name="local" value="local">
					<label for="local"> <?php echo esc_html__( 'Site Templates', 'elementor' ); ?></label><br>
				</div>
				<input type="hidden" name="parentId" id="parentId" />
			</div>
			<div class="quota-cta">
				<p>
					<?php echo esc_html__( 'You’ve saved 100% of the templates in your plan.', 'elementor' ); ?>
					<br>
					<?php printf(
					/* translators: %s is the "Upgrade now" link */
						esc_html__( 'To get more space %s', 'elementor' ),
						'<a href="https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-notice">' . esc_html__( 'Upgrade now', 'elementor' ) . '</a>'
					); ?>
				</p>
			</div>
			<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				{{{ saveBtnText }}}
			</button>
		</div>
		<# } #>
	</form>
	<div class="elementor-template-library-blank-footer">
		<?php echo esc_html__( 'Learn more about the', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Template Library', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-template-library-save-template-variant-b">
	<div class="elementor-template-library-blank-icon">
		<#
			const templateIcon = typeof icon === 'undefined' ? '<i class="eicon-library-upload" aria-hidden="true"></i>' : icon;
			print( templateIcon );
		#>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Save', 'elementor' ); ?></span>
	</div>
	<div class="elementor-template-library-blank-title">{{{ title }}}</div>
	<div class="elementor-template-library-blank-message">{{{ description }}}</div>
	<form id="elementor-template-library-save-template-form">
		<input type="hidden" name="post_id" value="<?php echo esc_attr( get_the_ID() ); ?>">
		<# if ( typeof canSaveToCloud === 'undefined' || ! canSaveToCloud ) { #>
		<input id="elementor-template-library-save-template-name" name="title" placeholder="<?php echo esc_attr__( 'Enter Template Name', 'elementor' ); ?>" required>
		<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary">
			<span class="elementor-state-icon">
				<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
			</span>
			<?php echo esc_html__( 'Save', 'elementor' ); ?>
		</button>
		<# } else { #>
		<div class="cloud-library-form-inputs variant-b">
			<label class="template-name-label">{{{ nameLabel }}}</label>
			<input id="elementor-template-library-save-template-name" name="title" placeholder="{{ namePlaceholder }}" required>
			<div class="source-selections variant-b">
				<label class="save-location-label">{{{ saveLocationLabel }}}</label>
				<div class="cloud-folder-selection-dropdown">
					<div class="cloud-folder-selection-dropdown-list"></div>
				</div>
				<div class="source-selections-input cloud variant-b">
					<input type="checkbox" id="cloud-variant-b" name="cloud" value="cloud">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="21" viewBox="0 0 32 21" fill="none" aria-hidden="true" focusable="false">
						<path d="M14.4766 0.65332C15.6012 0.448538 16.725 0.448538 17.8496 0.65332L17.8506 0.654297C18.999 0.859231 20.0519 1.25664 21.0117 1.8457L21.0186 1.84961C21.977 2.41518 22.7715 3.12436 23.4062 3.97754V3.97852C23.9513 4.72146 24.3483 5.52984 24.5977 6.40625L24.5986 6.40918C24.8464 7.25779 24.9249 8.11532 24.835 8.98438L24.7773 9.53613H25.9482C26.6783 9.53618 27.3861 9.67837 28.0752 9.96484C28.7666 10.2523 29.3641 10.6478 29.8721 11.1514C30.3801 11.655 30.7789 12.2473 31.0684 12.9316C31.3568 13.6137 31.5 14.3141 31.5 15.0361C31.5 15.7562 31.3572 16.4544 31.0703 17.1348C30.7812 17.7963 30.3807 18.3918 29.8672 18.9238C29.361 19.4246 28.767 19.8189 28.0791 20.1055C27.3899 20.3687 26.6806 20.5 25.9482 20.5H7.86426C6.88609 20.5 5.94391 20.3314 5.03516 19.9941C4.15289 19.634 3.36155 19.1289 2.65918 18.4775C1.96133 17.8303 1.42329 17.0862 1.04102 16.2432C0.680199 15.3703 0.500051 14.4663 0.5 13.5273C0.5 12.5875 0.680313 11.6958 1.04004 10.8486L1.03906 10.8477C1.4212 10.0044 1.96042 9.26071 2.6582 8.61328C3.29259 8.02931 4.00501 7.56929 4.79785 7.23242L4.80859 7.22754C5.60006 6.86884 6.43718 6.65539 7.32227 6.58789L7.66406 6.5625L7.7627 6.23438C7.99951 5.45187 8.36595 4.71876 8.86523 4.03418L9.08789 3.74414C9.72608 2.97736 10.4771 2.33393 11.3438 1.81348C12.3064 1.24543 13.3497 0.858543 14.4766 0.65332Z" stroke="var(--e-a-color-txt)"/>
					</svg>
					<label for="cloud-variant-b"><?php echo esc_html__( 'Cloud Templates', 'elementor' ); ?></label>
					<span class="divider">/</span>
					<div class="ellipsis-container">
						<?php echo esc_html__( 'Select folder', 'elementor' ); ?>
					</div>
					<span class="selected-folder">
						<span class="selected-folder-text"></span>
						<i class="eicon-editor-close" aria-hidden="true"></i>
					</span>
					<# if ( elementor.config.library_connect.is_connected ) { #>
						<#
							const goLink = elementor.templates.hasCloudLibraryQuota()
								? 'https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-badge'
								: 'https://go.elementor.com/go-pro-cloud-templates-save-to-free-badge/';
						#>
					<span class="upgrade-badge">
						<a href="{{{ goLink }}}" target="_blank">
							<i class="eicon-upgrade-crown"></i><?php echo esc_html__( 'Upgrade', 'elementor' ); ?>
						</a>
					</span>
					<# } else { #>
					<span class="connect-badge">
						<a id="elementor-template-library-connect__badge-variant-b" href="{{{ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url }}}">
							<?php echo esc_html__( 'Connect account', 'elementor' ); ?>
						</a>
					</span>
					<# } #>
					<span class="account-badge cloud-account-badge" type="button" id="elementor-template-library-connect__badge-variant-b-button" aria-hidden="true">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M7.83317 2.33331C7.25853 2.33331 6.70743 2.56159 6.30111 2.96791C5.89478 3.37424 5.6665 3.92534 5.6665 4.49998V6.66665H9.99984V4.49998C9.99984 3.92534 9.77156 3.37424 9.36524 2.96791C8.95891 2.56159 8.40781 2.33331 7.83317 2.33331ZM10.9998 6.66665V4.49998C10.9998 3.66013 10.6662 2.85467 10.0723 2.26081C9.47848 1.66694 8.67302 1.33331 7.83317 1.33331C6.99332 1.33331 6.18786 1.66694 5.594 2.26081C5.00013 2.85467 4.6665 3.66013 4.6665 4.49998V6.66665H4.49984C4.01361 6.66665 3.54729 6.8598 3.20347 7.20362C2.85966 7.54743 2.6665 8.01375 2.6665 8.49998V12.5C2.6665 12.9862 2.85966 13.4525 3.20347 13.7963C3.54729 14.1402 4.01361 14.3333 4.49984 14.3333H11.1665C11.6527 14.3333 12.119 14.1402 12.4629 13.7963C12.8067 13.4525 12.9998 12.9862 12.9998 12.5V8.49998C12.9998 8.01375 12.8067 7.54743 12.4629 7.20362C12.119 6.8598 11.6527 6.66665 11.1665 6.66665H10.9998Z" fill="#1945A4"/>
						</svg>
						<?php echo esc_html__( 'My Elementor account', 'elementor' ); ?>
					</span>
				</div>
				<div class="source-selections-input local variant-b">
					<input type="checkbox" id="local-variant-b" name="local" value="local">
					<i class="eicon-header" aria-hidden="true"></i>
					<label for="local-variant-b"><?php echo esc_html__( 'Site Templates', 'elementor' ); ?></label>
					<span class="account-badge site-account-badge" type="button" aria-hidden="true">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
							<path d="M7.33301 9.5C8.17286 9.5 8.9784 9.83387 9.57227 10.4277C10.1661 11.0216 10.5 11.8271 10.5 12.667V14C10.5 14.2761 10.2761 14.5 10 14.5H2C1.72386 14.5 1.5 14.2761 1.5 14V12.667C1.5 11.8271 1.83387 11.0216 2.42773 10.4277C3.0216 9.83387 3.82714 9.5 4.66699 9.5H7.33301ZM11.833 9.5C12.6729 9.5 13.4784 9.83387 14.0723 10.4277C14.6661 11.0216 15 11.8271 15 12.667V14C15 14.2761 14.7761 14.5 14.5 14.5H11.5C11.7761 14.5 12 14.2761 12 14V12.667C12 11.8271 11.6661 11.0216 11.0723 10.4277C10.5178 9.87327 9.77915 9.54493 9 9.50391C9.05536 9.50099 9.11128 9.5 9.16699 9.5H11.833ZM6 1.5C6.83985 1.5 7.64539 1.83387 8.23926 2.42773C8.83302 3.02158 9.16699 3.82722 9.16699 4.66699C9.16691 5.50673 8.83305 6.31246 8.23926 6.90625C7.64541 7.50001 6.83978 7.83301 6 7.83301C5.16022 7.83301 4.35459 7.50001 3.76074 6.90625C3.16695 6.31246 2.83309 5.50673 2.83301 4.66699C2.83301 3.82722 3.16698 3.02158 3.76074 2.42773C4.35461 1.83387 5.16015 1.5 6 1.5ZM11 1.5C12.6569 1.5 14 2.84315 14 4.5C14 6.15685 12.6569 7.5 11 7.5C10.4529 7.5 9.94164 7.35059 9.5 7.09473C10.3958 6.57577 11 5.60972 11 4.5C11 3.3901 10.396 2.42319 9.5 1.9043C9.94155 1.64858 10.453 1.5 11 1.5Z" fill="#B15211"/>
						</svg>
						<?php echo esc_html__( 'Anyone on this site', 'elementor' ); ?>
					</span>
				</div>
				<input type="hidden" name="parentId" id="parentId" />
			</div>
			<div class="quota-cta">
				<p>
					<?php echo esc_html__( 'You’ve saved 100% of the templates in your plan.', 'elementor' ); ?>
					<br>
					<?php printf(
					/* translators: %s is the "Upgrade now" link */
						esc_html__( 'To get more space %s', 'elementor' ),
						'<a href="https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-notice">' . esc_html__( 'Upgrade now', 'elementor' ) . '</a>'
					); ?>
				</p>
			</div>
			<button id="elementor-template-library-save-template-submit" class="elementor-button e-primary" disabled>
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				{{{ saveBtnText }}}
			</button>
		</div>
		<# } #>
	</form>
	<div class="elementor-template-library-blank-footer">
		<?php echo esc_html__( 'Learn more about the', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Template Library', 'elementor' ); ?></a>
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
			<?php echo esc_html__( 'Learn more about the', 'elementor' ); ?>
			<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Template Library', 'elementor' ); ?></a>
		</div>
	</form>
</script>

<script type="text/template" id="tmpl-elementor-template-library-templates-empty">
	<div class="elementor-template-library-blank-icon"></div>
	<div class="elementor-template-library-blank-title"></div>
	<div class="elementor-template-library-blank-message"></div>

	<div class="elementor-template-library-cloud-empty__button"></div>

	<div class="elementor-template-library-blank-footer">
		<?php echo esc_html__( 'Learn more about the', 'elementor' ); ?>
		<a class="elementor-template-library-blank-footer-link" href="https://go.elementor.com/docs-library/" target="_blank"><?php echo esc_html__( 'Template Library', 'elementor' ); ?></a>
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

<script type="text/template" id="tmpl-elementor-template-library-connect-states">
	<#
		const activeSource = elementor.templates.getFilter( 'source' );
	#>
	<div id="elementor-template-library-filter-toolbar-local" class="elementor-template-library-filter-toolbar" style="padding-block-end:80px;">
		<div id="elementor-template-library-filter">
			<div class="elementor-template-library-filter-select-source">
				<div class="source-option<# if ( activeSource === 'local' ) { #> selected<# } #>" data-source="local">
					<i class="eicon-header" aria-hidden="true"></i>
					<?php echo esc_html__( 'Site templates', 'elementor' ); ?>
				</div>
				<div class="source-option<# if ( activeSource === 'cloud' ) { #> selected<# } #>" data-source="cloud">
					<i class="eicon-library-cloud-empty" aria-hidden="true"></i>
					<?php echo esc_html__( 'Cloud templates', 'elementor' ); ?>
					<#
						const tabIcon = elementor.templates.hasCloudLibraryQuota()
							? '<span class="new-badge"><?php echo esc_html__( 'New', 'elementor' ); ?></span>'
							: '<span class="new-badge"><i class="eicon-upgrade-crown" style="margin-inline-end: 0;"></i> <?php echo esc_html__( 'Pro', 'elementor' ); ?></span>';

						print( tabIcon );
					#>
				</div>
			</div>
		</div>
		<div class="elementor-template-library-connect-states-badge">
			<span class="source-option-badge cloud-badge">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M7.83317 2.33331C7.25853 2.33331 6.70743 2.56159 6.30111 2.96791C5.89478 3.37424 5.6665 3.92534 5.6665 4.49998V6.66665H9.99984V4.49998C9.99984 3.92534 9.77156 3.37424 9.36524 2.96791C8.95891 2.56159 8.40781 2.33331 7.83317 2.33331ZM10.9998 6.66665V4.49998C10.9998 3.66013 10.6662 2.85467 10.0723 2.26081C9.47848 1.66694 8.67302 1.33331 7.83317 1.33331C6.99332 1.33331 6.18786 1.66694 5.594 2.26081C5.00013 2.85467 4.6665 3.66013 4.6665 4.49998V6.66665H4.49984C4.01361 6.66665 3.54729 6.8598 3.20347 7.20362C2.85966 7.54743 2.6665 8.01375 2.6665 8.49998V12.5C2.6665 12.9862 2.85966 13.4525 3.20347 13.7963C3.54729 14.1402 4.01361 14.3333 4.49984 14.3333H11.1665C11.6527 14.3333 12.119 14.1402 12.4629 13.7963C12.8067 13.4525 12.9998 12.9862 12.9998 12.5V8.49998C12.9998 8.01375 12.8067 7.54743 12.4629 7.20362C12.119 6.8598 11.6527 6.66665 11.1665 6.66665H10.9998Z" fill="#1945A4" />
				</svg>
				<?php echo esc_html__( 'My Elementor account', 'elementor' ); ?>
			</span>
		</div>
	</div>
	<div class="elementor-template-library-blank-icon"></div>
	<div class="elementor-template-library-blank-title"></div>
	<div class="elementor-template-library-blank-message"></div>

	<div class="elementor-template-library-cloud-empty__button"></div>
</script>
