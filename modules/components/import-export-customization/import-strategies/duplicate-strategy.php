<?php

namespace Elementor\Modules\Components\ImportExportCustomization\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Duplicate_Strategy implements Import_Strategy_Interface {
	private Components_Repository $repository;

	public function __construct( Components_Repository $repository ) {
		$this->repository = $repository;
	}

	public static function get_name(): string {
		return 'duplicate';
	}

	public function resolve( array $record ): Import_Strategy_Result {
		$uid = $record['uid'] ?? '';
		$existing_component = $uid ? $this->repository->find_by_uid( $uid ) : null;

		if ( $existing_component ) {
			$uid = wp_generate_uuid4();
		}

		return Import_Strategy_Result::for_create( $uid );
	}
}
