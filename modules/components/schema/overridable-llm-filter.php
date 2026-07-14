<?php

namespace Elementor\Modules\Components\Schema;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\LLM_Schema_Filter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Overridable_LLM_Filter extends LLM_Schema_Filter {
	private const OVERRIDABLE_KEY = 'overridable';

	protected function filter_branches( array $branches, $context ): array {
		$filtered = array_values( array_filter(
			$branches,
			fn( $branch ) => ! $this->is_overridable_branch( $branch )
		) );

		return [ $filtered, $context ];
	}

	private function is_overridable_branch( $branch ): bool {
		if ( ! is_array( $branch ) ) {
			return false;
		}

		return ( $branch['properties']['$$type']['const'] ?? null ) === self::OVERRIDABLE_KEY;
	}
}
