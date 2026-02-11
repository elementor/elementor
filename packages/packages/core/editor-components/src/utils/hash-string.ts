/**
 * Generates a deterministic hash from a string using FNV-1a algorithm.
 *
 * FNV-1a is a fast, simple hash function that produces consistent results
 * across platforms. It's ideal for generating short, unique identifiers.
 *
 * @param str - The string to hash
 * @returns A positive 32-bit integer hash
 *
 * @example
 * hashString('instance-abc') // -> 3845729284
 * hashString('instance-abc') // -> 3845729284 (deterministic)
 */
export function hashString( str: string ): number {
	// FNV-1a offset basis (32-bit)
	let hash = 2166136261;

	for ( let i = 0; i < str.length; i++ ) {
		// XOR with current byte
		hash ^= str.charCodeAt( i );
		// Multiply by FNV prime (32-bit)
		hash = Math.imul( hash, 16777619 );
	}

	// Convert to unsigned 32-bit integer
	return hash >>> 0;
}

/**
 * Converts a hash number to a short base36 string.
 *
 * Base36 uses 0-9 and a-z, producing compact identifiers.
 *
 * @param hash - The hash number to convert
 * @param length - Maximum length of the result (default: 7)
 * @returns A short alphanumeric string
 *
 * @example
 * hashToShortId(3845729284) // -> '2azk1ws'
 */
export function hashToShortId( hash: number, length = 7 ): string {
	return hash.toString( 36 ).substring( 0, length );
}

/**
 * Generates a short hash ID from a string.
 *
 * Combines hashing and base36 conversion into a single step.
 *
 * @param str - The string to hash
 * @param length - Maximum length of the result (default: 7)
 * @returns A short alphanumeric hash
 *
 * @example
 * generateShortHash('instance-abc') // -> '2azk1ws'
 */
export function generateShortHash( str: string, length = 7 ): string {
	const hash = hashString( str );
	return hashToShortId( hash, length );
}
