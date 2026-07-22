<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Bulk_Operations_Result {

	private array $rows = [];

	public function add_success( int $index, string $action, array $extra = [] ): void {
		$this->rows[ $index ] = array_merge(
			[
				'index' => $index,
				'action' => $action,
				'status' => 'ok',
			],
			$extra
		);
	}

	public function add_error( int $index, string $action, string $code, string $message ): void {
		$this->rows[ $index ] = [
			'index' => $index,
			'action' => $action,
			'status' => 'error',
			'code' => $code,
			'message' => $message,
		];
	}

	public function has( int $index ): bool {
		return isset( $this->rows[ $index ] );
	}

	public function to_array(): array {
		ksort( $this->rows );

		$results = array_values( $this->rows );
		$ok_count = 0;
		$error_count = 0;

		foreach ( $results as $result ) {
			if ( 'ok' === ( $result['status'] ?? '' ) ) {
				$ok_count++;
			} else {
				$error_count++;
			}
		}

		$status = 'ok';
		if ( $ok_count > 0 && $error_count > 0 ) {
			$status = 'partial_error';
		} elseif ( 0 === $ok_count && $error_count > 0 ) {
			$status = 'error';
		}

		return [
			'status' => $status,
			'results' => $results,
		];
	}
}
