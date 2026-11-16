<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventsManager;

use Elementor\Core\Common\Modules\EventsManager\Server_Events_Client;
use ElementorDeps\Mixpanel;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Server_Events_Client extends Elementor_Test_Base {

	const REMOTE_API_HOST = 'https://api-eu.mixpanel.com';

	public function setUp(): void {
		parent::setUp();

		update_option( '_elementor_mixpanel_config', [
			'timeout' => current_time( 'timestamp' ) + HOUR_IN_SECONDS,
			'value' => wp_json_encode( [ [ 'apiHost' => self::REMOTE_API_HOST ] ] ),
		] );
	}

	public function test_track_sends_batch_to_the_configured_api_host() {
		// Arrange
		$captured_urls = [];

		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( &$captured_urls ) {
			$captured_urls[] = $url;

			return [
				'response' => [ 'code' => 200 ],
				'body' => '1',
			];
		}, 10, 3 );

		// Act
		$tracked = Server_Events_Client::track( 'test_event', [ 'distinct_id' => 'user-1' ] );
		Mixpanel::getInstance( ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN )->flush();

		// Assert
		$this->assertTrue( $tracked );
		$this->assertSame( [ self::REMOTE_API_HOST . '/track' ], $captured_urls );
	}
}
