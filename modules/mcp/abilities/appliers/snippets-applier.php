<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Snippet_References;
use Elementor\Modules\DataFlow\Snippets\Snippet_Access;
use Elementor\Modules\DataFlow\Snippets\Snippet_Store;
use Elementor\Modules\DataFlow\Snippets\Snippet_Validator;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Snippets_Applier {

	public static function get_snippets_list_schema(): array {
		return [
			'type' => 'array',
			'items' => [
				'type' => 'object',
				'required' => [ 'snippet', 'event' ],
				'properties' => [
					'snippet' => [ 'type' => 'string' ],
					'event' => [
						'type' => 'string',
						'enum' => Snippet_Validator::ALLOWED_EVENTS,
					],
				],
			],
		];
	}

	/**
	 * @param array<string, array&> $index      Index of subtree refs.
	 * @param array<string, mixed>  $references Per-config-id list of { snippet, event } references.
	 */
	public function apply( array &$index, array $references ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $references as $config_id => $element_references ) {
			$config_id = (string) $config_id;

			if ( ! isset( $index[ $config_id ] ) ) {
				$warnings->add(
					'snippets_unknown_configuration_id',
					'Snippets target a configuration-id that is not in xml_structure and were skipped.',
					$config_id
				);
				continue;
			}

			$index[ $config_id ][ Snippet_References::DATA_KEY ] = $this->keep_resolvable_references( $element_references, $config_id, $warnings );
		}

		if ( ! empty( $references ) && ! Snippet_Access::can_manage() ) {
			$warnings->add(
				'snippets_stripped_on_save',
				'Snippet references are removed on save because the current user is not an administrator with the unfiltered_html capability.'
			);
		}

		return $warnings;
	}

	private function keep_resolvable_references( $element_references, string $config_id, Warnings_Bag $warnings ): array {
		$sanitized = Snippet_References::sanitize( $element_references );

		if ( count( $sanitized ) < ( is_array( $element_references ) ? count( $element_references ) : 1 ) ) {
			$warnings->add( 'snippet_reference_invalid', $this->get_invalid_reference_message(), $config_id );
		}

		return array_values( array_filter( $sanitized, fn( $reference ) => $this->is_resolvable( $reference, $config_id, $warnings ) ) );
	}

	private function is_resolvable( array $reference, string $config_id, Warnings_Bag $warnings ): bool {
		$snippet = Snippet_Store::get( $reference['snippet'] );

		if ( ! $snippet ) {
			$warnings->add( 'snippet_not_found', sprintf( 'Snippet "%s" does not exist. Save it with elementor/manage-snippets first.', $reference['snippet'] ), $config_id );

			return false;
		}

		if ( ! in_array( $reference['event'], array_column( $snippet['handlers'], 'event' ), true ) ) {
			$warnings->add( 'snippet_event_not_defined', sprintf( 'Snippet "%1$s" has no "%2$s" handler.', $reference['snippet'], $reference['event'] ), $config_id );

			return false;
		}

		return true;
	}

	private function get_invalid_reference_message(): string {
		return sprintf(
			'Some snippet references were dropped. Each reference needs a "snippet" name and an "event" in [%1$s], with at most %2$d per element. See %3$s.',
			implode( ', ', Snippet_Validator::ALLOWED_EVENTS ),
			Snippet_References::MAX_PER_ELEMENT,
			Data_Flow_Guide_Ability::URI
		);
	}
}
