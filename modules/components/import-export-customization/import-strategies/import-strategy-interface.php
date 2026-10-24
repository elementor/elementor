<?php

namespace Elementor\Modules\Components\ImportExportCustomization\ImportStrategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Import_Strategy_Interface {
	public static function get_name(): string;

	public function resolve( array $record ): Import_Strategy_Result;
}
