<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Show_Suggested_Actions_Ability extends Abstract_Ability {
	const MIN_ACTIONS = 1;
	const MAX_ACTIONS = 5;

	const ALLOWED_ICONS = [ 'sparkles', 'grid', 'branch' ];

	protected function get_ability_id(): string {
		return 'elementor/show-suggested-actions';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Show Suggested Actions', 'elementor' ),
			__( 'Renders interactive suggested next-step action chips in the host chat UI. Call after completing a meaningful editor step to offer follow-up prompts the user can click.', 'elementor' ),
			'elementor',
			[
				'type'       => 'object',
				'properties' => [
					'actions' => [
						'type'  => 'array',
						'items' => [
							'type'       => 'object',
							'properties' => [
								'label'  => [ 'type' => 'string' ],
								'prompt' => [ 'type' => 'string' ],
								'icon'   => [ 'type' => 'string' ],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly'    => true,
					'idempotent'  => true,
					'destructive' => false,
				],
				'mcp'         => [
					'_meta' => [
						'ui' => [
							'resourceUri' => Suggested_Actions_Ui_Ability::URI,
							'displayMode' => 'inline',
						],
					],
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type'       => 'object',
				'required'   => [ 'actions' ],
				'properties' => [
					'actions' => [
						'type'        => 'array',
						'minItems'    => self::MIN_ACTIONS,
						'maxItems'    => self::MAX_ACTIONS,
						'description' => '1-5 suggested actions',
						'items'       => [
							'type'       => 'object',
							'required'   => [ 'label', 'prompt' ],
							'properties' => [
								'label'  => [
									'type'        => 'string',
									'description' => 'Chip label shown to the user',
								],
								'prompt' => [
									'type'        => 'string',
									'description' => 'User message sent to the agent when the chip is clicked',
								],
								'icon'   => [
									'type'        => 'string',
									'enum'        => self::ALLOWED_ICONS,
									'description' => 'Optional icon for the chip',
								],
							],
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input   = is_array( $input ) ? $input : [];
		$actions = $input['actions'] ?? null;

		if ( ! is_array( $actions ) || count( $actions ) < self::MIN_ACTIONS || count( $actions ) > self::MAX_ACTIONS ) {
			return new \WP_Error(
				'invalid_actions',
				sprintf(
					/* translators: 1: minimum number of actions, 2: maximum number of actions */
					__( 'actions must be an array with between %1$d and %2$d items.', 'elementor' ),
					self::MIN_ACTIONS,
					self::MAX_ACTIONS
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$normalized = [];

		foreach ( $actions as $action ) {
			$item = $this->normalize_action( $action );

			if ( is_wp_error( $item ) ) {
				return $item;
			}

			$normalized[] = $item;
		}

		return [ 'actions' => $normalized ];
	}

	private function normalize_action( $action ) {
		if ( ! is_array( $action ) ) {
			return $this->invalid_action_error();
		}

		$label = is_string( $action['label'] ?? null ) ? trim( $action['label'] ) : '';
		$prompt = is_string( $action['prompt'] ?? null ) ? trim( $action['prompt'] ) : '';

		if ( '' === $label || '' === $prompt ) {
			return $this->invalid_action_error();
		}

		$item = [
			'label'  => $label,
			'prompt' => $prompt,
		];

		$icon = $action['icon'] ?? null;

		if ( is_string( $icon ) && in_array( $icon, self::ALLOWED_ICONS, true ) ) {
			$item['icon'] = $icon;
		}

		return $item;
	}

	private function invalid_action_error(): \WP_Error {
		return new \WP_Error(
			'invalid_actions',
			__( 'Each action must be an object with a non-empty label and prompt.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}
}
