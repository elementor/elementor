<?php
namespace Elementor;

use Elementor\Core\Responsive\Responsive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

//$breakpoints = Responsive::get_breakpoints();
$breakpoints = [
	'mobile' => __( 'Mobile', 'elementor' ),
	'tablet' => __( 'Tablet', 'elementor' ),
	'desktop' => __( 'Desktop', 'elementor' ),
];
?>
<script type="text/template" id="tmpl-elementor-templates-responsive-top-bar">
	<aside class="e-mq-bar">
		<div class="e-mq-bar__col">

		</div>
		<div class="e-mq-bar__col">
			<div class="e-mq-switcher">
				<?php foreach ( $breakpoints as $name => $label ) {
					printf( '<input
							type="radio"
							name="breakpoint"
							class="e-mq-switcher__option e-mq-switcher__option-%1$s"
							id="e-mq-switch-%1$s"
							value="%1$s">
					<label for="e-mq-switch-%1$s">
						<i class="eicon-device-%1$s" aria-hidden="true"></i>
						<span>
							<em>%2$s</em>
						</span>
					</label>', $name, $label ); } ?>
			</div>
		</div>
		<div class="e-mq-bar__col">

			<button class="e-mq-bar__settings-button">
				<span class="elementor-screen-only">Close</span>
				<i class="eicon-cog" aria-hidden="true"></i>
			</button>

			<button class="e-mq-bar__close-button">
				<span class="elementor-screen-only">Close</span>
				<i class="eicon-close" aria-hidden="true"></i>
			</button>
		</div>
	</aside>

<!--	<div id="elementor-panel-footer-responsive" class="elementor-panel-footer-tool elementor-toggle-state">-->
<!--		<i class="eicon-device-desktop tooltip-target" aria-hidden="true" data-tooltip="--><?php //esc_attr_e( 'Responsive Mode', 'elementor' ); ?><!--"></i>-->
<!--		<span class="elementor-screen-only">-->
<!--			--><?php //echo __( 'Responsive Mode', 'elementor' ); ?>
<!--		</span>-->
<!--		<div class="elementor-panel-footer-sub-menu-wrapper">-->
<!--			<div class="elementor-panel-footer-sub-menu">-->
<!--				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="desktop">-->
<!--					<i class="elementor-icon eicon-device-desktop" aria-hidden="true"></i>-->
<!--					<span class="elementor-title">--><?php //echo __( 'Desktop', 'elementor' ); ?><!--</span>-->
<!--					<span class="elementor-description">--><?php //echo __( 'Default Preview', 'elementor' ); ?><!--</span>-->
<!--				</div>-->
<!--				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="tablet">-->
<!--					<i class="elementor-icon eicon-device-tablet" aria-hidden="true"></i>-->
<!--					<span class="elementor-title">--><?php //echo __( 'Tablet', 'elementor' ); ?><!--</span>-->
<!--					--><?php //$breakpoints = Responsive::get_breakpoints(); ?>
<!--					<span class="elementor-description">--><?php //echo sprintf( __( 'Preview for %s', 'elementor' ), $breakpoints['md'] . 'px' ); ?><!--</span>-->
<!--				</div>-->
<!--				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="mobile">-->
<!--					<i class="elementor-icon eicon-device-mobile" aria-hidden="true"></i>-->
<!--					<span class="elementor-title">--><?php //echo __( 'Mobile', 'elementor' ); ?><!--</span>-->
<!--					<span class="elementor-description">--><?php //echo sprintf( __( 'Preview for %s', 'elementor' ), '360px' ); ?><!--</span>-->
<!--				</div>-->
<!--			</div>-->
<!--		</div>-->
<!--	</div>-->
</script>
