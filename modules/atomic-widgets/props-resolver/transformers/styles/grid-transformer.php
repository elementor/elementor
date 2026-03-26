<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Grid_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$columns = isset( $value['columnsCount'] ) ? max( 1, (int) $value['columnsCount'] ) : 3;
		$rows = isset( $value['rowsCount'] ) ? max( 1, (int) $value['rowsCount'] ) : 2;

		$columns_template = $this->get_string( $value['columnsTemplate'] ?? '' );
		$rows_template = $this->get_string( $value['rowsTemplate'] ?? '' );

		$col_css = '' !== $columns_template
			? $columns_template
			: 'repeat(' . $columns . ', 1fr)';

		$row_css = '' !== $rows_template
			? $rows_template
			: 'repeat(' . $rows . ', 1fr)';

		$out = [
			'grid-template-columns' => $col_css,
			'grid-template-rows' => $row_css,
		];

		$column_gap = $value['columnGap'] ?? null;
		$row_gap = $value['rowGap'] ?? null;

		if ( null !== $column_gap && '' !== $column_gap ) {
			$out['column-gap'] = $column_gap;
		}

		if ( null !== $row_gap && '' !== $row_gap ) {
			$out['row-gap'] = $row_gap;
		}

		$flow = $this->get_string( $value['autoFlow'] ?? 'row' );
		$allowed_flow = [ 'row', 'column', 'dense', 'row dense', 'column dense' ];

		$out['grid-auto-flow'] = in_array( $flow, $allowed_flow, true ) ? $flow : 'row';

		return Multi_Props::generate( $out );
	}

	private function get_string( $v ): string {
		if ( is_string( $v ) ) {
			return $v;
		}

		return '';
	}
}
