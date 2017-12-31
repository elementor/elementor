<script type="text/template" id="tmpl-elementor-panel-revisions">
	<div class="elementor-panel-box">
	<div class="elementor-panel-scheme-buttons">
			<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
				<button class="elementor-button" disabled>
					<i class="fa fa-times"></i><?php esc_html_e( 'Discard', 'elementor' ); ?>
				</button>
			</div>
			<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
				<button class="elementor-button elementor-button-success" disabled>
					<?php esc_html_e( 'Apply', 'elementor' ); ?>
				</button>
			</div>
		</div>
	</div>

	<div class="elementor-panel-box">
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-title"><?php esc_html_e( 'Revisions', 'elementor' ); ?></div>
		</div>
		<div id="elementor-revisions-list" class="elementor-panel-box-content"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-revisions-no-revisions">
	<i class="elementor-panel-nerd-box-icon eicon-nerd"></i>
	<div class="elementor-panel-nerd-box-title"><?php esc_html_e( 'No Revisions Saved Yet', 'elementor' ); ?></div>
	<div class="elementor-panel-nerd-box-message">{{{ elementor.translate( elementor.config.revisions_enabled ? 'no_revisions_1' : 'revisions_disabled_1' ) }}}</div>
	<div class="elementor-panel-nerd-box-message">{{{ elementor.translate( elementor.config.revisions_enabled ? 'no_revisions_2' : 'revisions_disabled_2' ) }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-revisions-revision-item">
	<div class="elementor-revision-item__wrapper {{ type }}">
		<div class="elementor-revision-item__gravatar">{{{ gravatar }}}</div>
		<div class="elementor-revision-item__details">
			<div class="elementor-revision-date">{{{ date }}}</div>
			<div class="elementor-revision-meta"><span>{{{ elementor.translate( type ) }}}</span> <?php esc_html_e( 'By', 'elementor' ); ?> {{{ author }}}</div>
		</div>
		<div class="elementor-revision-item__tools">
			<# if ( 'current' === type ) { #>
				<i class="elementor-revision-item__tools-current fa fa-star"></i>
			<# } else { #>
				<i class="elementor-revision-item__tools-delete fa fa-times"></i>
			<# } #>

			<i class="elementor-revision-item__tools-spinner fa fa-spin fa-circle-o-notch"></i>
		</div>
	</div>
</script>
