<script type="text/template" id="tmpl-elementor-kit-panel-menu">
	<main id="elementor-kit__panel-menu__wrapper" class="elementor-panel-menu-wrapper">
		<div id="elementor-panel-page-menu">
			<div class="elementor-panel-menu-items">
				<div class="elementor-panel-menu-item" data-tab="lightbox">
					<div class="elementor-panel-menu-item-icon">
						<i class="eicon-cogs"></i>
					</div>
					<div class="elementor-panel-menu-item-title">Lightbox</div>
				</div>
				<div class="elementor-panel-menu-item" data-tab="style">
					<div class="elementor-panel-menu-item-icon">
						<i class="eicon-adjust"></i>
					</div>
					<div class="elementor-panel-menu-item-title">Theme Style</div>
				</div>
			</div>
		</div>
	</main>
</script>

<script type="text/template" id="tmpl-elementor-kit-panel">
	<main id="elementor-kit__panel-content__wrapper" class="elementor-panel-content-wrapper"></main>
</script>

<script type="text/template" id="tmpl-elementor-kit-panel-content">
	<div id="elementor-kit-panel-content-controls"></div>
	<#
	const tabConfig = $e.components.get( 'panel/global' ).getActiveTabConfig();
	if ( tabConfig.helpUrl ) { #>
	<div id="elementor-panel__editor__help">
		<a id="elementor-panel__editor__help__link" href="{{ tabConfig.helpUrl }}" target="_blank">
			<?php echo __( 'Need Help', 'elementor' ); ?>
			<i class="eicon-help-o"></i>
		</a>
	</div>
	<# } #>
</script>

<script type="text/template" id="tmpl-elementor-global-style-repeater-row">
	<div class="elementor-repeater-row-tool elementor-repeater-tool-remove">
		<i class="eicon-trash-o" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php echo __( 'Remove', 'elementor' ); ?></span>
	</div>
	<div class="elementor-repeater-row-controls"></div>
</script>
