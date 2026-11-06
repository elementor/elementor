<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;
use Elementor\Modules\Interactions\Validators\Code_Effect_Value;
use Elementor\Modules\Mcp\Abilities\Appliers\CodeEffect\Code_Effect_Defaults;
use Elementor\Modules\Mcp\Abilities\Appliers\CodeEffect\Code_Effect_Warnings;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Applier {

	private Plain_Values_Resolver $plain_values_resolver;

	/** @var callable(): bool */
	private $can_save_code;

	public function __construct( ?Plain_Values_Resolver $plain_values_resolver = null, ?callable $can_save_code = null ) {
		$this->plain_values_resolver = $plain_values_resolver ?? Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver();
		$this->can_save_code = $can_save_code ?? fn() => current_user_can( 'unfiltered_html' );
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

			$resolved = $this->plain_values_resolver->resolve( Code_Effect_Defaults::fill( $plain_item ), $prop_type );

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

			if ( ! Code_Effect_Value::is_valid( $resolved['value'] ) ) {
				$warnings->add(
					'interaction_invalid',
					sprintf(
						'Interaction at index %d is a code effect that needs trigger "load" and a valid code_effect. See %s.',
						$item_index,
						Code_Effect_Warnings::GUIDE_URI
					),
					$config_id
				);
				continue;
			}

			$this->add_code_effect_warnings( $resolved, (int) $item_index, $config_id, $warnings );

			$built[] = $resolved;
		}

		return $built;
	}

	private function add_code_effect_warnings( array $resolved, int $item_index, string $config_id, Warnings_Bag $warnings ): void {
		foreach ( Code_Effect_Warnings::collect( $resolved, $this->can_save_code ) as $warning ) {
			$warnings->add(
				$warning['code'],
				sprintf( 'Interaction at index %d: %s', $item_index, $warning['message'] ),
				$config_id
			);
		}
	}
}
