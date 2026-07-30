<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<div id="elementor-panel-get-pro-elements-sticky">
	<div class="elementor-get-pro-sticky-message">
		<?php echo esc_html( $promotion_data_sticky['message'] ); ?>
		<a target="_blank" href="<?php echo esc_url( $promotion_data_sticky['url'] ); ?>"><?php echo esc_html( $promotion_data_sticky['button_text'] ); ?></a>
	</div>
</div>
