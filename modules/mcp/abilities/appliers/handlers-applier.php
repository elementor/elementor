<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Handlers_Parser;
use Elementor\Modules\DataFlow\Module as Data_Flow_Module;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Handlers_Applier {

	public static function get_handlers_list_schema(): array {
		return [
			'type' => 'array',
			'items' => [
				'type' => 'object',
				'required' => [ 'event', 'code' ],
				'properties' => [
					'event' => [
						'type' => 'string',
						'enum' => Handlers_Parser::ALLOWED_EVENTS,
					],
					'code' => [ 'type' => 'string' ],
				],
			],
		];
	}

	/**
	 * @param array<string, array&> $index    Index of subtree refs.
	 * @param array<string, mixed>  $handlers Per-config-id list of { event, code } handlers.
	 */
	public function apply( array &$index, array $handlers ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $handlers as $config_id => $element_handlers ) {
			$config_id = (string) $config_id;

			if ( ! isset( $index[ $config_id ] ) ) {
				$warnings->add(
					'handlers_unknown_configuration_id',
					'Handlers target a configuration-id that is not in xml_structure and were skipped.',
					$config_id
				);
				continue;
			}

			$sanitized = Handlers_Parser::sanitize( $element_handlers );

			if ( count( $sanitized ) < $this->count_handlers( $element_handlers ) ) {
				$warnings->add( 'handler_invalid', $this->get_invalid_handler_message(), $config_id );
			}

			$index[ $config_id ][ Handlers_Parser::DATA_KEY ] = $sanitized;
		}

		if ( ! empty( $handlers ) && ! Data_Flow_Module::can_current_user_save_handlers() ) {
			$warnings->add(
				'handlers_stripped_on_save',
				'Handlers are removed on save because the current user lacks the unfiltered_html capability. Ask a site administrator to add them.'
			);
		}

		return $warnings;
	}

	private function count_handlers( $element_handlers ): int {
		return is_array( $element_handlers ) ? count( $element_handlers ) : 1;
	}

	private function get_invalid_handler_message(): string {
		return sprintf(
			'Some handlers were dropped. Each handler needs a non-empty string "code" and an "event" in [%1$s], with at most %2$d handlers per element. See %3$s.',
			implode( ', ', Handlers_Parser::ALLOWED_EVENTS ),
			Handlers_Parser::MAX_HANDLERS_PER_ELEMENT,
			Data_Flow_Guide_Ability::URI
		);
	}
}
