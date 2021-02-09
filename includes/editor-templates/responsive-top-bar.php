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
</script>
