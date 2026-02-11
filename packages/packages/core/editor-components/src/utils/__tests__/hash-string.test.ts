import { generateShortHash, hashString, hashToShortId } from '../hash-string';

describe( 'hash-string', () => {
	describe( 'hashString', () => {
		it( 'should return a positive integer', () => {
			// Act
			const result = hashString( 'test' );

			// Assert
			expect( typeof result ).toBe( 'number' );
			expect( result ).toBeGreaterThan( 0 );
			expect( Number.isInteger( result ) ).toBe( true );
		} );

		it( 'should be deterministic (same input = same output)', () => {
			// Arrange
			const input = 'instance-abc-123';

			// Act
			const hash1 = hashString( input );
			const hash2 = hashString( input );
			const hash3 = hashString( input );

			// Assert
			expect( hash1 ).toBe( hash2 );
			expect( hash2 ).toBe( hash3 );
		} );

		it( 'should generate different hashes for different inputs', () => {
			// Act
			const hash1 = hashString( 'instance-a' );
			const hash2 = hashString( 'instance-b' );
			const hash3 = hashString( 'instance-c' );

			// Assert
			expect( hash1 ).not.toBe( hash2 );
			expect( hash2 ).not.toBe( hash3 );
			expect( hash1 ).not.toBe( hash3 );
		} );

		it( 'should handle empty string', () => {
			// Act
			const result = hashString( '' );

			// Assert
			expect( result ).toBe( 2166136261 ); // FNV offset basis
		} );

		it( 'should handle unicode characters', () => {
			// Act
			const result = hashString( 'תשובה-בעברית-🎉' );

			// Assert
			expect( typeof result ).toBe( 'number' );
			expect( result ).toBeGreaterThan( 0 );
		} );

		it( 'should be sensitive to character order', () => {
			// Act
			const hash1 = hashString( 'abc' );
			const hash2 = hashString( 'cba' );

			// Assert
			expect( hash1 ).not.toBe( hash2 );
		} );
	} );

	describe( 'hashToShortId', () => {
		it( 'should convert hash to base36 string', () => {
			// Arrange
			const hash = 123456789;

			// Act
			const result = hashToShortId( hash );

			// Assert
			expect( typeof result ).toBe( 'string' );
			expect( result ).toMatch( /^[0-9a-z]+$/ ); // Only lowercase alphanumeric
		} );

		it( 'should respect length parameter', () => {
			// Arrange
			const hash = 123456789;

			// Act
			const result5 = hashToShortId( hash, 5 );
			const result7 = hashToShortId( hash, 7 );
			const result10 = hashToShortId( hash, 10 );

			// Assert
			expect( result5.length ).toBeLessThanOrEqual( 5 );
			expect( result7.length ).toBeLessThanOrEqual( 7 );
			expect( result10.length ).toBeLessThanOrEqual( 10 );
		} );

		it( 'should default to 7 characters', () => {
			// Arrange
			const hash = 4294967295; // Max 32-bit unsigned int

			// Act
			const result = hashToShortId( hash );

			// Assert
			expect( result.length ).toBeLessThanOrEqual( 7 );
		} );
	} );

	describe( 'generateShortHash', () => {
		it( 'should combine hashing and base36 conversion', () => {
			// Arrange
			const input = 'test-string';

			// Act
			const directResult = generateShortHash( input );
			const manualResult = hashToShortId( hashString( input ) );

			// Assert
			expect( directResult ).toBe( manualResult );
		} );

		it( 'should be deterministic', () => {
			// Arrange
			const input = 'instance-abc_instance-xyz';

			// Act
			const result1 = generateShortHash( input );
			const result2 = generateShortHash( input );

			// Assert
			expect( result1 ).toBe( result2 );
		} );

		it( 'should generate short alphanumeric strings', () => {
			// Arrange
			const inputs = [
				'short',
				'very-long-instance-chain-with-many-components',
				'inst1_inst2_inst3_inst4_inst5',
			];

			// Act & Assert
			inputs.forEach( ( input ) => {
				const result = generateShortHash( input );
				expect( result.length ).toBeLessThanOrEqual( 7 );
				expect( result ).toMatch( /^[0-9a-z]+$/ );
			} );
		} );

		it( 'should generate different hashes for nested component chains', () => {
			// Arrange
			const chain1 = 'inst-a';
			const chain2 = 'inst-a_inst-b';
			const chain3 = 'inst-a_inst-b_inst-c';

			// Act
			const hash1 = generateShortHash( chain1 );
			const hash2 = generateShortHash( chain2 );
			const hash3 = generateShortHash( chain3 );

			// Assert
			expect( hash1 ).not.toBe( hash2 );
			expect( hash2 ).not.toBe( hash3 );
			expect( hash1 ).not.toBe( hash3 );
		} );
	} );

	describe( 'real-world scenarios', () => {
		it( 'should handle typical component instance IDs', () => {
			// Arrange
			const typicalIds = [
				'abc1234',
				'6f8a9b2',
				'instance-abc-123',
				'comp_inst_001',
			];

			// Act & Assert
			typicalIds.forEach( ( id ) => {
				const hash = generateShortHash( id );
				expect( hash.length ).toBeLessThanOrEqual( 7 );
				expect( hash ).toMatch( /^[0-9a-z]+$/ );
			} );
		} );

		it( 'should handle deeply nested component chains', () => {
			// Arrange
			const chain = 'inst1_inst2_inst3_inst4_inst5_inst6_inst7_inst8';

			// Act
			const hash = generateShortHash( chain );

			// Assert
			expect( hash.length ).toBeLessThanOrEqual( 7 );
			expect( hash ).toMatch( /^[0-9a-z]+$/ );
		} );

		it( 'should produce consistent results for common patterns', () => {
			// Arrange
			const pattern = 'component-instance-{n}';
			const ids = Array.from( { length: 100 }, ( _, i ) => pattern.replace( '{n}', String( i ) ) );

			// Act
			const hashes = ids.map( ( id ) => generateShortHash( id ) );
			const uniqueHashes = new Set( hashes );

			// Assert - all should be unique
			expect( uniqueHashes.size ).toBe( 100 );
		} );
	} );
} );
