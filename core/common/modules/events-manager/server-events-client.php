<?php

namespace Elementor\Core\Common\Modules\EventsManager;

use Mixpanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Thin wrapper around the third-party analytics SDK, isolating it behind an Elementor-owned API so
 * the rest of the codebase never depends on the vendor library directly.
 */
class Server_Events_Client {

	const HOST = 'api-eu.mixpanel.com';

	public static function track( string $event_name, array $properties = [] ): bool {
		// Guard against the SDK's global (non-namespaced) class colliding with another
		// plugin/theme bundling an incompatible copy of the same legacy library.
		if ( ! class_exists( 'Mixpanel' ) ) {
			return false;
		}

		try {
			// The SDK's own instance getter is itself a singleton keyed by token - it returns the
			// existing instance or creates a new one if it doesn't exist yet.
			$client = Mixpanel::getInstance( ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN, [
				'host' => self::HOST,
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
