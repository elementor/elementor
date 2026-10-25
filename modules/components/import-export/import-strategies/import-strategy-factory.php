<?php

namespace Elementor\Modules\Components\ImportExport\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Strategy_Factory {
	public static function make( ?string $strategy_name = null ): Import_Strategy_Interface {
		switch ( $strategy_name ?? Duplicate_Strategy::NAME ) {
			case Duplicate_Strategy::NAME:
			default:
				return new Duplicate_Strategy( Components_Repository::make() );
		}
	}
}
