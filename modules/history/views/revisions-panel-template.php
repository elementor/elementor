<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-elementor-panel-revisions">
	<div class="elementor-panel-box">
	<div class="elementor-panel-scheme-buttons">
			<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
				<button class="elementor-button" disabled>
					<i class="eicon-close" aria-hidden="true"></i>
					<?php echo __( 'Discard', 'elementor' ); ?>
				</button>
			</div>
			<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
				<button class="elementor-button elementor-button-success" disabled>
					<?php echo __( 'Apply', 'elementor' ); ?>
				</button>
			</div>
		</div>
	</div>

	<div class="elementor-panel-box">
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-title"><?php echo __( 'Revisions', 'elementor' ); ?></div>
		</div>
		<div id="elementor-revisions-list" class="elementor-panel-box-content"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-revisions-no-revisions">
	<img class="elementor-nerd-box-icon" src="<?php echo ELEMENTOR_ASSETS_URL . 'images/information.svg'; ?>" />
	<div class="elementor-nerd-box-title"><?php echo __( 'No Revisions Saved Yet', 'elementor' ); ?></div>
	<div class="elementor-nerd-box-message">{{{ elementor.translate( elementor.config.document.revisions.enabled ? 'no_revisions_1' : 'revisions_disabled_1' ) }}}</div>
	<div class="elementor-nerd-box-message">{{{ elementor.translate( elementor.config.document.revisions.enabled ? 'no_revisions_2' : 'revisions_disabled_2' ) }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-revisions-loading">
	<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
</script>

<script type="text/template" id="tmpl-elementor-panel-revisions-revision-item">
	<div class="elementor-revision-item__wrapper {{ type }}">
		<div class="elementor-revision-item__gravatar">{{{ gravatar }}}</div>
		<div class="elementor-revision-item__details">
			<div class="elementor-revision-date" title="{{{ new Date( timestamp * 1000 ) }}}">{{{ date }}}</div>
			<div class="elementor-revision-meta">
				<span>{{{ elementor.translate( type ) }}}</span>
				<?php echo __( 'By', 'elementor' ); ?> {{{ author }}}
				<span>(#{{{ id }}})</span>&nbsp;
			</div>
		</div>
		<div class="elementor-revision-item__tools">
			<# if ( 'current' === type ) { #>
				<i class="elementor-revision-item__tools-current eicon-star" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo __( 'Current', 'elementor' ); ?></span>
			<# } #>

			<i class="elementor-revision-item__tools-spinner eicon-loading eicon-animation-spin" aria-hidden="true"></i>
		</div>
	</div>
</script>
