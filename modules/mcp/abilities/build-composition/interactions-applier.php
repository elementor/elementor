<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Applier {

	const MAX_INTERACTIONS_PER_ELEMENT = 5;
	const SCHEMA_VERSION = 1;

	private bool $is_experiment_active;
	private Interaction_Converter $converter;

	public function __construct( ?bool $is_experiment_active = null, ?Interaction_Converter $converter = null ) {
		$this->is_experiment_active = $is_experiment_active ?? $this->detect_experiment_active();
		$this->converter = $converter ?? new Interaction_Converter();
	}

	public function apply( array &$index, array $interactions, array $config_id_to_widget = [] ): array {
		$warnings = [];

		if ( empty( $interactions ) ) {
			return [ 'error' => null, 'warnings' => $warnings ];
		}

		if ( ! $this->is_experiment_active ) {
			$warnings[] = __( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' );
			return [ 'error' => null, 'warnings' => $warnings ];
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

			if ( count( $items ) > self::MAX_INTERACTIONS_PER_ELEMENT ) {
				$errors[] = sprintf(
					/* translators: 1: element id, 2: max */
					__( '[%1$s] Too many interactions (max %2$d).', 'elementor' ),
					$config_id,
					self::MAX_INTERACTIONS_PER_ELEMENT
				);
				continue;
			}

			$built_items = [];
			foreach ( $items as $item_index => $plain_item ) {
				if ( ! is_array( $plain_item ) ) {
					$errors[] = sprintf( '[%s] Interaction at index %d must be an object.', $config_id, $item_index );
					continue;
				}

				$conversion = $this->converter->convert( $plain_item );

				if ( ! empty( $conversion['rejected'] ) ) {
					$errors[] = sprintf(
						'[%1$s] Interaction at index %2$d: %3$s See elementor://interactions/schema.',
						$config_id,
						$item_index,
						implode( ' ', $conversion['rejected'] )
					);
					continue;
				}

				if ( null === $conversion['item'] ) {
					continue;
				}

				$built_items[] = $conversion['item'];
				$warnings = array_merge( $warnings, $conversion['warnings'] );
			}

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

	private function detect_experiment_active(): bool {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return false;
		}

		return Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME );
	}
}
