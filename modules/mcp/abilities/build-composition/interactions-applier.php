<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Applier {

	const MAX_INTERACTIONS_PER_ELEMENT = 5;
	const SCHEMA_VERSION = 1;

	private bool $is_experiment_active;
	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct( ?bool $is_experiment_active = null, ?Plain_Values_Resolver $plain_values_resolver = null ) {
		$this->is_experiment_active = $is_experiment_active ?? $this->detect_experiment_active();
		$this->plain_values_resolver = $plain_values_resolver ?? Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver();
	}

	/**
	 * @param array<string, array&>               $index        Index of subtree refs.
	 * @param array<string, array<int, array>>    $interactions Per-config-id list of native-shape interaction items.
	 *
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array &$index, array $interactions ): array {
		$warnings = [];

		if ( empty( $interactions ) ) {
			return [ 'error' => null, 'warnings' => $warnings ];
		}

		if ( ! $this->is_experiment_active ) {
			$warnings[] = __( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' );
			return [ 'error' => null, 'warnings' => $warnings ];
		}

		$errors = [];
		$prop_type = Interaction_Item_Prop_Type::make();

		foreach ( $interactions as $config_id => $items ) {
			if ( ! isset( $index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $items ) ) {
				$errors[] = sprintf( '[%s] Interactions must be an array.', $config_id );
				continue;
			}

			if ( count( $items ) > self::MAX_INTERACTIONS_PER_ELEMENT ) {
				$errors[] = sprintf(
					/* translators: 1: element id, 2: max */
					__( '[%1$s] Too many interactions (max %2$d).', 'elementor' ),
					$config_id,
					self::MAX_INTERACTIONS_PER_ELEMENT
				);
				continue;
			}

			$built_items = $this->resolve_items( $items, $prop_type, $config_id, $errors );

			if ( empty( $built_items ) ) {
				continue;
			}

			$index[ $config_id ]['interactions'] = [
				'items' => $built_items,
				'version' => self::SCHEMA_VERSION,
			];
		}

		if ( ! empty( $errors ) ) {
			return [
				'error' => new \WP_Error(
					'elementor_invalid_interactions',
					implode( ' ', $errors ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				),
				'warnings' => $warnings,
			];
		}

		return [ 'error' => null, 'warnings' => $warnings ];
	}

	private function resolve_items( array $items, Interaction_Item_Prop_Type $prop_type, string $config_id, array &$errors ): array {
		$built = [];

		foreach ( $items as $item_index => $plain_item ) {
			if ( ! is_array( $plain_item ) ) {
				$errors[] = sprintf( '[%s] Interaction at index %d must be an object.', $config_id, $item_index );
				continue;
			}

			$resolved = $this->plain_values_resolver->resolve( $plain_item, $prop_type );

			if ( null === $resolved || ! $prop_type->validate( $resolved ) ) {
				$errors[] = sprintf(
					'[%s] Interaction at index %d could not be resolved. See elementor://interactions/schema.',
					$config_id,
					$item_index
				);
				continue;
			}

			$built[] = $resolved;
		}

		return $built;
	}

	private function detect_experiment_active(): bool {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return false;
		}

		return Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME );
	}
}
