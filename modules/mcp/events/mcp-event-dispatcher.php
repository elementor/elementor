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

	const FEATURE_NAME_COMPONENTS = 'Components';

	private const ENVELOPE_KEYS = [
		'app_type',
		'window_name',
		'interaction_type',
		'target_type',
		'target_location',
		'target_name',
		'executed_by',
		'interaction_result',
	];

	/**
	 * Per ED-25569: keys copied into the metadata object for warehouse parsing.
	 * All other non-envelope fields from emit() remain top-level DB columns.
	 *
	 * @var array<string, string[]|null>
	 */
	private const METADATA_KEYS_BY_RESULT = [
		'class_created'              => [ 'name' ],
		'class_applied'              => null,
		'component_created'          => [
			'name',
			'nested_components_count',
			'nested_elements_count',
			'top_element_type',
			'feature_name',
		],
		'component_instance_added'   => [
			'name',
			'top_element_type',
			'feature_name',
		],
		'variable_created'           => [ 'name', 'var_type' ],
		'variable_updated'           => [ 'name', 'var_type' ],
		'variable_connected'         => [ 'var_type', 'control_path' ],
		'element_added'              => [ 'element_name' ],
		'interaction_created'        => [ 'affected_element_type', 'interaction_trigger', 'interaction_effect' ],
		'interaction_updated'        => [ 'affected_element_type', 'interaction_trigger', 'interaction_effect' ],
		'interactions_cleared'       => [ 'affected_element_type', 'target_value' ],
	];

	private const COMPONENT_RESULTS = [
		'component_created',
		'component_instance_added',
	];

	/** @var callable|null Test-only interceptor. When set, replaces the Mixpanel dispatch. */
	private static $interceptor = null;

	public static function set_interceptor( ?callable $interceptor ): void {
		self::$interceptor = $interceptor;
	}

	public static function emit( string $interaction_result, array $extra = [] ): void {
		$payload = [
			'app_type'           => self::APP_TYPE,
			'window_name'        => self::WINDOW_NAME,
			'interaction_type'   => self::INTERACTION_TYPE,
			'target_type'        => self::TARGET_TYPE,
			'target_location'    => self::TARGET_LOCATION,
			'target_name'        => self::TARGET_NAME,
			'executed_by'        => self::EXECUTED_BY,
			'interaction_result' => $interaction_result,
		];

		$metadata_merge = [];

		foreach ( $extra as $key => $value ) {
			if ( in_array( $key, self::ENVELOPE_KEYS, true ) ) {
				$payload[ $key ] = $value;
				continue;
			}

			if ( 'metadata' === $key && is_array( $value ) ) {
				$metadata_merge = array_merge( $metadata_merge, $value );
				continue;
			}

			$payload[ $key ] = $value;
		}

		$metadata = self::build_metadata( $interaction_result, $extra, $metadata_merge );

		if ( [] !== $metadata ) {
			$payload['metadata'] = $metadata;
		}

		try {
			if ( null !== self::$interceptor ) {
				( self::$interceptor )( $interaction_result, $payload );
				return;
			}

			Events_Manager_Module::dispatch_event( $interaction_result, $payload );
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
		}
	}

	private static function build_metadata( string $interaction_result, array $extra, array $metadata_merge ): array {
		$key_list = self::METADATA_KEYS_BY_RESULT[ $interaction_result ] ?? null;

		if ( null === $key_list ) {
			return [];
		}

		$metadata = [];

		foreach ( $key_list as $key ) {
			if ( array_key_exists( $key, $extra ) ) {
				$metadata[ $key ] = $extra[ $key ];
			}
		}

		if ( in_array( $interaction_result, self::COMPONENT_RESULTS, true ) ) {
			$metadata['feature_name'] = self::FEATURE_NAME_COMPONENTS;
		}

		return array_merge( $metadata, $metadata_merge );
	}
}
