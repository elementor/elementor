<?php

namespace Elementor\Modules\AtomicWidgets\Styles\Transformers;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Array_Transformer extends Style_Transformer_Base {

	public static function type(): string {
		return 'array';
	}

	/**
	 * @param array{array: array<int, mixed>, delimiter: ?string} $value
	 * @param callable $transform
	 * @return string
	 */
	public function transform( $value, callable $transform ): string {
		try {
			$array = $value['array'];
			$delimiter = $value['delimiter'] ?? ' ';

			$str = implode( $delimiter, array_map( $transform, $array ) );

			return $str;
		} catch ( \Exception $e ) {
			throw new \Exception( 'Invalid array or delimited' );
		}
	}
}
