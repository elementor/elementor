<?php
namespace Elementor;

use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$document = Plugin::$instance->documents->get( Plugin::$instance->editor->get_post_id() );
$is_editor_v2_active = Plugin::$instance->experiments->is_feature_active( Editor::EDITOR_V2_EXPERIMENT_NAME );
?>
<script type="text/template" id="tmpl-elementor-panel">
	<div id="elementor-mode-switcher"></div>
	<div id="elementor-panel-state-loading">
		<i class="eicon-loading eicon-animation-spin"></i>
	</div>
	<header id="elementor-panel-header-wrapper"></header>
	<main id="elementor-panel-content-wrapper"></main>
	<footer id="elementor-panel-footer">
		<div class="elementor-panel-container"></div>
	</footer>
</script>

<script type="text/template" id="tmpl-elementor-panel-menu">
	<div id="elementor-panel-page-menu-content"></div>
	<# if ( elementor.config.document.panel.needHelpUrl ) { #>
	<div id="elementor-panel__editor__help">
		<a id="elementor-panel__editor__help__link" href="{{{ elementor.config.document.panel.needHelpUrl }}}" target="_blank">
			<?php echo esc_html__( 'Need Help', 'elementor' ); ?>
			<i class="eicon-help-o" aria-hidden="true"></i>
		</a>
	</div>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-panel-menu-group">
	<div class="elementor-panel-menu-group-title">{{{ title }}}</div>
	<div class="elementor-panel-menu-items"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-menu-item">
	<div class="elementor-panel-menu-item-icon">
		<i class="{{ icon }}"></i>
	</div>
	<# if ( 'undefined' === typeof type || 'link' !== type ) { #>
		<div class="elementor-panel-menu-item-title">{{{ title }}}</div>
	<# } else {
		let target = ( 'undefined' !== typeof newTab && newTab ) ? '_blank' : '_self';
	#>
		<a href="{{ link }}" target="{{ target }}"><div class="elementor-panel-menu-item-title">{{{ title }}}</div></a>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-exit-dialog">
	<div><?php echo esc_html__( 'Now you can choose where you want to go on the site from the following options', 'elementor' ); ?></div>
	<div>
		<!-- translators: 1: Opening HTML <a> tag, 2: closing HTML <a> tag. -->
		<?php echo sprintf(
			esc_html__( 'Any time you can change the settings in %1$sUser Preferences%2$s', 'elementor' ),
			'<a id="user-preferences">',
			'</a>'
		); ?>
	</div>
	<select id="exit-to-preferences"></select> <!--  Adding options by JS  -->
</script>

