import { type CSSPropertyMapping, searchCSSProperties, CSS_PROPERTY_MAPPINGS } from './css-property-search-map';
import { semanticSearchCSSProperties } from './semantic-search';

export interface HybridSearchResult {
	results: CSSPropertyMapping[];
	searchType: 'traditional' | 'fuzzy' | 'semantic';
	disableFiltering: boolean;
}

/**
 * Hybrid CSS property search with intelligent fallbacks
 * 1. < 3 chars: Traditional search (regular autocomplete)
 * 2. >= 3 chars: Fuzzy search first (for typos)
 * 3. No good fuzzy results: Fall back to semantic search (for concepts)
 * @param query
 */
export async function hybridCSSPropertySearch( query: string ): Promise< HybridSearchResult > {
	// For short queries (< 3 chars), use traditional search with regular autocomplete
	if ( query.length < 3 ) {
		const results = searchCSSProperties( query );
		return {
			results,
			searchType: 'traditional',
			disableFiltering: false, // Allow autocomplete filtering
		};
	}

	// Try fuzzy search for longer queries (>= 3 chars)
	const fuzzyResults = fuzzySearchCSSProperties( query );

	// Check if fuzzy results are high-quality (good typo matches)
	if ( fuzzyResults.length > 0 ) {
		// Get the best fuzzy score to determine quality
		const bestScore = getBestFuzzyScore( query, fuzzyResults );

		// Only use fuzzy results if they're high-quality matches (>= 0.6)
		// This allows semantic search for conceptual queries like "pink" → "color"
		if ( bestScore >= 0.6 ) {
			return {
				results: fuzzyResults,
				searchType: 'fuzzy',
				disableFiltering: true, // Disable filtering - we already found the best matches
			};
		}
	}

	// Fall back to semantic search if no good fuzzy results
	try {
		const semanticResults = await semanticSearchCSSProperties( query, 10, 0.2 );
		return {
			results: semanticResults,
			searchType: 'semantic',
			disableFiltering: true, // Disable filtering for semantic results
		};
	} catch {
		// If semantic search fails, fall back to traditional search or low-quality fuzzy results
		if ( fuzzyResults.length > 0 ) {
			// Use the fuzzy results we found, even if they're low quality
			return {
				results: fuzzyResults,
				searchType: 'fuzzy',
				disableFiltering: true,
			};
		} else {
			// Last resort: traditional search
			const traditionalResults = searchCSSProperties( query );
			return {
				results: traditionalResults,
				searchType: 'traditional',
				disableFiltering: false,
			};
		}
	}
}

/**
 * Fuzzy search implementation using Levenshtein distance
 * @param query
 */
function fuzzySearchCSSProperties( query: string ): CSSPropertyMapping[] {
	const normalizedQuery = query.toLowerCase().trim();
	const results: Array< { mapping: CSSPropertyMapping; score: number } > = [];

	for ( const mapping of CSS_PROPERTY_MAPPINGS ) {
		let bestScore = 0;

		// Check property name
		const propertyScore = calculateFuzzyScore( normalizedQuery, mapping.property );
		if ( propertyScore > bestScore ) {
			bestScore = propertyScore;
		}

		// Check display name
		const displayScore = calculateFuzzyScore( normalizedQuery, mapping.displayName.toLowerCase() );
		if ( displayScore > bestScore ) {
			bestScore = displayScore;
		}

		// Check keywords
		for ( const keyword of mapping.keywords ) {
			const keywordScore = calculateFuzzyScore( normalizedQuery, keyword );
			if ( keywordScore > bestScore ) {
				bestScore = keywordScore;
			}
		}

		// Only include results with reasonable similarity (> 0.3 for fuzzy matching)
		if ( bestScore > 0.3 ) {
			results.push( { mapping, score: bestScore } );
		}
	}

	// Sort by score (highest first) and return top 3 fuzzy matches
	results.sort( ( a, b ) => b.score - a.score );
	return results
		.slice( 0, 3 )
		.map( ( result ) => result.mapping );
}

/**
 * Calculate fuzzy similarity using Levenshtein distance
 * @param str1
 * @param str2
 */
function calculateFuzzyScore( str1: string, str2: string ): number {
	if ( str1 === str2 ) {
		return 1;
	}
	if ( str1.length === 0 || str2.length === 0 ) {
		return 0;
	}

	// For very different lengths, reduce score
	const lengthDiff = Math.abs( str1.length - str2.length );
	const maxLength = Math.max( str1.length, str2.length );
	if ( lengthDiff / maxLength > 0.5 ) {
		return 0;
	}

	const distance = levenshteinDistance( str1, str2 );
	const score = 1 - distance / maxLength;

	return score;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param str1
 * @param str2
 */
function levenshteinDistance( str1: string, str2: string ): number {
	const matrix: number[][] = [];

	for ( let i = 0; i <= str2.length; i++ ) {
		matrix[ i ] = [ i ];
	}

	for ( let j = 0; j <= str1.length; j++ ) {
		matrix[ 0 ][ j ] = j;
	}

	for ( let i = 1; i <= str2.length; i++ ) {
		for ( let j = 1; j <= str1.length; j++ ) {
			if ( str2.charAt( i - 1 ) === str1.charAt( j - 1 ) ) {
				matrix[ i ][ j ] = matrix[ i - 1 ][ j - 1 ];
			} else {
				matrix[ i ][ j ] = Math.min(
					matrix[ i - 1 ][ j - 1 ] + 1, // substitution
					matrix[ i ][ j - 1 ] + 1, // insertion
					matrix[ i - 1 ][ j ] + 1 // deletion
				);
			}
		}
	}

	return matrix[ str2.length ][ str1.length ];
}

/**
 * Get the best fuzzy score for a query against a set of results
 */
function getBestFuzzyScore( query: string, results: CSSPropertyMapping[] ): number {
	const normalizedQuery = query.toLowerCase().trim();
	let bestScore = 0;

	for ( const mapping of results ) {
		// Check property name
		const propertyScore = calculateFuzzyScore( normalizedQuery, mapping.property );
		if ( propertyScore > bestScore ) {
			bestScore = propertyScore;
		}

		// Check display name
		const displayScore = calculateFuzzyScore( normalizedQuery, mapping.displayName.toLowerCase() );
		if ( displayScore > bestScore ) {
			bestScore = displayScore;
		}

		// Check keywords
		for ( const keyword of mapping.keywords ) {
			const keywordScore = calculateFuzzyScore( normalizedQuery, keyword );
			if ( keywordScore > bestScore ) {
				bestScore = keywordScore;
			}
		}
	}

	return bestScore;
}
