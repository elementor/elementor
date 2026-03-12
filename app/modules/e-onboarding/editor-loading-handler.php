<?php

namespace Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Loading_Handler {

	private Onboarding_Progress_Manager $progress_manager;

	public function __construct( Onboarding_Progress_Manager $progress_manager ) {
		$this->progress_manager = $progress_manager;
	}

	public function maybe_setup(): void {
		$progress = $this->progress_manager->get_progress();

		if ( ! $progress->is_pending_editor_redirect() ) {
			return;
		}

		add_action( 'elementor/editor/v2/loading_content_from_onboarding', [ $this, 'render_loading_content' ] );

		$this->enqueue_styles();

		$this->reset_pending_redirect( $progress );
	}

	private function enqueue_styles(): void {
		wp_enqueue_style(
			'elementor-onboarding-editor-loading',
			ELEMENTOR_URL . 'assets/css/modules/e-onboarding/editor-loading.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style( Module::FONTS_STYLE_HANDLE );
	}

	private function reset_pending_redirect( $progress ): void {
		$progress->set_pending_editor_redirect( false );
		$this->progress_manager->save_progress( $progress );
	}

	public function render_loading_content(): void {
		?>
		<div class="e-from-onboarding-track"><div class="e-from-onboarding-fill"></div></div>
		<div class="e-from-onboarding-text">
			<p class="e-from-onboarding-heading"><?php echo esc_html__( 'Getting things ready', 'elementor' ); ?></p>
			<p class="e-from-onboarding-subtext"><?php echo esc_html__( 'Tailoring the editor to your goals and workflow…', 'elementor' ); ?></p>
		</div>
		<?php
	}
}
