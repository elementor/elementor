<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Use API data instead of this static array, once it is available.
$breakpoints = [
	'mobile' => __( 'Mobile', 'elementor' ),
	'tablet' => __( 'Tablet', 'elementor' ),
	'desktop' => __( 'Desktop', 'elementor' ),
]; ?>

<script type="text/template" id="tmpl-elementor-templates-responsive-bar">
		<div class="e-responsive-bar__col"></div>
		<div class="e-responsive-bar__col">
			<div class="e-responsive-bar-switcher">
			<?php
				$checked = 'checked';

				foreach ( $breakpoints as $name => $label ) {
					printf( '<label
						class="e-responsive-bar-switcher__option e-responsive-bar-switcher__option-%1$s"
						for="e-responsive-bar-switch-%1$s"
						data-tooltip="%2$s">

						<input type="radio" name="breakpoint" id="e-responsive-bar-switch-%1$s" value="%1$s" %3$s>
						<i class="eicon-device-%1$s" aria-hidden="true"></i>
						<span class="screen-reader-text">%2$s</span>
					</label>', $name, $label, $checked );
					$checked = '';
				} ?>
			</div>
		</div>
		<div class="e-responsive-bar__col">
			<button class="e-responsive-bar__close-button e-responsive-bar__button"
					data-tooltip="<?php echo __( 'Exit', 'elementor' ); ?>">
				<span class="elementor-screen-only"><?php echo __( 'Close', 'elementor' ); ?></span>
				<i class="eicon-close" aria-hidden="true"></i>
			</button>
			<button class="e-responsive-bar__settings-button e-responsive-bar__button"
					data-tooltip="<?php echo __( 'Manage Breakpoints', 'elementor' ); ?>">
				<span class="elementor-screen-only"><?php echo __( 'Settings', 'elementor' ); ?></span>
				<i class="eicon-cog" aria-hidden="true"></i>
			</button>
			<div class="e-flex e-align-items-center e-responsive-bar__size-inputs-wrapper">
				<label for="viewport_width">W</label>
				<input type="text" id="viewport_width" class="e-responsive-bar__input-size e-responsive-bar__input-width" autocomplete="off">
				<label for="viewport_height">H</label>
				<input type="text" id="viewport_height" class="e-responsive-bar__input-size e-responsive-bar__input-height" autocomplete="off">
			</div>
		</div>
</script>
