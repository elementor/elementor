import { env, type FeatureExtractionPipeline, pipeline } from '@xenova/transformers';

import { CSS_PROPERTY_MAPPINGS, type CSSPropertyMapping, searchCSSProperties } from './css-property-search-map';

// Import embeddings data
const embeddingsData = require( './css-property-embeddings.json' );

type SimilarityResult = {
	property: string;
	section: string;
	displayName: string;
	similarity: number;
	keywords: string[];
};

// Configure transformers to use remote models
env.allowRemoteModels = true;
env.allowLocalModels = false;

export type CSSPropertyEmbedding = {
	property: string;
	section: string;
	displayName: string;
	keywords: string[];
	embedding: number[];
	searchText: string;
};

/**
 * Cached feature extraction pipeline
 */
let featureExtractor: FeatureExtractionPipeline | null = null;

/**
 * Initialize the feature extraction pipeline
 */
async function initializeFeatureExtractor(): Promise< FeatureExtractionPipeline > {
	if ( ! featureExtractor ) {
		featureExtractor = await pipeline( 'feature-extraction', 'Xenova/all-MiniLM-L6-v2' );
	}
	return featureExtractor;
}

/**
 * Preload the semantic search model to improve first search performance
 * This should be called during application initialization
 */
export async function preloadSemanticSearchModel(): Promise< void > {
	try {
		await initializeFeatureExtractor();
	} catch {
		// Don't throw - we want the app to continue working even if preload fails
	}
}

/**
 * Generate embedding for a single text
 * @param text
 */
export async function generateEmbedding( text: string ): Promise< number[] > {
	const extractor = await initializeFeatureExtractor();
	const result = await extractor( text, { pooling: 'mean', normalize: true } );

	// Convert tensor to array
	const embedding = Array.from( result.data as Float32Array );

	return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 * @param embeddingA
 * @param embeddingB
 */
function cosineSimilarity( embeddingA: number[], embeddingB: number[] ): number {
	if ( embeddingA.length !== embeddingB.length ) {
		throw new Error( 'Embeddings must have the same dimensions' );
	}

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for ( let i = 0; i < embeddingA.length; i++ ) {
		dotProduct += embeddingA[ i ] * embeddingB[ i ];
		normA += embeddingA[ i ] * embeddingA[ i ];
		normB += embeddingB[ i ] * embeddingB[ i ];
	}

	normA = Math.sqrt( normA );
	normB = Math.sqrt( normB );

	if ( normA === 0 || normB === 0 ) {
		return 0;
	}

	return dotProduct / ( normA * normB );
}

/**
 * Search CSS properties using semantic similarity
 * @param query
 * @param maxResults
 * @param minSimilarity
 */
export async function semanticSearchCSSProperties(
	query: string,
	maxResults: number = 10,
	minSimilarity: number = 0.3
): Promise< CSSPropertyMapping[] > {
	try {
		if ( ! embeddingsData || ! embeddingsData.embeddings || embeddingsData.embeddings.length === 0 ) {
			throw new Error( 'Embeddings data not available' );
		}

		const queryEmbedding = await generateEmbedding( query );

		// Calculate similarities with all CSS properties
		const similarities: SimilarityResult[] = embeddingsData.embeddings.map(
			( cssEmbedding: CSSPropertyEmbedding ) => {
				const similarity = cosineSimilarity( queryEmbedding, cssEmbedding.embedding );
				return {
					property: cssEmbedding.property,
					section: cssEmbedding.section,
					displayName: cssEmbedding.displayName,
					similarity,
					keywords: cssEmbedding.keywords,
				};
			}
		);

		// Sort all results by similarity first
		const sortedSimilarities = similarities.sort( ( a, b ) => b.similarity - a.similarity );

		// Filter by minimum similarity and sort by similarity (descending)
		const filteredResults = sortedSimilarities
			.filter( ( result ) => result.similarity >= minSimilarity )
			.slice( 0, maxResults );

		// Convert back to CSSPropertyMapping format
		const mappings: CSSPropertyMapping[] = filteredResults.map( ( result ) => {
			// Find the original mapping to get the complete data including description
			const originalMapping = CSS_PROPERTY_MAPPINGS.find( ( mapping ) => mapping.property === result.property );

			if ( ! originalMapping ) {
				throw new Error( `Could not find original mapping for property: ${ result.property }` );
			}

			return originalMapping; // Return the complete original mapping
		} );

		return mappings;
	} catch ( error ) {
		throw new Error( `Semantic search model failed to load: ${ error }` );
	}
}

/**
 * Hybrid search that combines keyword-based and semantic search
 * @param query
 * @param keywordResults
 * @param maxResults
 */
export async function hybridSearchCSSProperties(
	query: string,
	keywordResults?: CSSPropertyMapping[],
	maxResults: number = 10
): Promise< CSSPropertyMapping[] > {
	try {
		// Get keyword results if not provided
		const keywordMappings = keywordResults || searchCSSProperties( query );

		// Get semantic search results with a lower threshold for better recall
		const semanticMappings = await semanticSearchCSSProperties( query, maxResults, 0.1 );

		// Combine results, prioritizing keyword matches
		const combinedResults = new Map< string, CSSPropertyMapping >();

		// Add keyword results first (higher priority)
		keywordMappings.forEach( ( mapping ) => {
			combinedResults.set( mapping.property, mapping );
		} );

		// Add semantic results if not already present
		semanticMappings.forEach( ( mapping ) => {
			if ( ! combinedResults.has( mapping.property ) ) {
				combinedResults.set( mapping.property, mapping );
			}
		} );

		// Convert to array and limit results
		const finalResults = Array.from( combinedResults.values() ).slice( 0, maxResults );

		return finalResults;
	} catch {
		// Fallback to keyword search only
		return keywordResults || searchCSSProperties( query );
	}
}
