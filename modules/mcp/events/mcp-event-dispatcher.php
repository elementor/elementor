<?php

namespace Elementor\Modules\Mcp\Events;

use Elementor\Core\Common\Modules\EventsManager\Module as Events_Manager_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Event_Dispatcher {

	const APP_TYPE         = 'editor';
	const WINDOW_NAME      = 'MCP';
	const INTERACTION_TYPE = 'MCP';
	const TARGET_TYPE      = 'MCP';
	const TARGET_LOCATION  = 'MCP';
	const TARGET_NAME      = 'MCP';
	const EXECUTED_BY      = 'mcp_tool';

	/** @var callable|null Test-only interceptor. When set, replaces the Mixpanel dispatch. */
	private static $interceptor = null;

	public static function set_interceptor( ?callable $interceptor ): void {
		self::$interceptor = $interceptor;
	}

	public static function emit( string $interaction_result, array $extra = [] ): void {
		$payload = array_merge(
			[
				'app_type'           => self::APP_TYPE,
				'window_name'        => self::WINDOW_NAME,
				'interaction_type'   => self::INTERACTION_TYPE,
				'target_type'        => self::TARGET_TYPE,
				'target_location'    => self::TARGET_LOCATION,
				'target_name'        => self::TARGET_NAME,
				'executed_by'        => self::EXECUTED_BY,
				'interaction_result' => $interaction_result,
			],
			$extra
		);

		try {
			if ( null !== self::$interceptor ) {
				( self::$interceptor )( $interaction_result, $payload );
				return;
			}

			Events_Manager_Module::dispatch_event( $interaction_result, $payload );
		} catch ( \Throwable $e ) {
			// Event emission must never affect the ability response.
		}
	}
}
