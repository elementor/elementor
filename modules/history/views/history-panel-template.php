<script type="text/template" id="tmpl-elementor-panel-history-page">
	<div id="elementor-panel-elements-navigation" class="elementor-panel-navigation">
		<div id="elementor-panel-elements-navigation-history" class="elementor-panel-navigation-tab active" data-view="history"><?php echo __( 'HISTORY', 'elementor' ); ?></div>
		<div id="elementor-panel-elements-navigation-revisions" class="elementor-panel-navigation-tab" data-view="revisions"><?php echo __( 'REVISIONS', 'elementor' ); ?></div>
	</div>
	<div id="elementor-panel-history-content"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-history-tab">
	<div class="elementor-panel-box">
		<div class="elementor-panel-box-content">
			<div id="elementor-history-list"></div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-history-no-items">
	<i class="elementor-panel-nerd-box-icon eicon-nerd"></i>
	<div class="elementor-panel-nerd-box-title"><?php _e( 'No History Yet', 'elementor' ); ?></div>
	<div class="elementor-panel-nerd-box-message">{{{ elementor.translate( 'no_revisions_1' ) }}}</div>
	<div class="elementor-panel-nerd-box-message">{{{ elementor.translate( 'no_revisions_2' ) }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-history-item">
	<div class="elementor-history-item elementor-history-item-{{ status }}">
		<div class="elementor-history-item__details">
			<strong>{{{ title }}}</strong>&nbsp;<span>{{{ subTitle }}}</span>&nbsp;<u>{{{ action }}}</u>
		</div>
		<div class="elementor-history-item__icon">
			<span class="fa"></span>
		</div>
	</div>
</script>