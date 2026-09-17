<?php

namespace Elementor\Core\Common\Modules\EventsManager;

use ElementorDeps\Mixpanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Server_Events_Client {

	public static function track( string $event_name, array $properties = [] ): bool {
		// The SDK is bundled via php-scoper (see php-scoper/mixpanel-inc.php), so this is only
		// a defensive guard in case the prefixed dependency is ever missing from the build.
		if ( ! class_exists( Mixpanel::class ) ) {
			return false;
		}

		try {
			// The SDK's own instance getter is itself a singleton keyed by token - it returns the
			// existing instance or creates a new one if it doesn't exist yet.
			$client = Mixpanel::getInstance( ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN, [
				'host' => Module::get_mixpanel_api_host(),
				'consumer' => 'wp',
				'consumers' => [
					'wp' => Wp_Http_Consumer::class,
				],
			] );

			$client->track( $event_name, $properties );

			return true;
		} catch ( \Throwable $e ) {
			return false;
		}
	}
}
