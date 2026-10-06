<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Matcher {
	const MATCHED_ON_NAME = 'name';

	const MATCHED_ON_ALIAS = 'alias';

	const MATCHED_ON_LABEL = 'label';

	const MATCHED_ON_TERM = 'term';

	const MATCHED_ON_CATEGORY = 'category';

	const MATCHED_ON_CUSTOM_NAME = 'custom_name';

	const SCORE_EXACT_NAME = 1000;

	const SCORE_EXACT_ALIAS = 900;

	const SCORE_EXACT_LABEL = 800;

	const SCORE_EXACT_TERM = 700;

	const SCORE_PREFIX_NAME = 600;

	const SCORE_SUBSTRING_NAME = 500;

	const SCORE_SUBSTRING_ALIAS = 400;

	const SCORE_SUBSTRING_LABEL = 300;

	const SCORE_SUBSTRING_TERM = 200;

	const SCORE_EXACT_CATEGORY = 150;

	// A match on the whole query always beats a match on single words from it, so per-token scores are
	// squeezed into a band below every whole-query score. Inside the band, matching more of the words
	// wins, then matching them in the icon name rather than in its search terms.
	const SCORE_TOKEN_BAND_MAX = 149;

	const SCORE_PER_MATCHED_TOKEN = 40;

	const SCORE_PER_NAME_TOKEN = 20;

	const MIN_TOKEN_LENGTH = 3;

	// Words that appear in almost every prompt ("add an icon to the page") match hundreds of unrelated
	// icons through their search terms, which buries the icons the prompt is actually about.
	const IGNORED_TOKENS = [
		'and',
		'button',
		'for',
		'icon',
		'icons',
		'image',
		'logo',
		'page',
		'symbol',
		'the',
		'with',
	];

	private static array $normalized_cache = [];

	public static function reset(): void {
		self::$normalized_cache = [];
	}

	/**
	 * @return array{score: int, matched_on: string}|null
	 */
	public static function match( array $entry, string $normalized, array $tokens ): ?array {
		$best = self::match_whole_query( $entry, $normalized );

		if ( $best || empty( $tokens ) ) {
			return $best;
		}

		return self::match_tokens( $entry, $tokens );
	}

	public static function has_category( array $entry, string $category ): bool {
		return self::list_has_exact( $entry['categories'], self::normalize( $category ) );
	}

	public static function normalize( string $value ): string {
		if ( isset( self::$normalized_cache[ $value ] ) ) {
			return self::$normalized_cache[ $value ];
		}

		$normalized = strtolower( trim( $value ) );
		$normalized = trim( (string) preg_replace( '/[^a-z0-9]+/', '-', $normalized ), '-' );

		self::$normalized_cache[ $value ] = $normalized;

		return $normalized;
	}

	/**
	 * @return string[]
	 */
	public static function tokenize( string $normalized ): array {
		if ( ! str_contains( $normalized, '-' ) ) {
			return [];
		}

		return array_values( array_filter(
			explode( '-', $normalized ),
			static fn( $token ) => strlen( $token ) >= self::MIN_TOKEN_LENGTH
				&& ! in_array( $token, self::IGNORED_TOKENS, true )
		) );
	}

	public static function result( int $score, string $matched_on ): array {
		return [
			'score' => $score,
			'matched_on' => $matched_on,
		];
	}

	private static function match_tokens( array $entry, array $tokens ): ?array {
		$best = null;
		$matched_tokens = 0;
		$name_tokens = 0;

		foreach ( $tokens as $token ) {
			$match = self::match_whole_query( $entry, $token );

			if ( ! $match ) {
				continue;
			}

			++$matched_tokens;

			if ( self::MATCHED_ON_NAME === $match['matched_on'] ) {
				++$name_tokens;
			}

			if ( ! $best || $match['score'] > $best['score'] ) {
				$best = $match;
			}
		}

		if ( ! $best ) {
			return null;
		}

		$best['score'] = min(
			self::SCORE_TOKEN_BAND_MAX,
			( $matched_tokens * self::SCORE_PER_MATCHED_TOKEN )
				+ ( $name_tokens * self::SCORE_PER_NAME_TOKEN )
				+ intdiv( $best['score'], 100 )
		);

		return $best;
	}

	private static function match_whole_query( array $entry, string $needle ): ?array {
		if ( '' === $needle ) {
			return null;
		}

		$name = $entry['name'];
		$label = self::normalize( $entry['label'] );

		if ( $name === $needle ) {
			return self::result( self::SCORE_EXACT_NAME, self::MATCHED_ON_NAME );
		}

		if ( self::list_has_exact( $entry['aliases'], $needle ) ) {
			return self::result( self::SCORE_EXACT_ALIAS, self::MATCHED_ON_ALIAS );
		}

		if ( $label === $needle ) {
			return self::result( self::SCORE_EXACT_LABEL, self::MATCHED_ON_LABEL );
		}

		if ( self::list_has_exact( $entry['terms'], $needle ) ) {
			return self::result( self::SCORE_EXACT_TERM, self::MATCHED_ON_TERM );
		}

		if ( str_starts_with( $name, $needle ) ) {
			return self::result( self::SCORE_PREFIX_NAME, self::MATCHED_ON_NAME );
		}

		if ( str_contains( $name, $needle ) ) {
			return self::result( self::SCORE_SUBSTRING_NAME, self::MATCHED_ON_NAME );
		}

		if ( self::list_has_substring( $entry['aliases'], $needle ) ) {
			return self::result( self::SCORE_SUBSTRING_ALIAS, self::MATCHED_ON_ALIAS );
		}

		if ( str_contains( $label, $needle ) ) {
			return self::result( self::SCORE_SUBSTRING_LABEL, self::MATCHED_ON_LABEL );
		}

		if ( self::list_has_substring( $entry['terms'], $needle ) ) {
			return self::result( self::SCORE_SUBSTRING_TERM, self::MATCHED_ON_TERM );
		}

		if ( self::list_has_exact( $entry['categories'], $needle ) ) {
			return self::result( self::SCORE_EXACT_CATEGORY, self::MATCHED_ON_CATEGORY );
		}

		return null;
	}

	private static function list_has_exact( array $items, string $needle ): bool {
		foreach ( $items as $item ) {
			if ( self::normalize( (string) $item ) === $needle ) {
				return true;
			}
		}

		return false;
	}

	private static function list_has_substring( array $items, string $needle ): bool {
		foreach ( $items as $item ) {
			if ( str_contains( self::normalize( (string) $item ), $needle ) ) {
				return true;
			}
		}

		return false;
	}
}
