<?php

namespace Elementor\Modules\GuidedTours;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Progress_Manager {
	const USER_META_KEY = 'elementor_guided_tours';

	const STATUS_COMPLETED = 'completed';
	const STATUS_DISMISSED = 'dismissed';
	const STATUS_IN_PROGRESS = 'in_progress';

	public function get_progress( string $tour_id, int $version ): array {
		$progress = get_user_meta( get_current_user_id(), self::USER_META_KEY, true );
		$tour_progress = is_array( $progress ) ? ( $progress[ $tour_id ] ?? [] ) : [];

		if ( (int) ( $tour_progress['version'] ?? 0 ) !== $version ) {
			return [];
		}

		return $tour_progress;
	}

	public function is_completed( string $tour_id, int $version ): bool {
		$progress = $this->get_progress( $tour_id, $version );

		return self::STATUS_COMPLETED === ( $progress['status'] ?? null );
	}

	public function should_suppress_tour( string $tour_id, int $version ): bool {
		$progress = $this->get_progress( $tour_id, $version );
		$status = $progress['status'] ?? null;

		return in_array( $status, [ self::STATUS_COMPLETED, self::STATUS_DISMISSED ], true );
	}

	public function update( string $tour_id, int $version, string $status, string $step_id ): bool {
		if ( ! in_array( $status, [ self::STATUS_COMPLETED, self::STATUS_DISMISSED, self::STATUS_IN_PROGRESS ], true ) ) {
			return false;
		}

		$progress = get_user_meta( get_current_user_id(), self::USER_META_KEY, true );
		$progress = is_array( $progress ) ? $progress : [];
		$tour_id = sanitize_key( $tour_id );
		$current_progress = $progress[ $tour_id ] ?? [];

		if (
			(int) ( $current_progress['version'] ?? 0 ) === $version &&
			in_array( $current_progress['status'] ?? null, [ self::STATUS_COMPLETED, self::STATUS_DISMISSED ], true ) &&
			self::STATUS_IN_PROGRESS === $status
		) {
			return true;
		}

		$tour_progress = [
			'status' => $status,
			'version' => $version,
			'step_id' => sanitize_key( $step_id ),
		];

		if ( $current_progress === $tour_progress ) {
			return true;
		}

		$progress[ $tour_id ] = $tour_progress;

		return false !== update_user_meta( get_current_user_id(), self::USER_META_KEY, $progress );
	}
}
