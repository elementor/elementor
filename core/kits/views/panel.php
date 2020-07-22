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
	<# let removeClass = 'remove',
			removeIcon = 'eicon-trash-o';

	if ( ! itemActions.remove ) {
		removeClass += '--disabled';

		removeIcon = 'eicon-disable-trash-o'
	}
	#>
	<div class="elementor-repeater-row-tool elementor-repeater-tool-{{{ removeClass }}}">
		<i class="{{{ removeIcon }}}" aria-hidden="true"></i>
		<# if ( itemActions.remove ) { #>
			<span class="elementor-screen-only"><?php echo __( 'Remove', 'elementor' ); ?></span>
		<# } #>
	</div>
	<div class="elementor-repeater-row-controls"></div>
</script>
