<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Resolver as Custom_Icon_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Search {
	const DEFAULT_PER_PAGE = 10;

	const MAX_PER_PAGE = 25;

	const MAX_QUERIES = 10;

	const MAX_QUERY_LENGTH = 100;

	const MAX_QUERY_WORDS = 10;

	/**
	 * @param array{queries?: array|string, library?: string, category?: string, page?: int, per_page?: int} $args
	 */
	public static function search( array $args ): array {
		$queries = self::sanitize_queries( $args['queries'] ?? [] );
		$library = self::sanitize_text( $args['library'] ?? '' );
		$category = self::sanitize_text( $args['category'] ?? '' );
		$per_page = self::sanitize_per_page( $args['per_page'] ?? self::DEFAULT_PER_PAGE );
		$page = max( 1, (int) ( $args['page'] ?? 1 ) );

		$custom_libraries = Custom_Icon_Resolver::get_libraries();
		$custom_values = [];

		foreach ( array_keys( $custom_libraries ) as $custom_library ) {
			if ( '' !== $library && $custom_library !== $library ) {
				continue;
			}

			$custom_values[ $custom_library ] = Custom_Icon_Resolver::resolve_library_values( $custom_library )['values'];
		}

		if ( empty( $queries ) ) {
			if ( '' === $library && '' === $category ) {
				return [
					'error' => 'At least one of queries, library, or category is required.',
				];
			}

			$queries = [ '' ];
		}

		$results = [];

		foreach ( $queries as $query ) {
			$results[] = self::search_single( $query, $library, $category, $page, $per_page, $custom_values );
		}

		$response = [
			'results' => $results,
			'libraries' => array_merge( Icon_Catalog::get_libraries(), array_keys( $custom_libraries ) ),
			'custom_libraries' => $custom_libraries,
			'categories' => Icon_Catalog::get_categories(),
			'font_awesome_version' => Icon_Catalog::get_version(),
		];

		$sanitized_args = [
			'queries' => $queries,
			'library' => $library,
			'category' => $category,
			'page' => $page,
			'per_page' => $per_page,
		];

		$filtered = apply_filters( 'elementor/atomic-widgets/icons/search-results', $response, $sanitized_args );

		return is_array( $filtered ) ? $filtered : $response;
	}

	private static function search_single( string $query, string $library, string $category, int $page, int $per_page, array $custom_values ): array {
		$scored = self::score_catalog( $query, $library, $category );

		if ( '' === $category ) {
			$scored = array_merge( $scored, self::score_custom_libraries( $query, $library, $custom_values ) );
		}

		usort( $scored, [ self::class, 'compare_scored' ] );

		$total = count( $scored );
		$offset = ( $page - 1 ) * $per_page;
		$matches = array_map(
			static fn( $entry ) => $entry['match'],
			array_slice( $scored, $offset, $per_page )
		);

		return [
			'query' => $query,
			'matches' => array_values( $matches ),
			'total' => $total,
			'page' => $page,
			'per_page' => $per_page,
			'truncated' => $total > $offset + count( $matches ),
		];
	}

	private static function compare_scored( array $a, array $b ): int {
		if ( $a['score'] !== $b['score'] ) {
			return $b['score'] <=> $a['score'];
		}

		$a_length = strlen( $a['match']['name'] );
		$b_length = strlen( $b['match']['name'] );

		if ( $a_length !== $b_length ) {
			return $a_length <=> $b_length;
		}

		return strcmp( $a['match']['value'], $b['match']['value'] );
	}

	private static function score_catalog( string $query, string $library, string $category ): array {
		$normalized = Icon_Matcher::normalize( $query );
		$tokens = Icon_Matcher::tokenize( $normalized );
		$scored = [];

		foreach ( Icon_Catalog::get_entries() as $entry ) {
			if ( '' !== $library && $entry['library'] !== $library ) {
				continue;
			}

			if ( '' !== $category && ! Icon_Matcher::has_category( $entry, $category ) ) {
				continue;
			}

			$best = '' === $normalized && '' !== $category
				? Icon_Matcher::result( Icon_Matcher::SCORE_EXACT_CATEGORY, Icon_Matcher::MATCHED_ON_CATEGORY )
				: Icon_Matcher::match( $entry, $normalized, $tokens );

			if ( $best ) {
				$scored[] = self::scored_entry( $entry, $best );
			}
		}

		return $scored;
	}

	private static function score_custom_libraries( string $query, string $library, array $custom_values ): array {
		$normalized = Icon_Matcher::normalize( $query );

		if ( '' === $normalized ) {
			return [];
		}

		$tokens = Icon_Matcher::tokenize( $normalized );
		$scored = [];

		foreach ( $custom_values as $custom_library => $values ) {
			foreach ( $values as $name => $value ) {
				$normalized_name = Icon_Matcher::normalize( (string) $name );

				$exact_match = $normalized_name === $normalized;
				$has_all_tokens = ! empty( $tokens );

				if ( ! $exact_match && ! empty( $tokens ) ) {
					foreach ( $tokens as $token ) {
						$pattern = '/(^|-|\\s)' . preg_quote( $token, '/' ) . '($|-|\\s)/';
						if ( ! preg_match( $pattern, $normalized_name ) ) {
							$has_all_tokens = false;
							break;
						}
					}
				}

				if ( ! $exact_match && ! $has_all_tokens ) {
					continue;
				}

				$scored[] = self::scored_entry(
					[
						'value' => $value,
						'library' => $custom_library,
						'name' => (string) $name,
						'label' => str_replace( '-', ' ', $normalized_name ),
						'license' => Icon_Catalog::LICENSE_FREE,
					],
					Icon_Matcher::result(
						$exact_match ? Icon_Matcher::SCORE_EXACT_NAME : Icon_Matcher::SCORE_SUBSTRING_NAME,
						Icon_Matcher::MATCHED_ON_CUSTOM_NAME
					)
				);
			}
		}

		return $scored;
	}

	private static function scored_entry( array $entry, array $best ): array {
		return [
			'score' => $best['score'],
			'match' => [
				'value' => $entry['value'],
				'library' => $entry['library'],
				'name' => $entry['name'],
				'label' => $entry['label'],
				'matched_on' => $best['matched_on'],
				'license' => $entry['license'],
			],
		];
	}

	/**
	 * @return string[]
	 */
	private static function sanitize_queries( $queries ): array {
		if ( is_string( $queries ) ) {
			$queries = [ $queries ];
		}

		if ( ! is_array( $queries ) ) {
			return [];
		}

		$sanitized = [];

		foreach ( $queries as $query ) {
			$query = self::sanitize_text( $query );

			if ( '' !== $query && ! in_array( $query, $sanitized, true ) ) {
				$sanitized[] = $query;
			}

			if ( count( $sanitized ) >= self::MAX_QUERIES ) {
				break;
			}
		}

		return $sanitized;
	}

	private static function sanitize_text( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$text = mb_substr( trim( $value ), 0, self::MAX_QUERY_LENGTH );
		$parts = explode( ' ', $text );

		if ( count( $parts ) > self::MAX_QUERY_WORDS ) {
			$parts = array_slice( $parts, 0, self::MAX_QUERY_WORDS );
		}

		return implode( ' ', $parts );
	}

	private static function sanitize_per_page( $per_page ): int {
		$per_page = (int) $per_page;

		if ( $per_page < 1 ) {
			return self::DEFAULT_PER_PAGE;
		}

		return min( $per_page, self::MAX_PER_PAGE );
	}
}
