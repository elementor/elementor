<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Find_Icons_Ability extends Abstract_Ability {

	const EMPTY_RESULT_HINT = 'No icon on this site matches these queries. Try a broader phrase (for example "cart" instead of "shopping trolley"), or drop the library and category filters. Never invent an icon value.';

	const CATALOG_MISSING_NOTICE = 'Note: the icon catalog is not available on this site, so icons cannot be looked up.';

	protected function get_ability_id(): string {
		return 'elementor/find-icons';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Find Icons', 'elementor' ),
			Prompt_Loader::load( 'find-icons' ),
			'elementor',
			$this->get_output_schema(),
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			$this->get_input_schema()
		);
	}

	public function is_available() {
		$gate = parent::is_available();

		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		if ( ! Icon_Catalog::is_available() ) {
			return new \WP_Error(
				'elementor_icon_catalog_unavailable',
				__( 'The icon catalog is missing on this site, so icons cannot be looked up.', 'elementor' ),
				[
					'status' => \WP_Http::SERVICE_UNAVAILABLE,
					'description_notice' => self::CATALOG_MISSING_NOTICE,
				]
			);
		}

		return true;
	}

	public function execute( $input = [] ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to look up icons.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$input = is_array( $input ) ? $input : [];

		$response = Icon_Search::search( [
			'queries' => $this->resolve_queries( $input ),
			'library' => $input['library'] ?? '',
			'category' => $input['category'] ?? '',
			'page' => $input['page'] ?? 1,
			'per_page' => $input['per_page'] ?? Icon_Search::DEFAULT_PER_PAGE,
		] );

		if ( isset( $response['error'] ) ) {
			$response = [
				'results' => [],
				'libraries' => [],
				'custom_libraries' => [],
				'categories' => [],
			];
		}

		if ( $this->has_no_matches( $response ) ) {
			$response['llm_instructions'] = self::EMPTY_RESULT_HINT;
		}

		return $response;
	}

	private function resolve_queries( array $input ): array {
		$queries = $input['queries'] ?? [];

		if ( ! is_array( $queries ) ) {
			$queries = [ $queries ];
		}

		if ( isset( $input['search'] ) ) {
			$queries[] = $input['search'];
		}

		return $queries;
	}

	private function has_no_matches( array $response ): bool {
		foreach ( $response['results'] ?? [] as $result ) {
			if ( ! empty( $result['matches'] ) ) {
				return false;
			}
		}

		return true;
	}

	private function get_input_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'queries' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'maxItems' => Icon_Search::MAX_QUERIES,
					'description' => 'One plain-language phrase per icon you need, for example ["add to cart", "free shipping"]. Batch every icon a page needs into a single call.',
				],
				'search' => [
					'type' => 'string',
					'description' => 'Shorthand for a single-entry "queries" array.',
				],
				'library' => [
					'type' => 'string',
					'description' => 'Restrict results to one library key reported in "libraries", for example "fa-solid". Omit to search every library on the site.',
				],
				'category' => [
					'type' => 'string',
					'description' => 'Restrict results to one Font Awesome category reported in "categories", for example "shopping". May be used without any query to browse that category.',
				],
				'page' => [
					'type' => 'integer',
					'minimum' => 1,
					'default' => 1,
				],
				'per_page' => [
					'type' => 'integer',
					'minimum' => 1,
					'maximum' => Icon_Search::MAX_PER_PAGE,
					'default' => Icon_Search::DEFAULT_PER_PAGE,
				],
			],
		];
	}

	private function get_output_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'results' => [
					'type' => 'array',
					'items' => [
						'type' => 'object',
						'properties' => [
							'query' => [ 'type' => 'string' ],
							'matches' => [
								'type' => 'array',
								'items' => [
									'type' => 'object',
									'properties' => [
										'value' => [ 'type' => 'string' ],
										'library' => [ 'type' => 'string' ],
										'name' => [ 'type' => 'string' ],
										'label' => [ 'type' => 'string' ],
										'matched_on' => [
											'type' => 'string',
											'enum' => [
												Icon_Matcher::MATCHED_ON_NAME,
												Icon_Matcher::MATCHED_ON_ALIAS,
												Icon_Matcher::MATCHED_ON_LABEL,
												Icon_Matcher::MATCHED_ON_TERM,
												Icon_Matcher::MATCHED_ON_CATEGORY,
												Icon_Matcher::MATCHED_ON_CUSTOM_NAME,
											],
										],
										'license' => [
											'type' => 'string',
											'enum' => [ Icon_Catalog::LICENSE_FREE, Icon_Catalog::LICENSE_PRO ],
										],
									],
								],
							],
							'total' => [ 'type' => 'integer' ],
							'page' => [ 'type' => 'integer' ],
							'per_page' => [ 'type' => 'integer' ],
							'truncated' => [ 'type' => 'boolean' ],
						],
					],
				],
				'libraries' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
				],
				'custom_libraries' => [ 'type' => 'object' ],
				'categories' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
				],
				'font_awesome_version' => [ 'type' => [ 'string', 'null' ] ],
				'llm_instructions' => [ 'type' => 'string' ],
			],
		];
	}
}