<script type="text/template" id="tmpl-elementor-panel-header">
	<div id="elementor-panel-header-menu-button" class="elementor-header-button">
		<i class="elementor-icon eicon-menu-bar tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e( 'Menu', 'elementor' ); ?>"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Menu', 'elementor' ); ?></span>
	</div>
	<div id="elementor-panel-header-title"></div>
	<div id="elementor-panel-header-add-button" class="elementor-header-button">
		<i class="elementor-icon eicon-apps tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e( 'Widgets Panel', 'elementor' ); ?>"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Widgets Panel', 'elementor' ); ?></span>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-footer-content">
	<div id="elementor-panel-footer-settings" class="elementor-panel-footer-tool elementor-leave-open tooltip-target" data-tooltip="<?php esc_attr_e( 'Settings', 'elementor' ); ?>">
		<i class="eicon-cog" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php printf( esc_html__( '%s Settings', 'elementor' ), esc_html( $document::get_title() ) ); ?></span>
	</div>
	<div id="elementor-panel-footer-navigator" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php
		echo $is_editor_v2_active
			? esc_attr__( 'Structure', 'elementor' )
			: esc_attr__( 'Navigator', 'elementor' );
	?>">
		<i class="eicon-navigator" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php
			echo $is_editor_v2_active
				? esc_html__( 'Structure', 'elementor' )
				: esc_html__( 'Navigator', 'elementor' );
		?></span>
	</div>
	<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool elementor-leave-open tooltip-target" data-tooltip="<?php esc_attr_e( 'History', 'elementor' ); ?>">
		<i class="eicon-history" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'History', 'elementor' ); ?></span>
	</div>
	<div id="elementor-panel-footer-responsive" class="elementor-panel-footer-tool elementor-toggle-state tooltip-target" data-tooltip="<?php esc_attr_e( 'Responsive Mode', 'elementor' ); ?>">
		<i class="eicon-device-responsive" aria-hidden="true"></i>
		<span class="elementor-screen-only">
			<?php echo esc_html__( 'Responsive Mode', 'elementor' ); ?>
		</span>
	</div>
	<div id="elementor-panel-footer-saver-preview" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
		<span id="elementor-panel-footer-saver-preview-label">
			<i class="eicon-preview-medium" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Preview Changes', 'elementor' ); ?></span>
		</span>
	</div>
	<div id="elementor-panel-footer-saver-publish" class="elementor-panel-footer-tool">
		<button id="elementor-panel-saver-button-publish" class="elementor-button e-primary elementor-disabled">
			<span class="elementor-state-icon">
				<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
			</span>
			<span id="elementor-panel-saver-button-publish-label">
				<?php echo esc_html__( 'Publish', 'elementor' ); ?>
			</span>
		</button>
	</div>
	<div id="elementor-panel-footer-saver-options" class="elementor-panel-footer-tool elementor-toggle-state">
		<button id="elementor-panel-saver-button-save-options" class="elementor-button e-primary tooltip-target elementor-disabled" data-tooltip="<?php esc_attr_e( 'Save Options', 'elementor' ); ?>" data-tooltip-offset="7">
			<i class="eicon-chevron-right" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Save Options', 'elementor' ); ?></span>
		</button>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<p class="elementor-last-edited-wrapper">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span class="elementor-last-edited">
				</span>
			</p>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-save-draft" class="elementor-panel-footer-sub-menu-item elementor-disabled">
					<i class="elementor-icon eicon-save" aria-hidden="true"></i>
					<span class="elementor-title"><?php echo esc_html__( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-save-template" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon eicon-folder" aria-hidden="true"></i>
					<span class="elementor-title"><?php echo esc_html__( 'Save as Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-mode-switcher-content">
	<input id="elementor-mode-switcher-preview-input" type="checkbox">
	<label for="elementor-mode-switcher-preview-input" id="elementor-mode-switcher-preview">
		<i class="eicon" aria-hidden="true" title="<?php esc_attr_e( 'Hide Panel', 'elementor' ); ?>"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Hide Panel', 'elementor' ); ?></span>
	</label>
</script>

<script type="text/template" id="tmpl-editor-content">
	<div class="elementor-panel-navigation">
		<# _.each( elementData.tabs_controls, function( tabTitle, tabSlug ) {
			if ( 'content' !== tabSlug && ! elementor.userCan( 'design' ) ) {
				return;
			}
			$e.bc.ensureTab( 'panel/editor', tabSlug );
			#>
			<button class="elementor-component-tab elementor-panel-navigation-tab elementor-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
				<span>{{{ tabTitle }}}</span>
			</button>
		<# } ); #>
	</div>
	<# if ( elementData.reload_preview ) { #>
		<div class="elementor-update-preview">
			<div class="elementor-update-preview-title"><?php echo esc_html__( 'Update changes to page', 'elementor' ); ?></div>
			<div class="elementor-update-preview-button-wrapper">
				<button class="elementor-update-preview-button elementor-button"><?php echo esc_html__( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
	<# } #>
	<div id="elementor-controls"></div>
	<# if ( elementData.help_url ) { #>
		<div id="elementor-panel__editor__help">
			<a id="elementor-panel__editor__help__link" href="{{ elementData.help_url }}" target="_blank">
				<?php echo esc_html__( 'Need Help', 'elementor' ); ?>
				<i class="eicon-help-o" aria-hidden="true"></i>
			</a>
		</div>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-control-responsive-switchers">
	<div class="elementor-control-responsive-switchers">
		<div class="elementor-control-responsive-switchers__holder">
		<#
			const activeBreakpoints = elementor.config.responsive.activeBreakpoints,
				devicesForDisplay = elementor.breakpoints.getActiveBreakpointsList( { largeToSmall: true, withDesktop: true } );

			var devices = responsive.devices || devicesForDisplay;

			_.each( devices, function( device ) {
				// The 'Desktop' label is made accessible via the global config because it needs to be translated.
				var deviceLabel = 'desktop' === device ? '<?php esc_html_e( 'Desktop', 'elementor' ); ?>' : activeBreakpoints[ device ].label,
					tooltipDir = "<?php echo is_rtl() ? 'e' : 'w'; ?>";
			#>
				<button class="elementor-responsive-switcher tooltip-target elementor-responsive-switcher-{{ device }}" data-device="{{ device }}" data-tooltip="{{ deviceLabel }}" data-tooltip-pos="{{ tooltipDir }}">
					<i class="{{ elementor.config.responsive.icons_map[ device ] }}" aria-hidden="true"></i>
					<span class="elementor-screen-only">{{ deviceLabel }}</span>
				</button>
			<# } );
		#>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-control-dynamic-switcher">
	<div class="elementor-control-dynamic-switcher elementor-control-unit-1" data-tooltip="<?php echo esc_attr__( 'Dynamic Tags', 'elementor' ); ?>">
		<i class="eicon-database" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Dynamic Tags', 'elementor' ); ?></span>
	</div>
</script>
<script type="text/template" id="tmpl-elementor-control-element-color-picker">
	<div class="elementor-control-element-color-picker e-control-tool" data-tooltip="<?php echo esc_attr__( 'Color Sampler', 'elementor' ); ?>">
		<i class="eicon-eyedropper" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo esc_html__( 'Color Sampler', 'elementor' ); ?></span>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-control-dynamic-cover">
	<div class="elementor-dynamic-cover__settings">
		<i class="eicon-{{ hasSettings ? 'wrench' : 'database' }}"></i>
	</div>
	<div class="elementor-dynamic-cover__title" title="{{{ title + ' ' + content }}}">{{{ title + ' ' + content }}}</div>
	<# if ( isRemovable ) { #>
		<div class="elementor-dynamic-cover__remove">
			<i class="eicon-close-circle"></i>
		</div>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-dynamic-tags-promo">
	<div class="elementor-tags-list__teaser">
		<div class="elementor-tags-list__group-title elementor-tags-list__teaser-title">
			<i class="eicon-info-circle"></i><?php echo esc_html__( 'Elementor Dynamic Content', 'elementor' ); ?>
		</div>
		<div class="elementor-tags-list__teaser-text">
			<?php echo esc_html__( 'You’re missing out!', 'elementor' ); ?><br />
			<?php echo esc_html__( 'Get more dynamic capabilities by incorporating dozens of Elementor\'s native dynamic tags.', 'elementor' ); ?>
			<a href="{{{ promotionUrl }}}" class="elementor-tags-list__teaser-link" target="_blank">
				<?php echo esc_html__( 'Upgrade', 'elementor' ); ?>
			</a>
		</div>
	</div>
</script>
