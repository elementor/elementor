<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class LLM_Schema_Filter {

	public function apply( array $schema ): array {
		return $this->walk( $schema, $this->initial_context() );
	}

	/**
	 * @param array $branches The current `anyOf` branches.
	 * @param mixed $context  Context propagated from ancestors.
	 *
	 * @return array{0: array, 1: mixed} Tuple of [ filtered_branches, child_context ].
	 */
	abstract protected function filter_branches( array $branches, $context ): array;

	protected function initial_context() {
		return null;
	}

	private function walk( array $schema, $context ): array {
		if ( isset( $schema['anyOf'] ) && is_array( $schema['anyOf'] ) ) {
			[ $branches, $child_context ] = $this->filter_branches( $schema['anyOf'], $context );

			$schema['anyOf'] = array_values( array_map(
				fn( $branch ) => is_array( $branch ) ? $this->walk( $branch, $child_context ) : $branch,
				$branches
			) );
		}

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $key => $value ) {
				if ( is_array( $value ) ) {
					$schema['properties'][ $key ] = $this->walk( $value, $context );
				}
			}
		}

		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = $this->walk( $schema['items'], $context );
		}

		return $schema;
	}
}
