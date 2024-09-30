<?php

namespace Elementor\Modules\AtomicWidgets\Styles\Transformers;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Linked_Dimensions_Transformer extends Style_Transformer_Base {

	public static function type(): string {
		return 'linked-dimensions';
	}

	/**
	 * @param array{isLinked: boolean, top: mixed, right: mixed, bottom: mixed, left: mixed} $value
	 * @param callable $transform
	 * @return string
	 */
	public function transform( $value, callable $transform ): string {
		$top = ( isset( $value['top'] ) ? $transform( $value['top'] ) : null ) ?? 'unset';
		$right = ( isset( $value['right'] ) ? $transform( $value['right'] ) : null ) ?? 'unset';
		$bottom = ( isset( $value['bottom'] ) ? $transform( $value['bottom'] ) : null ) ?? 'unset';
		$left = ( isset( $value['left'] ) ? $transform( $value['left'] ) : null ) ?? 'unset';

		return "{$top} {$right} {$bottom} {$left}";
	}
}
