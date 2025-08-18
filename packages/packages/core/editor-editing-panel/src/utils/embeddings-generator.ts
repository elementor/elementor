import { env, type FeatureExtractionPipeline, pipeline } from '@xenova/transformers';

import { CSS_PROPERTY_MAPPINGS, type CSSPropertyMapping } from './css-property-search-map';

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
 * Generate search text for a CSS property mapping
 * This combines all relevant text that should be searchable
 * @param mapping
 */
function generateSearchText( mapping: CSSPropertyMapping ): string {
	const parts = [ mapping.property, mapping.displayName, mapping.section, ...mapping.keywords ];

	return parts.join( ' ' ).toLowerCase();
}

/**
 * Generate embedding for a single text
 * @param text
 */
export async function generateEmbedding( text: string ): Promise< number[] > {
	const extractor = await initializeFeatureExtractor();
	const result = await extractor( text, { pooling: 'mean', normalize: true } );

	// Convert tensor to array
	return Array.from( result.data as Float32Array );
}

/**
 * Generate embeddings for all CSS property mappings
 */
export async function generateAllEmbeddings(): Promise< CSSPropertyEmbedding[] > {
	// Generating embeddings for CSS properties

	const embeddings: CSSPropertyEmbedding[] = [];

	for ( let i = 0; i < CSS_PROPERTY_MAPPINGS.length; i++ ) {
		const mapping = CSS_PROPERTY_MAPPINGS[ i ];
		const searchText = generateSearchText( mapping );

		// Generating embedding for property

		try {
			const embedding = await generateEmbedding( searchText );

			embeddings.push( {
				property: mapping.property,
				section: mapping.section,
				displayName: mapping.displayName,
				keywords: mapping.keywords,
				embedding,
				searchText,
			} );
		} catch {
			// Failed to generate embedding for property
		}
	}

	// Finished generating embeddings
	return embeddings;
}

/**
 * Save embeddings to a JSON file
 * @param embeddings
 */
export function saveEmbeddingsToFile( embeddings: CSSPropertyEmbedding[] ): string {
	const embeddingsData = {
		modelName: 'Xenova/all-MiniLM-L6-v2',
		generatedAt: new Date().toISOString(),
		embeddings,
	};

	return JSON.stringify( embeddingsData, null, 2 );
}

/**
 * Main function to generate and save embeddings
 */
export async function generateAndSaveEmbeddings(): Promise< string > {
	try {
		const embeddings = await generateAllEmbeddings();
		const fileContent = saveEmbeddingsToFile( embeddings );
		return fileContent;
	} catch ( error ) {
		// Error generating embeddings
		throw error;
	}
}
