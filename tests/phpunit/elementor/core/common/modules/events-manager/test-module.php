<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventsManager;

use Elementor\Core\Common\Modules\EventsManager\Module as Events_Manager_Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {

	private $request_sent = false;

	public function setUp(): void {
		parent::setUp();

		$this->request_sent = false;

		// Safety net: server-side events must never trigger a real network call in tests,
		// regardless of the gating outcome.
		add_filter( 'pre_http_request', function ( $preempt ) {
			$this->request_sent = true;

			return $preempt;
		} );
	}

	/**
	 * ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN is only injected at build time (see .github/scripts/build-zip.sh),
	 * so it is always empty in the test environment, meaning can_send_events() must always gate events off here.
	 */
	public function test_can_send_events_is_false_when_token_is_empty() {
		// Arrange
		// Act
		$config = Events_Manager_Module::get_editor_events_config();

		// Assert
		$this->assertFalse( $config['can_send_events'] );
	}

	public function test_dispatch_event_is_a_safe_noop_when_events_cannot_be_sent() {
		// Arrange
		// Act
		Events_Manager_Module::dispatch_event( 'test_event', [ 'foo' => 'bar' ] );

		// Assert
		$this->assertFalse( $this->request_sent );
	}
}
