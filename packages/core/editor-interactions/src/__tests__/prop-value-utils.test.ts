import {
	createExcludedBreakpoints,
	createInteractionBreakpoints,
	createString,
	extractExcludedBreakpoints,
} from '../utils/prop-value-utils';

describe( 'Breakpoints Utility Functions', () => {
	describe( 'createExcludedBreakpoints', () => {
		it( 'should create excluded breakpoints with empty array', () => {
			const result = createExcludedBreakpoints( [] );

			expect( result ).toEqual( {
				$$type: 'excluded-breakpoints',
				value: [],
			} );
		} );

		it( 'should create excluded breakpoints with single breakpoint', () => {
			const result = createExcludedBreakpoints( [ 'desktop' ] );

			expect( result ).toEqual( {
				$$type: 'excluded-breakpoints',
				value: [ { $$type: 'string', value: 'desktop' } ],
			} );
		} );

		it( 'should create excluded breakpoints with multiple breakpoints', () => {
			const result = createExcludedBreakpoints( [ 'desktop', 'tablet' ] );

			expect( result ).toEqual( {
				$$type: 'excluded-breakpoints',
				value: [
					{ $$type: 'string', value: 'desktop' },
					{ $$type: 'string', value: 'tablet' },
				],
			} );
		} );
	} );

	describe( 'createInteractionBreakpoints', () => {
		it( 'should create interaction breakpoints with empty excluded array', () => {
			const result = createInteractionBreakpoints( [] );

			expect( result ).toEqual( {
				$$type: 'interaction-breakpoints',
				value: {
					excluded: {
						$$type: 'excluded-breakpoints',
						value: [],
					},
				},
			} );
		} );

		it( 'should create interaction breakpoints with excluded breakpoints', () => {
			const result = createInteractionBreakpoints( [ 'desktop', 'tablet' ] );

			expect( result ).toEqual( {
				$$type: 'interaction-breakpoints',
				value: {
					excluded: {
						$$type: 'excluded-breakpoints',
						value: [
							{ $$type: 'string', value: 'desktop' },
							{ $$type: 'string', value: 'tablet' },
						],
					},
				},
			} );
		} );

		it( 'should create proper structure with all breakpoints excluded', () => {
			const result = createInteractionBreakpoints( [ 'desktop', 'tablet', 'mobile' ] );

			expect( result.$$type ).toBe( 'interaction-breakpoints' );
			expect( result.value.excluded.$$type ).toBe( 'excluded-breakpoints' );
			expect( result.value.excluded.value ).toHaveLength( 3 );
		} );
	} );

	describe( 'extractExcludedBreakpoints', () => {
		it( 'should return empty array when breakpoints is undefined', () => {
			const result = extractExcludedBreakpoints( undefined );

			expect( result ).toEqual( [] );
		} );

		it( 'should extract empty array from breakpoints with no exclusions', () => {
			const breakpoints = createInteractionBreakpoints( [] );
			const result = extractExcludedBreakpoints( breakpoints );

			expect( result ).toEqual( [] );
		} );

		it( 'should extract single excluded breakpoint', () => {
			const breakpoints = createInteractionBreakpoints( [ 'desktop' ] );
			const result = extractExcludedBreakpoints( breakpoints );

			expect( result ).toEqual( [ 'desktop' ] );
		} );

		it( 'should extract multiple excluded breakpoints', () => {
			const breakpoints = createInteractionBreakpoints( [ 'desktop', 'tablet' ] );
			const result = extractExcludedBreakpoints( breakpoints );

			expect( result ).toEqual( [ 'desktop', 'tablet' ] );
		} );

		it( 'should extract all excluded breakpoints correctly', () => {
			const breakpoints = createInteractionBreakpoints( [ 'desktop', 'tablet', 'mobile' ] );
			const result = extractExcludedBreakpoints( breakpoints );

			expect( result ).toEqual( [ 'desktop', 'tablet', 'mobile' ] );
		} );

		it( 'should handle manually created breakpoints structure', () => {
			const breakpoints = {
				$$type: 'interaction-breakpoints' as const,
				value: {
					excluded: {
						$$type: 'excluded-breakpoints' as const,
						value: [ createString( 'desktop' ), createString( 'mobile' ) ],
					},
				},
			};

			const result = extractExcludedBreakpoints( breakpoints );

			expect( result ).toEqual( [ 'desktop', 'mobile' ] );
		} );
	} );

	describe( 'Integration tests', () => {
		it( 'should create and extract breakpoints consistently', () => {
			const originalExcluded = [ 'desktop', 'tablet' ];
			const breakpoints = createInteractionBreakpoints( originalExcluded );
			const extracted = extractExcludedBreakpoints( breakpoints );

			expect( extracted ).toEqual( originalExcluded );
		} );

		it( 'should handle round-trip with empty array', () => {
			const originalExcluded: string[] = [];
			const breakpoints = createInteractionBreakpoints( originalExcluded );
			const extracted = extractExcludedBreakpoints( breakpoints );

			expect( extracted ).toEqual( originalExcluded );
		} );

		it( 'should handle round-trip with all breakpoints', () => {
			const originalExcluded = [ 'desktop', 'tablet', 'mobile' ];
			const breakpoints = createInteractionBreakpoints( originalExcluded );
			const extracted = extractExcludedBreakpoints( breakpoints );

			expect( extracted ).toEqual( originalExcluded );
		} );
	} );
} );
