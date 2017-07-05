
<script type="text/template" id="tmpl-elementor-panel-history">
	<div class="elementor-panel-scheme-buttons">
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
			<button class="elementor-button">
				<i class="fa fa-times"></i><?php _e( 'Clear', 'elementor' ); ?>
			</button>
		</div>
	</div>
	<div class="elementor-panel-box">
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-title"><?php _e( 'History', 'elementor' ); ?></div>
		</div>
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
		{{{ title }}}
	</div>
</script>