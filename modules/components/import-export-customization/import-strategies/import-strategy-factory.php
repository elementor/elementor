<?php

namespace Elementor\Modules\Components\ImportExportCustomization\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Strategy_Factory {
	const DEFAULT_STRATEGY = 'duplicate';

	private Components_Repository $repository;

	public function __construct( Components_Repository $repository ) {
		$this->repository = $repository;
	}

	public function create( ?string $strategy_name ): Import_Strategy_Interface {
		switch ( $strategy_name ) {
			case Duplicate_Strategy::get_name():
			default:
				return new Duplicate_Strategy( $this->repository );
		}
	}
}
