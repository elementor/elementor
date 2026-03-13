<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Test_Base extends Elementor_Test_Base {

	protected Onboarding_Progress_Manager $progress_manager;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$this->progress_manager = Onboarding_Progress_Manager::instance();
		$this->progress_manager->reset();
	}

	public function tearDown(): void {
		$this->progress_manager->reset();

		parent::tearDown();
	}
}
