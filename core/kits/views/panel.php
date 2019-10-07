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
		<div id="elementor-kit__panel-header__back-button" class="elementor-header-button">
			<i class="elementor-icon {{ arrowIconClass }} tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e( 'Back', 'elementor' ); ?>"></i>
			<span class="elementor-screen-only"><?php echo __( 'Back', 'elementor' ); ?></span>
		</div>
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
