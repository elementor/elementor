<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Global_Variables_Ability extends Abstract_Ability {

	const MAX_PER_PAGE = 50;
	const DEFAULT_PER_PAGE = 20;

	const TYPE_COLOR = 'global-color-variable';
	const TYPE_FONT = 'global-font-variable';
	const TYPE_SIZE = 'global-size-variable';
	const TYPE_CUSTOM_SIZE = 'global-custom-size-variable';

	private ?Variables_Service $service;

	public function __construct( ?Variables_Service $service = null ) {
		$this->service = $service;
	}

	protected function get_ability_id(): string {
		return 'elementor/list-global-variables';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Global Variables', 'elementor' ),
			Prompt_Loader::load( 'list-global-variables' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'variables' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id' => [ 'type' => 'string' ],
								'type' => [ 'type' => 'string' ],
								'label' => [ 'type' => 'string' ],
								'value' => [ 'type' => 'string' ],
							],
						],
					],
					'total' => [ 'type' => 'integer' ],
					'page' => [ 'type' => 'integer' ],
					'per_page' => [ 'type' => 'integer' ],
					'watermark' => [ 'type' => [ 'integer', 'null' ] ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'properties' => [
					'search' => [
						'type' => 'string',
						'description' => 'Optional keyword matched against variable labels (case-insensitive substring).',
					],
					'type' => [
						'type' => 'string',
						'enum' => [
							self::TYPE_COLOR,
							self::TYPE_FONT,
							self::TYPE_SIZE,
							self::TYPE_CUSTOM_SIZE,
						],
						'description' => 'Optional filter by variable type.',
					],
					'page' => [
						'type' => 'integer',
						'minimum' => 1,
						'default' => 1,
					],
					'per_page' => [
						'type' => 'integer',
						'minimum' => 1,
						'maximum' => self::MAX_PER_PAGE,
						'default' => self::DEFAULT_PER_PAGE,
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to list global variables.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$input = is_array( $input ) ? $input : [];

		$page = $this->resolve_page( $input );
		$per_page = $this->resolve_per_page( $input );
		$search = isset( $input['search'] ) && is_string( $input['search'] ) ? trim( $input['search'] ) : '';
		$type = isset( $input['type'] ) && is_string( $input['type'] ) ? $input['type'] : '';

		$payload = $this->get_service()->load();
		$data = is_array( $payload['data'] ?? null ) ? $payload['data'] : [];

		$variables = $this->normalize_variables( $data );
		$variables = $this->filter_variables( $variables, $search, $type );
		$total = count( $variables );
		$variables = array_slice( $variables, ( $page - 1 ) * $per_page, $per_page );

		return [
			'variables' => array_values( $variables ),
			'total' => $total,
			'page' => $page,
			'per_page' => $per_page,
			'watermark' => $payload['watermark'] ?? null,
		];
	}

	private function get_service(): Variables_Service {
		if ( null !== $this->service ) {
			return $this->service;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	/**
	 * @param array<string, array> $data
	 * @return list<array<string, mixed>>
	 */
	private function normalize_variables( array $data ): array {
		$variables = [];

		foreach ( $data as $id => $variable ) {
			if ( ! is_array( $variable ) ) {
				continue;
			}

			$variables[] = array_merge(
				[ 'id' => (string) $id ],
				$variable
			);
		}

		usort(
			$variables,
			static function ( array $left, array $right ): int {
				$left_order = isset( $left['order'] ) ? (int) $left['order'] : PHP_INT_MAX;
				$right_order = isset( $right['order'] ) ? (int) $right['order'] : PHP_INT_MAX;

				if ( $left_order === $right_order ) {
					return strcmp( (string) ( $left['label'] ?? '' ), (string) ( $right['label'] ?? '' ) );
				}

				return $left_order <=> $right_order;
			}
		);

		return $variables;
	}

	/**
	 * @param list<array<string, mixed>> $variables
	 * @return list<array<string, mixed>>
	 */
	private function filter_variables( array $variables, string $search, string $type ): array {
		if ( '' === $search && '' === $type ) {
			return $variables;
		}

		$search_lower = '' === $search ? '' : strtolower( $search );

		return array_values(
			array_filter(
				$variables,
				static function ( array $variable ) use ( $search_lower, $type ): bool {
					if ( '' !== $type && ( $variable['type'] ?? '' ) !== $type ) {
						return false;
					}

					if ( '' === $search_lower ) {
						return true;
					}

					$label = isset( $variable['label'] ) && is_string( $variable['label'] ) ? $variable['label'] : '';

					return false !== strpos( strtolower( $label ), $search_lower );
				}
			)
		);
	}

	private function resolve_page( array $input ): int {
		$page = isset( $input['page'] ) ? (int) $input['page'] : 1;

		return max( 1, $page );
	}

	private function resolve_per_page( array $input ): int {
		$per_page = isset( $input['per_page'] ) ? (int) $input['per_page'] : self::DEFAULT_PER_PAGE;

		return max( 1, min( self::MAX_PER_PAGE, $per_page ) );
	}
}
