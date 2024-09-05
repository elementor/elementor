<?php

namespace Elementor\Modules\AtomicWidgets\Styles\Transformers;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Transformer extends Style_Transformer_Base {

	public static function type(): string {
		return 'size';
	}

	/**
	 * @param array{size: int, unit: string} $value
	 * @param callable $transform
	 * @return string
	 */
	public function transform( $value, callable $transform ): string {
		$size = (int) $value['size'];
		$unit = $value['unit'];

		return $size . $unit;
	}
}
