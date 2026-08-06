<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Global_Classes_Ability extends Abstract_Ability {

	const MAX_PER_PAGE = 50;
	const DEFAULT_PER_PAGE = 20;

	private ?Global_Classes_Repository $repository;

	public function __construct( ?Global_Classes_Repository $repository = null ) {
		$this->repository = $repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/list-global-classes';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Global Classes', 'elementor' ),
			Prompt_Loader::load( 'list-global-classes' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'classes' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id' => [ 'type' => 'string' ],
								'label' => [ 'type' => 'string' ],
							],
						],
					],
					'total' => [ 'type' => 'integer' ],
					'page' => [ 'type' => 'integer' ],
					'per_page' => [ 'type' => 'integer' ],
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
						'description' => 'Optional keyword matched against class labels (case-insensitive substring).',
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
				__( 'You do not have permission to list global classes.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$input = is_array( $input ) ? $input : [];

		$page = $this->resolve_page( $input );
		$per_page = $this->resolve_per_page( $input );
		$search = isset( $input['search'] ) && is_string( $input['search'] ) ? trim( $input['search'] ) : '';

		$labels = $this->get_repository()->all_labels();
		$classes = $this->normalize_classes( is_array( $labels ) ? $labels : [] );
		$classes = $this->filter_classes( $classes, $search );
		$total = count( $classes );
		$classes = array_slice( $classes, ( $page - 1 ) * $per_page, $per_page );

		return [
			'classes' => array_values( $classes ),
			'total' => $total,
			'page' => $page,
			'per_page' => $per_page,
		];
	}

	private function get_repository(): Global_Classes_Repository {
		if ( null !== $this->repository ) {
			return $this->repository;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}

	/**
	 * @param array<string, string> $labels
	 * @return list<array{id: string, label: string}>
	 */
	private function normalize_classes( array $labels ): array {
		$classes = [];

		foreach ( $labels as $id => $label ) {
			$classes[] = [
				'id' => (string) $id,
				'label' => (string) $label,
			];
		}

		return $classes;
	}

	/**
	 * @param list<array{id: string, label: string}> $classes
	 * @return list<array{id: string, label: string}>
	 */
	private function filter_classes( array $classes, string $search ): array {
		if ( '' === $search ) {
			return $classes;
		}

		$search_lower = strtolower( $search );

		return array_values(
			array_filter(
				$classes,
				static function ( array $class ) use ( $search_lower ): bool {
					return false !== strpos( strtolower( $class['label'] ), $search_lower );
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
