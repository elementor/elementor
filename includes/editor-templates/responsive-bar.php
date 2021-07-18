<?php
namespace Elementor;

use Elementor\Core\Breakpoints\Breakpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Use API data instead of this static array, once it is available.
$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();
$active_devices = Plugin::$instance->breakpoints->get_active_devices_list();

$breakpoint_classes_map = array_intersect_key( Plugin::$instance->breakpoints->get_responsive_icons_classes_map(), array_flip( $active_devices ) );

/* translators: %1$s: Device Name */
$breakpoint_label = __( '%1$s <br> Settings added to %1$s device will apply to %2$spx screens and down', 'elementor' );
?>

<script type="text/template" id="tmpl-elementor-templates-responsive-bar">
		<div class="e-responsive-bar__col"></div>
		<div class="e-responsive-bar__col">
			<div class="e-responsive-bar-switcher">
			<?php foreach ( $active_devices as $device_key ) {
				if ( 'desktop' === $device_key ) {
					$tooltip_label = __( 'Desktop <br> Settings added to Base device will apply to all breakpoints unless edited', 'elementor' );
				} else {
					$tooltip_label = sprintf( $breakpoint_label, $active_breakpoints[ $device_key ]->get_label(), $active_breakpoints[ $device_key ]->get_value() );
				}
				printf( '<label
					class="e-responsive-bar-switcher__option e-responsive-bar-switcher__option-%1$s"
					for="e-responsive-bar-switch-%1$s"
					data-tooltip="%2$s">

					<input type="radio" name="breakpoint" id="e-responsive-bar-switch-%1$s" value="%1$s">
					<i class="%3$s" aria-hidden="true"></i>
					<span class="screen-reader-text">%2$s</span>
				</label>', $device_key, $tooltip_label, $breakpoint_classes_map[ $device_key ] );
			} ?>
			</div>
		</div>
		<div class="e-responsive-bar__col">
			<button class="e-responsive-bar__close-button e-responsive-bar__button"
					data-tooltip="<?php echo __( 'Close', 'elementor' ); ?>">
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
				<input type="number" id="viewport_width" class="e-responsive-bar__input-size e-responsive-bar__input-width" autocomplete="off">
				<label for="viewport_height">H</label>
				<input type="number" id="viewport_height" class="e-responsive-bar__input-size e-responsive-bar__input-height" autocomplete="off">
			</div>
		</div>
</script>
