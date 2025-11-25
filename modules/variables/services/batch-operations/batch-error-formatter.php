<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Exception;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;

class Batch_Error_Formatter {

	private const ERROR_MAP = [
		RecordNotFound::class => [
			'code' => 'variable_not_found',
			'status' => 404,
		],
		DuplicatedLabel::class => [
			'code' => 'duplicated_label',
			'status' => 400,
		],
		VariablesLimitReached::class => [
			'code' => 'invalid_variable_limit_reached',
			'status' => 400,
		],
	];

	public function status_for( Exception $e ): int {
		foreach ( self::ERROR_MAP as $class => $map ) {
			if ( $e instanceof $class ) {
				return $map['status'];
			}
		}

		return 500;
	}

	public function error_code_for( Exception $e ): string {
		foreach ( self::ERROR_MAP as $class => $map ) {
			if ( $e instanceof $class ) {
				return $map['code'];
			}
		}

		return 'unexpected_server_error';
	}
}
