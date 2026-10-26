<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Frontend;

use Elementor\Core\Frontend\Performance;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Performance extends Elementor_Test_Base {

	private $original_parse_request_count;

	public function setUp(): void {
		parent::setUp();

		global $wp_actions;

		$this->original_parse_request_count = $wp_actions['parse_request'] ?? null;

		$this->set_cached_is_frontend( null );
	}

	public function tearDown(): void {
		global $wp_actions;

		if ( null === $this->original_parse_request_count ) {
			unset( $wp_actions['parse_request'] );
		} else {
			$wp_actions['parse_request'] = $this->original_parse_request_count;
		}

		set_current_screen( 'front' );

		$this->set_cached_is_frontend( null );

		parent::tearDown();
	}

	public function test_should_optimize_controls__does_not_cache_frontend_before_parse_request() {
		// Arrange.
		$this->set_parse_request_did_run( false );

		// Act.
		$result = Performance::should_optimize_controls();

		// Assert.
		$this->assertTrue( $result );
		$this->assertNull( $this->get_cached_is_frontend() );
	}

	public function test_should_optimize_controls__caches_frontend_after_parse_request() {
		// Arrange.
		$this->set_parse_request_did_run( true );

		// Act.
		$result = Performance::should_optimize_controls();

		// Assert.
		$this->assertTrue( $result );
		$this->assertTrue( $this->get_cached_is_frontend() );
	}

	public function test_should_optimize_controls__caches_admin_before_parse_request() {
		// Arrange.
		$this->set_parse_request_did_run( false );
		set_current_screen( 'dashboard' );

		// Act.
		$result = Performance::should_optimize_controls();

		// Assert.
		$this->assertFalse( $result );
		$this->assertFalse( $this->get_cached_is_frontend() );
	}

	private function set_parse_request_did_run( bool $did_run ): void {
		global $wp_actions;

		if ( $did_run ) {
			$wp_actions['parse_request'] = 1;
		} else {
			unset( $wp_actions['parse_request'] );
		}
	}

	private function get_cached_is_frontend() {
		return $this->get_is_frontend_property()->getValue();
	}

	private function set_cached_is_frontend( $value ): void {
		$this->get_is_frontend_property()->setValue( null, $value );
	}

	private function get_is_frontend_property(): \ReflectionProperty {
		$property = new \ReflectionProperty( Performance::class, 'is_frontend' );

		if ( PHP_VERSION_ID < 80100 ) {
			$property->setAccessible( true );
		}

		return $property;
	}
}
