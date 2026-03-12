<?php

namespace Elementor\App\Modules\E_Onboarding;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Loading_Handler {

	private bool $from_onboarding = false;

	public function set_from_onboarding(): void {
		$this->from_onboarding = true;
	}

	public function maybe_render_onboarding_loading_content(): void {
		if ( ! $this->from_onboarding ) {
			return;
		}

		$this->render_loading_content();
	}

	private function render_loading_content(): void {
		?>
		<div class="e-from-onboarding-track"><div class="e-from-onboarding-fill"></div></div>
		<div class="e-from-onboarding-text">
			<p class="e-from-onboarding-heading"><?php echo esc_html__( 'Getting things ready', 'elementor' ); ?></p>
			<p class="e-from-onboarding-subtext"><?php echo esc_html__( 'Tailoring the editor to your goals and workflow…', 'elementor' ); ?></p>
		</div>
		<?php
	}
}
