<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Search {
	const DEFAULT_PER_PAGE = 10;

	const MAX_PER_PAGE = 25;

	const MAX_QUERIES = 10;

	const MAX_QUERY_LENGTH = 100;

	const MATCHED_ON_NAME = 'name';

	const MATCHED_ON_ALIAS = 'alias';

	const MATCHED_ON_TERM = 'term';

	const MATCHED_ON_CATEGORY = 'category';

	const MATCHED_ON_LIBRARY = 'library';

	const SCORE_EXACT_NAME = 100;

	const SCORE_EXACT_ALIAS = 90;

	const SCORE_NAME_WORD = 80;

	const SCORE_EXACT_TERM = 70;

	const SCORE_ALL_WORDS = 50;

	const SCORE_SOME_WORDS = 30;

	const SCORE_NAME_BONUS = 5;

	const MAX_EXACT_WORD_BONUS = 4;

	const MIN_WORD_LENGTH = 3;

	const IGNORED_WORDS = [ 'and', 'button', 'for', 'icon', 'icons', 'image', 'logo', 'page', 'symbol', 'the', 'with' ];

	const SCORE_CATEGORY = 20;

	const SCORE_BROWSE = 10;

	public static function search( array $args ): array {
		$queries = self::sanitize_queries( $args['queries'] ?? [] );
		$library = self::sanitize_text( $args['library'] ?? '' );
		$category = self::sanitize_text( $args['category'] ?? '' );
		$per_page = min( self::MAX_PER_PAGE, max( 1, (int) ( $args['per_page'] ?? self::DEFAULT_PER_PAGE ) ) );
		$page = max( 1, (int) ( $args['page'] ?? 1 ) );

		if ( empty( $queries ) ) {
			if ( '' === $library && '' === $category ) {
				return [
					'error' => __( 'At least one of queries, library, or category is required.', 'elementor' ),
				];
			}

			$queries = [ '' ];
		}

		$custom_library_labels = Icon_Libraries::get_custom_libraries();
		$custom_library_names = array_map( 'strval', array_keys( $custom_library_labels ) );
		$truncated_custom_libraries = [];
		$entries = self::get_entries( $library, $category, $custom_library_names, $truncated_custom_libraries );

		$results = [];

		$browse_matched_on = '' !== $library ? self::MATCHED_ON_LIBRARY : self::MATCHED_ON_CATEGORY;

		foreach ( $queries as $query ) {
			$results[] = self::search_single( $entries, $query, $page, $per_page, $browse_matched_on );
		}

		$response = [
			'results' => $results,
			'font_awesome_version' => Icon_Catalog::get_version(),
		];

		if ( self::needs_site_facets( $results ) ) {
			$response['libraries'] = array_merge( Icon_Catalog::get_libraries(), $custom_library_names );
			$response['custom_libraries'] = empty( $custom_library_labels ) ? (object) [] : $custom_library_labels;
			$response['categories'] = Icon_Catalog::get_categories();
		}

		if ( ! empty( $truncated_custom_libraries ) ) {
			$response['truncated_custom_libraries'] = $truncated_custom_libraries;
		}

		return $response;
	}

	private static function needs_site_facets( array $results ): bool {
		foreach ( $results as $result ) {
			if ( '' === $result['query'] ) {
				return true;
			}
		}

		return 0 === array_sum( array_column( $results, 'total' ) );
	}

	private static function get_entries( string $library, string $category, array $custom_libraries, array &$truncated_custom_libraries ): array {
		$entries = array_filter(
			Icon_Catalog::get_entries(),
			static fn( $entry ) => ( '' === $library || $entry['library'] === $library )
				&& ( '' === $category || in_array( self::normalize( $category ), array_map( [ self::class, 'normalize' ], $entry['categories'] ), true ) )
		);

		if ( '' !== $category ) {
			return $entries;
		}

		foreach ( $custom_libraries as $custom_library ) {
			if ( '' !== $library && $custom_library !== $library ) {
				continue;
			}

			$resolved = Icon_Libraries::resolve_library_values( $custom_library );

			if ( $resolved['truncated'] ) {
				$truncated_custom_libraries[] = $custom_library;
			}

			foreach ( $resolved['values'] as $name => $value ) {
				$entries[] = [
					'name' => (string) $name,
					'library' => $custom_library,
					'value' => $value,
					'label' => str_replace( '-', ' ', (string) $name ),
					'aliases' => [],
					'terms' => [],
					'categories' => [],
					'license' => Icon_Catalog::LICENSE_FREE,
					'is_custom' => true,
				];
			}
		}

		return $entries;
	}

	private static function search_single( array $entries, string $query, int $page, int $per_page, string $browse_matched_on ): array {
		$normalized = self::normalize( $query );
		$scored = [];

		foreach ( $entries as $entry ) {
			$match = '' === $normalized
				? [ self::SCORE_BROWSE, $browse_matched_on ]
				: self::match( $entry, $normalized );

			if ( $match && self::is_renderable( $entry ) ) {
				$scored[] = [ $match[0], $entry, $match[1] ];
			}
		}

		usort( $scored, static fn( $a, $b ) => [ $b[0], ! empty( $b[1]['is_custom'] ), count( $b[1]['terms'] ), strlen( $a[1]['name'] ), $a[1]['value'] ] <=> [ $a[0], ! empty( $a[1]['is_custom'] ), count( $a[1]['terms'] ), strlen( $b[1]['name'] ), $b[1]['value'] ] );

		$offset = ( $page - 1 ) * $per_page;
		$matches = array_map(
			static fn( $item ) => [
				'value' => $item[1]['value'],
				'library' => $item[1]['library'],
				'name' => $item[1]['name'],
				'label' => $item[1]['label'],
				'matched_on' => $item[2],
				'license' => $item[1]['license'],
			],
			array_slice( $scored, $offset, $per_page )
		);

		return [
			'query' => $query,
			'matches' => $matches,
			'total' => count( $scored ),
			'page' => $page,
			'per_page' => $per_page,
			'truncated' => count( $scored ) > $offset + count( $matches ),
		];
	}

	private static function is_renderable( array $entry ): bool {
		return empty( $entry['is_custom'] ) || Icon_Libraries::is_renderable_value( $entry['library'], $entry['value'] );
	}

	/**
	 * @return array{0: int, 1: string}|null
	 */
	private static function match( array $entry, string $query ): ?array {
		$name = self::normalize( $entry['name'] );
		$aliases = array_map( [ self::class, 'normalize' ], $entry['aliases'] );
		$terms = array_map( [ self::class, 'normalize' ], $entry['terms'] );

		if ( $name === $query ) {
			return [ self::SCORE_EXACT_NAME, self::MATCHED_ON_NAME ];
		}

		if ( in_array( $query, $aliases, true ) ) {
			return [ self::SCORE_EXACT_ALIAS, self::MATCHED_ON_ALIAS ];
		}

		if ( preg_match( '/(^|-)' . preg_quote( $query, '/' ) . '(-|$)/', $name ) ) {
			return [ self::SCORE_NAME_WORD, self::MATCHED_ON_NAME ];
		}

		if ( in_array( $query, $terms, true ) ) {
			return [ self::SCORE_EXACT_TERM, self::MATCHED_ON_TERM ];
		}

		$words = self::significant_words( $query );

		if ( ! empty( $words ) ) {
			$name_words = explode( '-', $name );
			$known_words = array_merge( $name_words, ...array_map( static fn( $item ) => explode( '-', $item ), array_merge( $aliases, $terms ) ) );
			$matched_words = array_intersect( $words, $known_words );
			$matched_on = empty( array_diff( $matched_words, $name_words ) ) ? self::MATCHED_ON_NAME : self::MATCHED_ON_TERM;
			$exact_words = count( array_intersect( $matched_words, array_merge( $name_words, $terms ) ) );
			$bonus = ( self::MATCHED_ON_NAME === $matched_on ? self::SCORE_NAME_BONUS : 0 ) + min( $exact_words, self::MAX_EXACT_WORD_BONUS );

			if ( count( $matched_words ) === count( $words ) ) {
				return [ self::SCORE_ALL_WORDS + $bonus, $matched_on ];
			}

			if ( ! empty( $matched_words ) ) {
				return [ self::SCORE_SOME_WORDS + count( $matched_words ) + $bonus, $matched_on ];
			}
		}

		if ( in_array( $query, array_map( [ self::class, 'normalize' ], $entry['categories'] ), true ) ) {
			return [ self::SCORE_CATEGORY, self::MATCHED_ON_CATEGORY ];
		}

		return null;
	}

	/**
	 * @return string[]
	 */
	private static function significant_words( string $query ): array {
		return array_values( array_unique( array_filter(
			explode( '-', $query ),
			static fn( $word ) => strlen( $word ) >= self::MIN_WORD_LENGTH && ! in_array( $word, self::IGNORED_WORDS, true )
		) ) );
	}

	private static function normalize( string $value ): string {
		return trim( (string) preg_replace( '/[^a-z0-9]+/', '-', strtolower( $value ) ), '-' );
	}

	/**
	 * @return string[]
	 */
	private static function sanitize_queries( $queries ): array {
		if ( ! is_array( $queries ) ) {
			$queries = [ $queries ];
		}

		$sanitized = array_values( array_unique( array_filter( array_map( [ self::class, 'sanitize_text' ], $queries ), 'strlen' ) ) );

		return array_slice( $sanitized, 0, self::MAX_QUERIES );
	}

	private static function sanitize_text( $value ): string {
		return is_string( $value ) ? mb_substr( trim( $value ), 0, self::MAX_QUERY_LENGTH ) : '';
	}
}
