<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Storage\Repository;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Test_Base extends Elementor_Test_Base {

	protected Repository $repository;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$this->repository = Repository::instance();
		$this->repository->reset();
	}

	public function tearDown(): void {
		$this->repository->reset();

		parent::tearDown();
	}
}
