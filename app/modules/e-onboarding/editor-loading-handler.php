<?php

namespace Elementor\App\Modules\E_Onboarding;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Loading_Handler {

	private static bool $from_onboarding = false;

	public static function set_from_onboarding(): void {
		self::$from_onboarding = true;
	}

	public static function maybe_render_onboarding_loading_content(): void {
		if ( ! self::$from_onboarding ) {
			return;
		}

		self::render_loading_content();
	}

	private static function render_loading_content(): void {
		?>
		<div class="e-from-onboarding-track"><div class="e-from-onboarding-fill"></div></div>
		<div class="e-from-onboarding-text">
			<p class="e-from-onboarding-heading"><?php echo esc_html__( 'Getting things ready', 'elementor' ); ?></p>
			<p class="e-from-onboarding-subtext"><?php echo esc_html__( 'Tailoring the editor to your goals and workflow…', 'elementor' ); ?></p>
		</div>
		<?php
	}
}
