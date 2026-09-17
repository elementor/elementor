<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Applier {

	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct( ?Plain_Values_Resolver $plain_values_resolver = null ) {
		$this->plain_values_resolver = $plain_values_resolver ?? Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver();
	}

	/**
	 * @param array<string, array&>            $index        Index of subtree refs.
	 * @param array<string, array<int, array>> $interactions Per-config-id list of native-shape interaction items.
	 *
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array &$index, array $interactions ): array {
		if ( empty( $interactions ) ) {
			return [
				'error' => null,
				'warnings' => [],
			];
		}

		$errors = [];

		foreach ( $interactions as $config_id => $items ) {
			if ( ! isset( $index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $items ) ) {
				$errors[] = sprintf( '[%s] Interactions must be an array.', $config_id );
				continue;
			}

			if ( empty( $items ) ) {
				$index[ $config_id ]['interactions'] = [
					'items' => [],
					'version' => Interactions_Schema::get_interactions_schema()['version'],
				];
				continue;
			}

			$built_items = $this->resolve_items( $items, $config_id, $errors );

			if ( empty( $built_items ) ) {
				continue;
			}

			$index[ $config_id ]['interactions'] = [
				'items' => $built_items,
				'version' => Interactions_Schema::get_interactions_schema()['version'],
			];
		}

		if ( ! empty( $errors ) ) {
			return [
				'error' => new \WP_Error(
					'elementor_invalid_interactions',
					implode( ' ', $errors ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				),
				'warnings' => [],
			];
		}

		return [
			'error' => null,
			'warnings' => [],
		];
	}

	private function resolve_items( array $items, string $config_id, array &$errors ): array {
		$prop_type = Interaction_Item_Prop_Type::make();
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
}
