<?php

namespace Elementor\Modules\Components\ImportExport\ImportStrategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Import_Strategy_Interface {
	public function resolve( array $record ): Import_Strategy_Result;
}
