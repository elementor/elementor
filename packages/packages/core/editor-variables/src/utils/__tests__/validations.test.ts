import { generateDuplicateLabel, VARIABLE_LABEL_MAX_LENGTH } from '../validations';

describe( 'generateDuplicateLabel', () => {
	it.each( [
		{
			description: 'no conflicts exist',
			originalLabel: 'my-var',
			existingLabels: [],
			expected: 'my-var-Copy',
		},
		{
			description: 'original exists but -Copy does not',
			originalLabel: 'primary-color',
			existingLabels: [ 'primary-color' ],
			expected: 'primary-color-Copy',
		},
		{
			description: 'single-char label',
			originalLabel: 'a',
			existingLabels: [ 'a' ],
			expected: 'a-Copy',
		},
	] )( 'should return -Copy suffix when $description', ( { originalLabel, existingLabels, expected } ) => {
		// Act
		const result = generateDuplicateLabel( originalLabel, existingLabels );

		// Assert
		expect( result ).toBe( expected );
	} );

	it.each( [
		{
			description: '-Copy already taken',
			originalLabel: 'primary-color',
			existingLabels: [ 'primary-color', 'primary-color-Copy' ],
			expected: 'primary-color-Copy-2',
		},
		{
			description: '-Copy through -Copy-3 are taken',
			originalLabel: 'primary-color',
			existingLabels: [ 'primary-color', 'primary-color-Copy', 'primary-color-Copy-2', 'primary-color-Copy-3' ],
			expected: 'primary-color-Copy-4',
		},
		{
			description: 'gap in numbering fills first available slot',
			originalLabel: 'color',
			existingLabels: [ 'color', 'color-Copy', 'color-Copy-3' ],
			expected: 'color-Copy-2',
		},
	] )( 'should increment numeric suffix when $description', ( { originalLabel, existingLabels, expected } ) => {
		// Act
		const result = generateDuplicateLabel( originalLabel, existingLabels );

		// Assert
		expect( result ).toBe( expected );
	} );

	it.each( [
		{
			description: 'label is at max length with -Copy suffix',
			originalLabel: 'super-long-variable-name-that-is-very-close-to-max',
			existingLabels: [] as string[],
			expectedSuffix: '-Copy',
		},
		{
			description: 'label is all same chars at max length',
			originalLabel: 'a'.repeat( VARIABLE_LABEL_MAX_LENGTH ),
			existingLabels: [] as string[],
			expectedSuffix: '-Copy',
		},
		{
			description: 'label at max length with numbered suffix',
			originalLabel: 'super-long-variable-name-that-is-very-close-to-max',
			existingLabels: [ generateDuplicateLabel( 'super-long-variable-name-that-is-very-close-to-max', [] ) ],
			expectedSuffix: '-Copy-2',
		},
	] )(
		'should trim base and stay within 50 chars when $description',
		( { originalLabel, existingLabels, expectedSuffix } ) => {
			// Act
			const result = generateDuplicateLabel( originalLabel, existingLabels );

			// Assert
			expect( result.length ).toBeLessThanOrEqual( VARIABLE_LABEL_MAX_LENGTH );
			expect( result ).toMatch( new RegExp( `${ expectedSuffix.replace( '-', '\\-' ) }$` ) );
		}
	);
} );
