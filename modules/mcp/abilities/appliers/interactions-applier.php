<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

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
	 * @return array{error: null, warnings: Warnings_Bag}
	 */
	public function apply( array &$index, array $interactions ): array {
		$warnings = Warnings_Bag::make();

		if ( empty( $interactions ) ) {
			return [
				'error' => null,
				'warnings' => $warnings,
			];
		}

		foreach ( $interactions as $config_id => $items ) {
			if ( ! isset( $index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $items ) ) {
				$warnings->add(
					'interaction_invalid',
					'Interactions must be an array of interaction items. See elementor://interactions/schema.',
					(string) $config_id
				);
				continue;
			}

			if ( empty( $items ) ) {
				$index[ $config_id ]['interactions'] = [
					'items' => [],
					'version' => Interactions_Schema::get_interactions_schema()['version'],
				];
				continue;
			}

			$built_items = $this->resolve_items( $items, (string) $config_id, $warnings );

			if ( empty( $built_items ) ) {
				continue;
			}

			$index[ $config_id ]['interactions'] = [
				'items' => $built_items,
				'version' => Interactions_Schema::get_interactions_schema()['version'],
			];
		}

		return [
			'error' => null,
			'warnings' => $warnings,
		];
	}

	private function resolve_items( array $items, string $config_id, Warnings_Bag $warnings ): array {
		$prop_type = Interaction_Item_Prop_Type::make();
		$built = [];

		foreach ( $items as $item_index => $plain_item ) {
			if ( ! is_array( $plain_item ) ) {
				$warnings->add(
					'interaction_invalid',
					sprintf( 'Interaction at index %d must be an object. See elementor://interactions/schema.', $item_index ),
					$config_id
				);
				continue;
			}

			$resolved = $this->plain_values_resolver->resolve( $plain_item, $prop_type );

			if ( null === $resolved || ! $prop_type->validate( $resolved ) ) {
				$warnings->add(
					'interaction_invalid',
					sprintf(
						'Interaction at index %d could not be resolved. See elementor://interactions/schema.',
						$item_index
					),
					$config_id
				);
				continue;
			}

			$built[] = $resolved;
		}

		return $built;
	}
}
