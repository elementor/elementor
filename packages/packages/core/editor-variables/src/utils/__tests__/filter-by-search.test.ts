import { filterBySearch } from '../filter-by-search';

type TestVariable = {
	label: string;
	value: string;
	type: string;
};

const SAMPLE_VARIABLES: TestVariable[] = [
	{ label: 'Primary Color', value: '#ff0000', type: 'color' },
	{ label: 'Secondary Color', value: '#00ff00', type: 'color' },
	{ label: 'Background Color', value: '#0000ff', type: 'color' },
	{ label: 'Text Size', value: '16px', type: 'dimension' },
	{ label: 'Header Font', value: 'Arial', type: 'font' },
	{ label: 'Border Radius', value: '8px', type: 'dimension' },
	{ label: 'primary-accent', value: '#ff6600', type: 'color' },
];

describe( 'filterBySearch', () => {
	it( 'should return all variables', () => {
		// Arrange.
		const searchValue = '';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result ).toEqual( SAMPLE_VARIABLES );
		expect( result ).toHaveLength( 7 );
	} );

	it( 'should return variables with exact label match', () => {
		// Arrange.
		const searchValue = 'Text Size';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].label ).toBe( 'Text Size' );
	} );

	it( 'should return variables with exact lowercase label match', () => {
		// Arrange.
		const searchValue = 'header font';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].label ).toBe( 'Header Font' );
	} );

	it( 'should return variables containing search term in label', () => {
		// Arrange.
		const searchValue = 'color';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result ).toHaveLength( 3 );
		expect( result.map( ( v ) => v.label ) ).toEqual( [
			'Primary Color',
			'Secondary Color',
			'Background Color',
		] );
	} );

	it( 'should return empty array for non-existent search term', () => {
		// Arrange.
		const searchValue = 'nonexistent';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result ).toEqual( [] );
		expect( result ).toHaveLength( 0 );
	} );

	it( 'should maintain original order of filtered results', () => {
		// Arrange.
		const searchValue = 'r';

		// Act.
		const result = filterBySearch( SAMPLE_VARIABLES, searchValue );

		// Assert.
		expect( result.map( ( v ) => v.label ) ).toEqual( [
			'Primary Color',
			'Secondary Color',
			'Background Color',
			'Header Font',
			'Border Radius',
			'primary-accent',
		] );
	} );

	it( 'should handle large datasets efficiently', () => {
		// Arrange.
		const LARGE_DATASET_SIZE = 10000;
		const largeDataset: TestVariable[] = Array.from( { length: LARGE_DATASET_SIZE }, ( _, index ) => ( {
			label: `Variable ${ index }`,
			value: `value-${ index }`,
			type: 'test',
		} ) );
		const searchValue = 'Variable 99';

		// Act.
		const startTime = performance.now();
		const result = filterBySearch( largeDataset, searchValue );
		const endTime = performance.now();

		// Assert.
		expect( result ).toHaveLength( 111 );
		expect( endTime - startTime ).toBeLessThan( 100 );
	} );
} );
