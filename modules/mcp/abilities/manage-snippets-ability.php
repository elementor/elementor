<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\DataFlow\Snippets\Snippet_Access;
use Elementor\Modules\DataFlow\Snippets\Snippet_Store;
use Elementor\Modules\DataFlow\Snippets\Snippet_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Snippets_Ability extends Abstract_Ability {
	const ACTION_SAVE = 'save';
	const ACTION_GET = 'get';
	const ACTION_LIST = 'list';
	const ACTION_DELETE = 'delete';
	const ACTIONS = [ self::ACTION_SAVE, self::ACTION_GET, self::ACTION_LIST, self::ACTION_DELETE ];

	protected function get_ability_id(): string {
		return 'elementor/manage-snippets';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Snippets', 'elementor' ),
			__( 'Save, read, list or delete interaction snippets for stateful pages (requires the e_data_flow experiment and an administrator with unfiltered_html). A snippet is { name, handlers: [{ event, description, code }] } where code is a plain function like ({ state, event }) => { state.count += 1; }. Attach snippets to elements with the snippets property of build-composition or manage-elements. Read elementor://data-flow/guide first.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'snippet' => [ 'type' => 'object' ],
					'snippets' => [ 'type' => 'array' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => true,
				],
			],
			fn() => Snippet_Access::can_manage(),
			[
				'type' => 'object',
				'required' => [ 'action' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => self::ACTIONS,
					],
					'name' => [
						'type' => 'string',
						'description' => 'Lowercase letters, digits and dashes, starting with a letter. Required for save, get and delete.',
					],
					'handlers' => [
						'type' => 'array',
						'description' => 'save only. One handler per event, at most ' . Snippet_Validator::MAX_HANDLERS . '.',
						'items' => [
							'type' => 'object',
							'required' => [ 'event', 'description', 'code' ],
							'properties' => [
								'event' => [
									'type' => 'string',
									'enum' => Snippet_Validator::ALLOWED_EVENTS,
								],
								'description' => [
									'type' => 'string',
									'description' => 'Short human readable explanation shown to editors in the Interactions tab.',
								],
								'code' => [
									'type' => 'string',
									'description' => 'A single function receiving { state, page, event, emit }. event has value, local { x, y, angle, size } and preventDefault(). No DOM access.',
								],
							],
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$action = $input['action'] ?? '';

		if ( ! Snippet_Access::can_manage() ) {
			return new \WP_Error( 'snippet_forbidden', __( 'Managing snippets requires an administrator with the unfiltered_html capability.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		if ( ! in_array( $action, self::ACTIONS, true ) ) {
			return $this->invalid_input( 'snippet_invalid_action', __( 'action must be one of: save, get, list, delete.', 'elementor' ) );
		}

		if ( self::ACTION_LIST === $action ) {
			return [ 'status' => 'success', 'snippets' => array_map( [ $this, 'to_response' ], Snippet_Store::all() ) ];
		}

		$name = is_string( $input['name'] ?? null ) ? $input['name'] : '';

		switch ( $action ) {
			case self::ACTION_SAVE:
				return $this->save( $name, $input['handlers'] ?? [] );
			case self::ACTION_DELETE:
				return $this->delete( $name );
			default:
				return $this->get( $name );
		}
	}

	private function save( string $name, $handlers ) {
		$validation = Snippet_Validator::validate( $name, $handlers );

		if ( ! empty( $validation['errors'] ) ) {
			return new \WP_Error(
				$validation['errors'][0]['code'],
				$validation['errors'][0]['message'],
				[ 'status' => \WP_Http::BAD_REQUEST, 'errors' => $validation['errors'] ]
			);
		}

		$snippet = Snippet_Store::save( $name, $validation['handlers'] );

		if ( is_wp_error( $snippet ) ) {
			$snippet->add_data( [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );

			return $snippet;
		}

		return [ 'status' => 'success', 'snippet' => $this->to_response( $snippet ) ];
	}

	private function get( string $name ) {
		$snippet = Snippet_Store::get( $name );

		return $snippet
			? [ 'status' => 'success', 'snippet' => array_merge( $this->to_response( $snippet ), [ 'handlers' => $snippet['handlers'] ] ) ]
			: $this->not_found( $name );
	}

	private function delete( string $name ) {
		return Snippet_Store::delete( $name )
			? [ 'status' => 'success' ]
			: $this->not_found( $name );
	}

	private function to_response( array $snippet ): array {
		return [
			'name' => $snippet['name'],
			'handlers' => array_map( fn( $handler ) => array_diff_key( $handler, [ 'code' => true ] ), $snippet['handlers'] ),
		];
	}

	private function not_found( string $name ): \WP_Error {
		return new \WP_Error( 'snippet_not_found', sprintf( 'Snippet "%s" does not exist.', $name ), [ 'status' => \WP_Http::NOT_FOUND ] );
	}

	private function invalid_input( string $code, string $message ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}
}
