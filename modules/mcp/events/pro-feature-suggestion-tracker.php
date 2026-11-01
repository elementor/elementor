<?php

namespace Elementor\Modules\Mcp\Events;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Feature_Suggestion_Tracker {

	const EVENT_NAME = 'mcp_pro_feature_suggested';

	const SESSION_ID_SERVER_KEY = 'HTTP_MCP_SESSION_ID';

	const LICENSE_TIER_EXPIRED = 'expired';

	/** @var array[] */
	private static array $suggestions = [];

	public static function reset(): void {
		self::$suggestions = [];
	}

	public static function record( \WP_Error $error ): void {
		self::$suggestions[] = self::extract_suggestion( $error );
	}

	public static function flush( string $tool_name, $result ): void {
		$suggestions = self::resolve_returned_suggestions( $result );

		self::reset();

		if ( [] === $suggestions ) {
			return;
		}

		Mcp_Event_Dispatcher::emit( self::EVENT_NAME, self::build_payload( $tool_name, $suggestions ) );
	}

	private static function resolve_returned_suggestions( $result ): array {
		if ( ! is_wp_error( $result ) ) {
			return self::$suggestions;
		}

		if ( Pro_Features_Discovery::ERROR_CODE !== $result->get_error_code() ) {
			return [];
		}

		return [ self::extract_suggestion( $result ) ];
	}

	private static function extract_suggestion( \WP_Error $error ): array {
		$data = $error->get_error_data();

		return [
			'pro_feature'    => $data['pro_feature'] ?? '',
			'upgrade_url'    => $data['upgrade_url'] ?? '',
			'document_types' => $data['document_types'] ?? [],
		];
	}

	private static function build_payload( string $tool_name, array $suggestions ): array {
		$pro_features   = array_values( array_unique( array_column( $suggestions, 'pro_feature' ) ) );
		$document_types = array_values( array_unique( array_merge( ...array_column( $suggestions, 'document_types' ) ) ) );
		$session_id     = Utils::get_super_global_value( $_SERVER, self::SESSION_ID_SERVER_KEY );

		$payload = [
			'tool_name'    => $tool_name,
			'pro_feature'  => $pro_features[0],
			'pro_features' => $pro_features,
			'upgrade_url'  => $suggestions[0]['upgrade_url'],
			'license_tier' => self::get_license_tier(),
		];

		if ( $document_types ) {
			$payload['document_types'] = $document_types;
		}

		if ( $session_id ) {
			$payload['mcp_session_id'] = $session_id;
		}

		return $payload;
	}

	private static function get_license_tier(): string {
		return Utils::is_license_expired() ? self::LICENSE_TIER_EXPIRED : Utils::get_license_access_tier();
	}
}
