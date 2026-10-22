<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scanner_Report_Store {

	const OPTION_LAST_REPORT = 'elementor_agents_scanner_last_report';

	const TRANSIENT_RETRY_AT = 'elementor_agents_scanner_retry_at';

	const DEFAULT_COOLDOWN = 300;

	const REPORT_FIELDS = [ 'score', 'scannedAt', 'retryAt', 'layers', 'checks' ];

	const CHECK_FIELDS = [
		'id',
		'label',
		'description',
		'layer',
		'tier',
		'status',
		'earned',
		'possible',
		'maxScore',
		'bonus',
		'scorable',
		'message',
		'fix',
	];

	public function get_last_report(): ?array {
		$report = get_option( self::OPTION_LAST_REPORT, null );

		return is_array( $report ) ? $report : null;
	}

	public function save_report( array $report ): array {
		$trimmed = $this->trim_report( $report );

		update_option( self::OPTION_LAST_REPORT, $trimmed, false );

		return $trimmed;
	}

	public function get_retry_at(): ?int {
		$retry_at = (int) get_transient( self::TRANSIENT_RETRY_AT );

		return $retry_at > time() ? $retry_at : null;
	}

	public function start_cooldown( int $retry_at ): void {
		$ttl = $retry_at - time();

		if ( $ttl <= 0 ) {
			return;
		}

		set_transient( self::TRANSIENT_RETRY_AT, $retry_at, $ttl );
	}

	public function get_report_retry_at( array $report ): int {
		$retry_at = is_string( $report['retryAt'] ?? null ) ? strtotime( $report['retryAt'] ) : false;

		return false !== $retry_at && $retry_at > time()
			? $retry_at
			: time() + self::DEFAULT_COOLDOWN;
	}

	private function trim_report( array $report ): array {
		$trimmed = array_intersect_key( $report, array_flip( self::REPORT_FIELDS ) );
		$checks = is_array( $report['checks'] ?? null ) ? $report['checks'] : [];

		$trimmed['checks'] = array_values( array_map(
			fn( $check ) => array_intersect_key( (array) $check, array_flip( self::CHECK_FIELDS ) ),
			$checks
		) );

		return $trimmed;
	}
}
