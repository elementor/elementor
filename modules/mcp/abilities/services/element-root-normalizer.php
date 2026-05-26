<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ensures every root-level widget has a container parent.
 *
 * Elementor v4 documents must have container-like nodes at the root; loose widgets
 * (`elType === 'widget'`) render incorrectly when written as top-level siblings of
 * containers. This normalizer scans the resolved top-level array and wraps each
 * run of consecutive root widgets in a new `e-div-block`. Deeper levels are left
 * alone — a widget child of an existing container already has a container parent.
 *
 * Runs after `Element_Spec_Resolver` (so `elType` is reliable) and before
 * `Element_Css_Transformer` (so wrapper nodes flow through normal id/CSS handling).
 */
class Element_Root_Normalizer {

	private const WRAPPER_TYPE = 'e-div-block';

	private array $normalizations = [];

	public static function make(): self {
		return new self();
	}

	/**
	 * @return array{elements: array, normalizations: array}
	 */
	public function normalize( array $elements ): array {
		$this->normalizations = [];

		$result = [];
		$pending = [];

		foreach ( $elements as $node ) {
			if ( ! is_array( $node ) ) {
				continue;
			}

			if ( $this->is_container( $node ) ) {
				$this->flush_pending( $pending, $result );
				$result[] = $node;
				continue;
			}

			$pending[] = $node;
		}

		$this->flush_pending( $pending, $result );

		return [
			'elements' => $result,
			'normalizations' => $this->normalizations,
		];
	}

	private function is_container( array $node ): bool {
		if ( ! isset( $node['elType'] ) || ! is_string( $node['elType'] ) ) {
			return false;
		}

		return 'widget' !== $node['elType'];
	}

	private function flush_pending( array &$pending, array &$result ): void {
		if ( empty( $pending ) ) {
			return;
		}

		$wrapper_id = Atomic_Utils::generate_id();

		$result[] = [
			'id' => $wrapper_id,
			'elType' => self::WRAPPER_TYPE,
			'settings' => [],
			'elements' => $pending,
		];

		$this->normalizations[] = [
			'reason' => 'root_widget_wrapped',
			'wrapper_id' => $wrapper_id,
			'wrapper_type' => self::WRAPPER_TYPE,
			'wrapped_count' => count( $pending ),
		];

		$pending = [];
	}
}
