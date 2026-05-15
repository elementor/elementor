import { COPY_SUFFIX, generateDuplicateLabel } from '../duplicate-label';
import { VARIABLE_LABEL_MAX_LENGTH } from '../validations';

describe( 'generateDuplicateLabel', () => {
	it.each( [
		{
			description: 'no conflicts exist',
			originalLabel: 'my-var',
			existingLabels: [],
			expected: `my-var${ COPY_SUFFIX }`,
		},
		{
			description: 'original exists but -Copy does not',
			originalLabel: 'primary-color',
			existingLabels: [ 'primary-color' ],
			expected: `primary-color${ COPY_SUFFIX }`,
		},
		{
			description: 'single-char label',
			originalLabel: 'a',
			existingLabels: [ 'a' ],
			expected: `a${ COPY_SUFFIX }`,
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
			existingLabels: [ 'primary-color', `primary-color${ COPY_SUFFIX }` ],
			expected: `primary-color${ COPY_SUFFIX }-2`,
		},
		{
			description: '-Copy through -Copy-3 are taken',
			originalLabel: 'primary-color',
			existingLabels: [
				'primary-color',
				`primary-color${ COPY_SUFFIX }`,
				`primary-color${ COPY_SUFFIX }-2`,
				`primary-color${ COPY_SUFFIX }-3`,
			],
			expected: `primary-color${ COPY_SUFFIX }-4`,
		},
		{
			description: 'gap in numbering fills first available slot',
			originalLabel: 'color',
			existingLabels: [ 'color', `color${ COPY_SUFFIX }`, `color${ COPY_SUFFIX }-3` ],
			expected: `color${ COPY_SUFFIX }-2`,
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
			expectedSuffix: COPY_SUFFIX,
		},
		{
			description: 'label is all same chars at max length',
			originalLabel: 'a'.repeat( VARIABLE_LABEL_MAX_LENGTH ),
			existingLabels: [] as string[],
			expectedSuffix: COPY_SUFFIX,
		},
		{
			description: 'label at max length with numbered suffix',
			originalLabel: 'super-long-variable-name-that-is-very-close-to-max',
			existingLabels: [ generateDuplicateLabel( 'super-long-variable-name-that-is-very-close-to-max', [] ) ],
			expectedSuffix: `${ COPY_SUFFIX }-2`,
		},
	] )(
		'should trim base and stay within 50 chars when $description',
		( { originalLabel, existingLabels, expectedSuffix } ) => {
			// Act
			const result = generateDuplicateLabel( originalLabel, existingLabels );

			// Assert
			expect( result.length ).toBeLessThanOrEqual( VARIABLE_LABEL_MAX_LENGTH );
			expect( result.endsWith( expectedSuffix ) ).toBe( true );
		}
	);
} );
