<?php

namespace Elementor\Modules\CompositeWidgets\ClosedStructure;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Walking up from an element, the first boundary decides: a widget root with a registered
 * definition closes its subtree, an open slot opens it again.
 */
class Closed_Structure {
	const ERROR_CODE = 'elementor_widget_structure_closed';
	const DOCUMENT_ROOT_ID = 'document';

	private Widgets_Definitions_Registry $registry;

	public function __construct( Widgets_Definitions_Registry $registry ) {
		$this->registry = $registry;
	}

	public function is_closed_element( array $tree, string $element_id ): bool {
		$path = $this->find_path( $tree, $element_id );

		if ( null === $path ) {
			return false;
		}

		array_pop( $path );

		return $this->is_closed_by( $path );
	}

	public function is_closed_target( array $tree, string $parent_id ): bool {
		if ( self::DOCUMENT_ROOT_ID === $parent_id ) {
			return false;
		}

		$path = $this->find_path( $tree, $parent_id );

		return null !== $path && $this->is_closed_by( $path );
	}

	public function element_error( string $element_id ): \WP_Error {
		return new \WP_Error(
			self::ERROR_CODE,
			sprintf(
				/* translators: %s: element ID */
				__( 'Element "%s" is inside a widget, so it can’t be moved, duplicated or deleted. Use action=update to change its content or styles.', 'elementor' ),
				$element_id
			),
			[
				'status' => \WP_Http::BAD_REQUEST,
				'element_id' => $element_id,
			]
		);
	}

	public function target_error( string $parent_id ): \WP_Error {
		return new \WP_Error(
			self::ERROR_CODE,
			$this->target_error_message( $parent_id ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	public function target_error_message( string $parent_id ): string {
		return sprintf(
			/* translators: %s: parent element ID */
			__( 'Element "%s" is inside a widget, so elements can’t be added to it or moved into it.', 'elementor' ),
			$parent_id
		);
	}

	private function is_closed_by( array $ancestors ): bool {
		foreach ( array_reverse( $ancestors ) as $node ) {
			if ( $this->is_slot( $node ) ) {
				return false;
			}

			if ( $this->is_registered_widget_root( $node ) ) {
				return true;
			}
		}

		return false;
	}

	private function is_slot( array $node ): bool {
		return Widget_Markers::sanitize_slot( $node[ Widget_Markers::SLOT_KEY ] ?? null )
			&& '' !== Widget_Markers::sanitize_part( $node[ Widget_Markers::PART_KEY ] ?? null );
	}

	private function is_registered_widget_root( array $node ): bool {
		$marker = Widget_Markers::sanitize_widget( $node[ Widget_Markers::WIDGET_KEY ] ?? null );

		return ! empty( $marker ) && null !== $this->registry->get( $marker['id'] );
	}

	/**
	 * @return array[]|null Nodes from the top of the tree down to the element, the element included.
	 */
	private function find_path( array $elements, string $element_id ): ?array {
		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( ( $element['id'] ?? null ) === $element_id ) {
				return [ $element ];
			}

			$path = $this->find_path( $element['elements'] ?? [], $element_id );

			if ( null !== $path ) {
				return array_merge( [ $element ], $path );
			}
		}

		return null;
	}
}
