<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Editor_Loading_Handler;
use Elementor\App\Modules\E_Onboarding\Module;
use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Editor_Loading_Handler extends Elementor_Test_Base {

	private Onboarding_Progress_Manager $progress_manager;

	public function setUp(): void {
		parent::setUp();

		$this->progress_manager = Onboarding_Progress_Manager::instance();
		$this->progress_manager->reset();

		wp_register_style( Module::FONTS_STYLE_HANDLE, Module::FONTS_STYLE_URL, [], 'test' );
	}

	public function tearDown(): void {
		$this->progress_manager->reset();

		parent::tearDown();
	}

	private function make_handler(): Editor_Loading_Handler {
		return new Editor_Loading_Handler( $this->progress_manager );
	}

	private function simulate_new_request( Editor_Loading_Handler $previous_handler ): Editor_Loading_Handler {
		wp_dequeue_style( 'elementor-onboarding-editor-loading' );
		remove_action( 'elementor/editor/v2/loading_content_from_onboarding', [ $previous_handler, 'render_loading_content' ] );

		return $this->make_handler();
	}

	public function test_maybe_setup_does_nothing_when_no_pending_redirect() {
		// Arrange
		$handler = $this->make_handler();

		// Act
		ob_start();
		$handler->maybe_setup();
		ob_get_clean();

		// Assert
		$this->assertFalse( wp_style_is( 'elementor-onboarding-editor-loading', 'enqueued' ) );
	}

	public function test_maybe_setup_enqueues_styles_when_pending_redirect() {
		// Arrange
		$this->progress_manager->update_progress( [ 'complete' => true ] );
		$handler = $this->make_handler();

		// Act
		$handler->maybe_setup();

		// Assert
		$this->assertTrue( wp_style_is( 'elementor-onboarding-editor-loading', 'enqueued' ) );
		$this->assertTrue( wp_style_is( 'elementor-onboarding-fonts', 'enqueued' ) );
	}

	public function test_maybe_setup_clears_pending_redirect_flag() {
		// Arrange
		$this->progress_manager->update_progress( [ 'complete' => true ] );
		$handler = $this->make_handler();

		// Act
		$handler->maybe_setup();

		// Assert
		$progress = $this->progress_manager->get_progress();
		$this->assertFalse( $progress->is_pending_editor_redirect() );
	}

	public function test_maybe_setup_registers_render_action() {
		// Arrange
		$this->progress_manager->update_progress( [ 'complete' => true ] );
		$handler = $this->make_handler();

		// Act
		$handler->maybe_setup();

		// Assert
		$this->assertNotFalse( has_action( 'elementor/editor/v2/loading_content_from_onboarding', [ $handler, 'render_loading_content' ] ) );
	}

	public function test_maybe_setup_does_not_run_again_on_second_editor_load() {
		// Arrange
		$this->progress_manager->update_progress( [ 'complete' => true ] );
		$first_handler = $this->make_handler();
		$first_handler->maybe_setup();

		$second_handler = $this->simulate_new_request( $first_handler );

		// Act
		$second_handler->maybe_setup();

		// Assert
		$this->assertFalse( wp_style_is( 'elementor-onboarding-editor-loading', 'enqueued' ) );
		$this->assertFalse( has_action( 'elementor/editor/v2/loading_content_from_onboarding', [ $second_handler, 'render_loading_content' ] ) );
	}
}
