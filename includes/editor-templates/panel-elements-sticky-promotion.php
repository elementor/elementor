<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<div id="elementor-panel-get-pro-elements-sticky">
	<?php if ( ! Plugin::$instance->experiments->is_feature_active( 'e_panel_promotions' ) ) : ?>
		<img class="elementor-nerd-box-icon" src="<?php echo ELEMENTOR_ASSETS_URL . 'images/unlock-sticky.svg'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" loading="lazy" alt="<?php echo esc_attr__( 'Upgrade', 'elementor' ); ?>"/>
	<?php endif; ?>
	<div class="elementor-get-pro-sticky-message">
		<?php echo esc_html( $promotion_data_sticky['message'] ); ?>
		<a target="_blank" href="<?php echo esc_url( $promotion_data_sticky['url'] ); ?>"><?php echo esc_html( $promotion_data_sticky['button_text'] ); ?></a>
	</div>
</div>
