<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;
use Elementor\Modules\Mcp\Abilities\Utils\Fixable_Warning;

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
	 * @return array{error: null, warnings: string[], warning_codes: string[], warning_details: array[]}
	 */
	public function apply( array &$index, array $interactions ): array {
		$empty = [
			'error' => null,
			'warnings' => [],
			'warning_codes' => [],
			'warning_details' => [],
		];

		if ( empty( $interactions ) ) {
			return $empty;
		}

		$warnings = [];
		$warning_codes = [];
		$warning_details = [];

		foreach ( $interactions as $config_id => $items ) {
			if ( ! isset( $index[ $config_id ] ) ) {
				continue;
			}

			if ( ! is_array( $items ) ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'interaction_invalid',
					(string) $config_id,
					'Interactions must be an array of interaction items. See elementor://interactions/schema.'
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

			$built_items = $this->resolve_items( $items, (string) $config_id, $warnings, $warning_codes, $warning_details );

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
			'warning_codes' => array_values( array_unique( $warning_codes ) ),
			'warning_details' => $warning_details,
		];
	}

	private function resolve_items( array $items, string $config_id, array &$warnings, array &$warning_codes, array &$warning_details ): array {
		$prop_type = Interaction_Item_Prop_Type::make();
		$built = [];

		foreach ( $items as $item_index => $plain_item ) {
			if ( ! is_array( $plain_item ) ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'interaction_invalid',
					$config_id,
					sprintf( 'Interaction at index %d must be an object. See elementor://interactions/schema.', $item_index )
				);
				continue;
			}

			$resolved = $this->plain_values_resolver->resolve( $plain_item, $prop_type );

			if ( null === $resolved || ! $prop_type->validate( $resolved ) ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'interaction_invalid',
					$config_id,
					sprintf(
						'Interaction at index %d could not be resolved. See elementor://interactions/schema.',
						$item_index
					)
				);
				continue;
			}

			$built[] = $resolved;
		}

		return $built;
	}
}
