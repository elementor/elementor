<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-elementor-templates-responsive-top-bar">
	<aside class="e-mq-bar">
		<div class="e-mq-bar__col">

		</div>
		<div class="e-mq-bar__col">
			<div class="e-mq-switcher">
				<input class="e-mq-switcher__option" type="radio" value="mobile" name="breakpoint" id="e-mq-switch-mobile">
				<label for="e-mq-switch-mobile"><?php echo __('Mobile', 'elementor') ?></label>

				<input class="e-mq-switcher__option" type="radio" value="tablet" name="breakpoint" id="e-mq-switch-tablet">
				<label for="e-mq-switch-tablet"><?php echo __('Tablet', 'elementor') ?></label>

				<input class="e-mq-switcher__option" type="radio" value="desktop" name="breakpoint" id="e-mq-switch-desktop">
				<label for="e-mq-switch-desktop"><?php echo __('Desktop', 'elementor') ?></label>
			</div>
		</div>
		<div class="e-mq-bar__col">

			<button class="e-mq-bar__close">
				<span class="elementor-screen-only">Close</span>
				<i class="eicon-close" aria-hidden="true"></i>
			</button>
		</div>
	</aside>
</script>
