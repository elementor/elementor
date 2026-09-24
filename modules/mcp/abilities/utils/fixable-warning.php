<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Fixable_Warning {

	public static function push(
		array &$warnings,
		array &$warning_codes,
		array &$warning_details,
		string $code,
		string $config_id,
		string $detail
	): string {
		$message = sprintf( 'fixable: [%s] %s', $config_id, $detail );
		$warnings[] = $message;
		$warning_codes[] = $code;
		$warning_details[] = [
			'code' => $code,
			'config_id' => $config_id,
			'message' => $message,
		];

		return $message;
	}
}
