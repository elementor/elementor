<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tool_Performance_Metrics {

	public static function duration_ms_since( int $started_at ): int {
		return (int) round( ( hrtime( true ) - $started_at ) / 1_000_000 );
	}

	public static function resolve_status( array $response, ?\WP_Error $top_level_error ): array {
		if ( null !== $top_level_error ) {
			return [
				'status'     => 'error',
				'error_code' => $top_level_error->get_error_code(),
			];
		}

		$batch_status = $response['status'] ?? 'error';

		if ( 'ok' === $batch_status ) {
			$status = 'success';
		} elseif ( 'partial_error' === $batch_status ) {
			$status = 'partial';
		} else {
			$status = 'error';
		}

		return [
			'status'     => $status,
			'error_code' => null,
		];
	}
}
