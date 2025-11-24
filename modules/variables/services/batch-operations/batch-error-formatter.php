<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Exception;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;

class BatchErrorFormatter {

	private const STATUS_MAP = [
		RecordNotFound::class => 404,
		DuplicatedLabel::class => 400,
		VariablesLimitReached::class => 400,
	];

	private const ERROR_CODE_MAP = [
		VariablesLimitReached::class => 'invalid_variable_limit_reached',
		DuplicatedLabel::class => 'duplicated_label',
		RecordNotFound::class => 'variable_not_found',
	];

	public function status_for( Exception $e ): int {
		foreach ( self::STATUS_MAP as $class => $status ) {
			if ( $e instanceof $class ) {
				return $status;
			}
		}

		return 500;
	}

	public function error_code_for( Exception $e ): string {
		foreach ( self::ERROR_CODE_MAP as $class => $code ) {
			if ( $e instanceof $class ) {
				return $code;
			}
		}

		return 'unexpected_server_error';
	}
}
