<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\WpRest\Base\Query as Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Term_Query extends Base {
	const ENDPOINT = 'term';

	/**
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	protected function get( \WP_REST_Request $request ) {
		$params = $request->get_params();
		$term = trim( $params[ self::SEARCH_TERM_KEY ] ?? '' );

		if ( empty( $term ) ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data' => [
					'value' => [],
				],
			], 200 );
		}

		$included_types = $params[ self::INCLUDED_TYPE_KEY ];
		$excluded_types = $params[ self::EXCLUDED_TYPE_KEY ];

		$fields = $params[ self::FIELDS_KEY ];
		$fields = is_array( $fields ) && 1 === count( $fields ) ? $fields[0] : $fields;
		$keys_format_map = $params[ self::KEYS_CONVERSION_MAP_KEY ];

		$requested_count = $params[ self::ITEMS_COUNT_KEY ] ?? 0;
		$validated_count = max( $requested_count, 1 );
		$count = min( $validated_count, self::MAX_RESPONSE_COUNT );

		$should_hide_empty = $params[ self::HIDE_EMPTY_KEY ] ?? false;

		$query_args = [
			'number' => $count,
			'fields' => $fields,
			'name__like' => $term,
			'hide_empty' => $should_hide_empty,
		];

		if ( ! empty( $params[ self::META_QUERY_KEY ] ) && is_array( $params[ self::META_QUERY_KEY ] ) ) {
			$query_args['meta_query'] = $params[ self::META_QUERY_KEY ];
		}

		$terms = new Collection( get_terms( $query_args ) );
		$term_by_id = is_numeric( $term ) ? get_term( $term ) : null;

		if ( $term_by_id && ! $terms->find( fn( $t ) => (int) $t->term_id === (int) $term ) ) {
			$terms->push( $term_by_id );
		}

		$terms = $terms->filter( function ( $term ) use ( $included_types, $excluded_types ) {
			return ( empty( $included_types ) || in_array( $term->taxonomy, $included_types, true ) )
				&& ( empty( $excluded_types ) || ! in_array( $term->taxonomy, $excluded_types, true ) );
		} );

		$term_group_labels = $terms
			->reduce( function ( $term_types, $term ) {
				if ( ! isset( $term_types[ $term->taxonomy ] ) ) {
					$taxonomy = get_taxonomy( $term->taxonomy );
					$term_types[ $term->taxonomy ] = $taxonomy->labels->name ?? $term->labels;
				}

				return $term_types;
			}, [] );

		return new \WP_REST_Response( [
			'success' => true,
			'data' => [
				'value' => $terms
					->map( function ( $term ) use ( $keys_format_map, $term_group_labels ) {
						$term_object = (array) $term;

						if ( isset( $term_object['taxonomy'] ) ) {
							$group_name = $term_object['taxonomy'];

							if ( isset( $term_group_labels[ $group_name ] ) ) {
								$term_object['taxonomy'] = $term_group_labels[ $group_name ];
							}
						}

						return $this->translate_keys( $term_object, $keys_format_map );
					} )
					->all(),
			],
		], 200 );
	}

	/**
	 * @return array
	 */
	protected function get_endpoint_registration_args(): array {
		return [
			self::INCLUDED_TYPE_KEY => [
				'description' => 'Included taxonomy containing terms (categories, tags, etc...)',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::EXCLUDED_TYPE_KEY => [
				'description' => 'Excluded taxonomy containing terms (categories, tags, etc...)',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::SEARCH_TERM_KEY => [
				'description' => 'Terms to search',
				'type' => 'string',
				'required' => false,
				'default' => '',
				'sanitize_callback' => 'sanitize_text_field',
			],
			self::KEYS_CONVERSION_MAP_KEY => [
				'description' => 'Specify keys to extract and convert, i.e. ["key_1" => "new_key_1"].',
				'type' => [ 'array', 'string' ],
				'required' => false,
				'default' => [
					'term_id' => 'id',
					'name' => 'label',
					'taxonomy' => 'groupLabel',
				],
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::ITEMS_COUNT_KEY => [
				'description' => 'Terms per request',
				'type' => 'integer',
				'required' => false,
				'default' => self::MAX_RESPONSE_COUNT,
			],
			self::HIDE_EMPTY_KEY => [
				'description' => 'Whether to include only public terms',
				'type' => 'boolean',
				'required' => false,
				'default' => false,
			],
			self::META_QUERY_KEY => [
				'description' => 'WP_Query meta_query array',
				'type' => 'array',
				'required' => false,
				'default' => null,
				'sanitize_callback' => fn ( ...$args ) => self::sanitize_string_array( ...$args ),
			],
			self::FIELDS_KEY => [
				'description' => 'Term fields to query for',
				'type' => 'string',
				'required' => false,
				'default' => 'all',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => fn ( $fields ) => ! $fields || in_array( $fields, [
					'all',
					'all_with_object_id',
					'ids',
					'tt_ids',
					'names',
					'slugs',
					'count',
					'id=>parent',
					'id=>name',
					'id=>slug',
				], true ),
			],
		];
	}

	protected static function get_allowed_param_keys(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
			self::TAX_QUERY_KEY,
			self::IS_PUBLIC_KEY,
			self::ITEMS_COUNT_KEY,
		];
	}

	protected static function get_keys_to_encode(): array {
		return [
			self::EXCLUDED_TYPE_KEY,
			self::INCLUDED_TYPE_KEY,
			self::KEYS_CONVERSION_MAP_KEY,
			self::META_QUERY_KEY,
			self::TAX_QUERY_KEY,
			self::FIELDS_KEY,
		];
	}
}
