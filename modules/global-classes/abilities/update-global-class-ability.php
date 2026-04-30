<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Global_Class_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/update-global-class';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Update Global Class',
			'description' => 'Patches label and/or variants on a single global class by ID or label — without re-sending the full batch.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'id' => [
						'type'        => 'string',
						'description' => 'Class ID (preferred). Use the id returned by set-global-class(es) or listed in global-classes.',
					],
					'label' => [
						'type'        => 'string',
						'description' => 'Class label. Used to look up the class when id is not supplied.',
					],
					'new_label' => [
						'type'        => 'string',
						'description' => 'Rename the class to this label. Omit to keep the existing label.',
					],
					'variants' => [
						'type'        => 'array',
						'description' => 'Replaces ALL variants on the class. Omit to leave variants unchanged.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'    => [ 'type' => 'string' ],
					'label' => [ 'type' => 'string' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Patches a single global class without re-sending the full class list.',
						'Provide id (preferred) or label to identify the class.',
						'new_label: renames the class. Omit to keep existing label.',
						'variants: replaces ALL existing variants. Omit to keep existing variants.',
						'At least one of id or label must be supplied.',
						'Returns the updated id and label.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$target_id    = $input['id'] ?? null;
		$target_label = $input['label'] ?? null;
		$new_label    = $input['new_label'] ?? null;
		$new_variants = $input['variants'] ?? null;

		if ( ! $target_id && ! $target_label ) {
			throw new \InvalidArgumentException( 'At least one of "id" or "label" must be provided.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( null === $new_label && null === $new_variants ) {
			throw new \InvalidArgumentException( 'At least one of "new_label" or "variants" must be provided.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		$found_id = null;

		if ( $target_id && isset( $items[ $target_id ] ) ) {
			$found_id = $target_id;
		} elseif ( $target_label ) {
			foreach ( $items as $id => $item ) {
				if ( ( $item['label'] ?? '' ) === $target_label ) {
					$found_id = $id;
					break;
				}
			}
		}

		if ( ! $found_id ) {
			$identifier = $target_id ?? $target_label;
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Global class \"$identifier\" not found." );
		}

		if ( null !== $new_label ) {
			$items[ $found_id ]['label'] = $new_label;
		}

		if ( null !== $new_variants ) {
			$items[ $found_id ]['variants'] = $this->normalize_variants( $new_variants );
		}

		$repository->put( $items, $order, true );
		$repository->context( Global_Classes_Repository::CONTEXT_PREVIEW )->put( $items, $order, true, true );

		return [
			'id'    => $found_id,
			'label' => $items[ $found_id ]['label'],
		];
	}

	private function normalize_variants( array $variants ): array {
		foreach ( $variants as &$variant ) {
			if ( isset( $variant['custom_css'] ) && is_string( $variant['custom_css'] ) ) {
				$variant['custom_css'] = [ 'raw' => base64_encode( $variant['custom_css'] ) ]; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
			}

			if ( isset( $variant['meta'] ) && is_array( $variant['meta'] ) ) {
				if ( isset( $variant['meta']['state'] ) && 'normal' === $variant['meta']['state'] ) {
					throw new \InvalidArgumentException( 'Variant meta.state "normal" is not valid — use null for the default/base state.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				}
				if ( ! array_key_exists( 'state', $variant['meta'] ) ) {
					$variant['meta']['state'] = null;
				}
			}

			if ( ! empty( $variant['props'] ) && is_array( $variant['props'] ) ) {
				$parser = Props_Parser::make( Style_Schema::get() );
				$result = $parser->validate( $variant['props'] );
				if ( ! $result->is_valid() ) {
					// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
					throw new \InvalidArgumentException( 'Global class prop validation failed: ' . implode( ', ', $result->errors() ) );
				}
			}
		}
		unset( $variant );

		return $variants;
	}
}
