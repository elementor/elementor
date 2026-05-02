<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Non_Atomic_Widget_Validator {
	const ERROR_CODE = 'non_atomic_element_in_component';
	const WIDGET_EL_TYPE = 'widget';

	public static function make(): Non_Atomic_Widget_Validator {
		return new self();
	}

	public function validate( array $elements ): array {
		$non_atomic_elements = $this->find_non_atomic_elements( $elements );

		if ( ! empty( $non_atomic_elements ) ) {
			return $this->build_error_response( $non_atomic_elements );
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	public function validate_items( Collection $items ): array {
		foreach ( $items->all() as $item ) {
			$elements = $item['elements'] ?? [];
			$result = $this->validate( $elements );

			if ( ! $result['success'] ) {
				return $result;
			}
		}

		return [
			'success' => true,
			'messages' => [],
		];
	}

	private function find_non_atomic_elements( array $elements ): array {
		$non_atomic = [];

		foreach ( $elements as $element ) {
			$el_type = $element['elType'] ?? null;
			$widget_type = $element['widgetType'] ?? null;
			$element_type = $this->get_element_type( $el_type, $widget_type );

			if ( $element_type && ! $this->is_element_atomic( $el_type, $widget_type ) ) {
				$non_atomic[] = $element_type;
			}

			if ( ! empty( $element['elements'] ) ) {
				$nested_non_atomic = $this->find_non_atomic_elements( $element['elements'] );
				$non_atomic = array_merge( $non_atomic, $nested_non_atomic );
			}
		}

		return array_unique( $non_atomic );
	}

	private function get_element_type( ?string $el_type, ?string $widget_type ): ?string {
		return $widget_type ?? $el_type;
	}

	private function is_element_atomic( ?string $el_type, ?string $widget_type ): bool {
		if ( ! $el_type ) {
			return false;
		}

		$element_instance = Plugin::$instance->elements_manager->get_element( $el_type, $widget_type );

		if ( ! $element_instance ) {
			return false;
		}

		return Utils::is_atomic( $element_instance );
	}

	private function build_error_response( array $non_atomic_elements ): array {
		$message = sprintf(
			// translators: %s: Comma-separated list of non-atomic element types.
			esc_html__( 'Component contains non-supported elements: %s. Only atomic elements are allowed inside components.', 'elementor' ),
			implode( ', ', $non_atomic_elements )
		);

		return [
			'success' => false,
			'code' => self::ERROR_CODE,
			'messages' => [ $message ],
			'non_atomic_elements' => $non_atomic_elements,
		];
	}
}
