<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\System_Info\Reporters;

use Elementor\Modules\System_Info\Reporters\User;
use Elementor\Testing\Elementor_Test_Base;

class Test_User extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Modules\System_Info\Reporters\User
	 */
	private $reporter;

	public function setUp() {
		parent::setUp();

		$this->reporter = new User();
	}

	public function test_is_enabled__ensure_false_without_user() {
		// Arrange.
		wp_set_current_user( 0 );

		// Act + Assert.
		$this->assertFalse( $this->reporter->is_enabled() );
	}

	public function test_is_enabled__ensure_true_with_user() {
		// Arrange.
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		// Act + Assert.
		$this->assertTrue( $this->reporter->is_enabled() );
	}
}
