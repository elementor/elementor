<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\LLM_Schema_Filter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class LLM_Schema_Dedupe_Filter extends LLM_Schema_Filter {
	private const DYNAMIC_KEY = 'dynamic';

	protected function initial_context() {
		return false;
	}

	protected function filter_branches( array $branches, $context ): array {
		$ancestor_offers_dynamic = (bool) $context;
		$branch_offers_dynamic = $ancestor_offers_dynamic || $this->contains_dynamic_branch( $branches );

		$filtered = [];

		foreach ( $branches as $branch ) {
			if ( $this->is_dynamic_branch( $branch ) ) {
				if ( ! $ancestor_offers_dynamic ) {
					$filtered[] = $branch;
				}

				continue;
			}

			$filtered[] = $branch;
		}

		return [ $filtered, $branch_offers_dynamic ];
	}

	private function is_dynamic_branch( $branch ): bool {
		if ( ! is_array( $branch ) ) {
			return false;
		}

		return ( $branch['properties']['$$type']['const'] ?? null ) === self::DYNAMIC_KEY;
	}

	private function contains_dynamic_branch( array $branches ): bool {
		foreach ( $branches as $branch ) {
			if ( $this->is_dynamic_branch( $branch ) ) {
				return true;
			}
		}

		return false;
	}
}
