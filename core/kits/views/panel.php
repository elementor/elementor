<script type="text/template" id="tmpl-elementor-kit-panel">
	<header id="elementor-kit__panel-header__wrapper" class="elementor-panel-header-wrapper"></header>
	<main id="elementor-kit__panel-content__wrapper" class="elementor-panel-content-wrapper"></main>
	<footer id="elementor-kit__panel-footer__wrapper" class="elementor-panel-footer-wrapper"></footer>
</script>

<script type="text/template" id="tmpl-elementor-kit-panel-header">
	<#
	const arrowIconClass = 'eicon-arrow-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );
	#>
	<div id="elementor-panel-header">
		<# if ( hasHistory ) { #>
		<div id="elementor-kit__panel-header__back-button" class="elementor-header-button">
			<i class="elementor-icon {{ arrowIconClass }} tooltip-target" aria-hidden="true" data-tooltip="<?php use Elementor\Core\Responsive\Responsive;

			esc_attr_e( 'Back', 'elementor' ); ?>"></i>
			<span class="elementor-screen-only"><?php echo __( 'Back', 'elementor' ); ?></span>
		</div>
		<# } #>
		<div id="elementor-kit__panel-header__title"><?php echo __( 'Kit', 'elementor' ); ?></div>
		<div id="elementor-kit__panel-header__close-button" class="elementor-header-button">
			<i class="elementor-icon eicon-close tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e( 'Close', 'elementor' ); ?>"></i>
			<span class="elementor-screen-only"><?php echo __( 'Close', 'elementor' ); ?></span>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-kit-panel-content">
	<div id="elementor-kit-panel-content-controls"></div>
</script>

<script type="text/template" id="tmpl-elementor-kit-panel-footer">
<div id="elementor-panel-footer">
	<nav id="elementor-panel-footer-tools">
		<div id="elementor-panel-footer-settings" class="elementor-panel-footer-tool elementor-leave-open tooltip-target" data-tooltip="<?php esc_attr_e( 'Settings', 'elementor' ); ?>">
			<i class="eicon-cog" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php printf( __( '%s Settings', 'elementor' ), 'Kit' ); ?></span>
		</div>
		<div id="elementor-panel-footer-library" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Library', 'elementor' ); ?>">
			<i class="eicon-folder" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo __( 'Library', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool elementor-leave-open tooltip-target" data-tooltip="<?php esc_attr_e( 'History', 'elementor' ); ?>">
			<i class="eicon-history" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php echo __( 'History', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-responsive" class="elementor-panel-footer-tool elementor-toggle-state">
			<i class="eicon-device-desktop tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e( 'Responsive Mode', 'elementor' ); ?>"></i>
			<span class="elementor-screen-only">
				<?php echo __( 'Responsive Mode', 'elementor' ); ?>
			</span>
			<div class="elementor-panel-footer-sub-menu-wrapper">
				<div class="elementor-panel-footer-sub-menu">
					<div class="elementor-panel-footer-sub-menu-item" data-device-mode="desktop">
						<i class="elementor-icon eicon-device-desktop" aria-hidden="true"></i>
						<span class="elementor-title"><?php echo __( 'Desktop', 'elementor' ); ?></span>
						<span class="elementor-description"><?php echo __( 'Default Preview', 'elementor' ); ?></span>
					</div>
					<div class="elementor-panel-footer-sub-menu-item" data-device-mode="tablet">
						<i class="elementor-icon eicon-device-tablet" aria-hidden="true"></i>
						<span class="elementor-title"><?php echo __( 'Tablet', 'elementor' ); ?></span>
						<?php $breakpoints = Responsive::get_breakpoints(); ?>
						<span class="elementor-description"><?php echo sprintf( __( 'Preview for %s', 'elementor' ), $breakpoints['md'] . 'px' ); ?></span>
					</div>
					<div class="elementor-panel-footer-sub-menu-item" data-device-mode="mobile">
						<i class="elementor-icon eicon-device-mobile" aria-hidden="true"></i>
						<span class="elementor-title"><?php echo __( 'Mobile', 'elementor' ); ?></span>
						<span class="elementor-description"><?php echo sprintf( __( 'Preview for %s', 'elementor' ), '360px' ); ?></span>
					</div>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-saver-preview" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
			<span id="elementor-panel-footer-saver-preview-label">
				<i class="eicon-eye" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo __( 'Preview Changes', 'elementor' ); ?></span>
			</span>
		</div>
		<div id="elementor-panel-footer-saver-publish" class="elementor-panel-footer-tool">
			<button id="elementor-panel-saver-button-publish" class="elementor-button elementor-button-success elementor-disabled">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span id="elementor-panel-saver-button-publish-label">
					<?php echo __( 'Publish', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-panel-footer-saver-options" class="elementor-panel-footer-tool elementor-toggle-state">
			<button id="elementor-panel-saver-button-save-options" class="elementor-button elementor-button-success tooltip-target elementor-disabled" data-tooltip="<?php esc_attr_e( 'Save Options', 'elementor' ); ?>">
				<i class="eicon-caret-up" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo __( 'Save Options', 'elementor' ); ?></span>
			</button>
			<div class="elementor-panel-footer-sub-menu-wrapper">
				<p class="elementor-last-edited-wrapper">
					<span class="elementor-state-icon">
						<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
					</span>
					<span class="elementor-last-edited">
						{{{ elementor.config.document.last_edited }}}
					</span>
				</p>
				<div class="elementor-panel-footer-sub-menu">
					<div id="elementor-panel-footer-sub-menu-item-save-draft" class="elementor-panel-footer-sub-menu-item elementor-disabled">
						<i class="elementor-icon eicon-save" aria-hidden="true"></i>
						<span class="elementor-title"><?php echo __( 'Save Draft', 'elementor' ); ?></span>
					</div>
					<div id="elementor-panel-footer-sub-menu-item-save-template" class="elementor-panel-footer-sub-menu-item">
						<i class="elementor-icon eicon-folder" aria-hidden="true"></i>
						<span class="elementor-title"><?php echo __( 'Save as', 'elementor' ); ?></span>
					</div>
				</div>
			</div>
		</div>
	</nav>
</div>
</script>
