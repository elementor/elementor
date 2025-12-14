import { STUBS } from '../test-utils/stubs';
import { validatePropValueDetailed } from '../validate-prop-value';

describe( 'validatePropValueDetailed', () => {
	describe( 'Simple union validation', () => {
		it( 'should provide detailed errors for color union type failures', () => {
			const colorPropType = STUBS.color;
			const invalidValue = {
				$$type: 'invalid-color-type',
				value: '#ffffff',
			};

			const { valid, errors, formattedErrors } = validatePropValueDetailed( colorPropType, invalidValue );

			expect( valid ).toBe( false );
			expect( errors.length ).toBeGreaterThan( 0 );

			// Check that we have variant information
			const anyOfError = errors.find( ( err ) => err.name === 'anyOf' );
			expect( anyOfError ).toBeDefined();
			expect( anyOfError?.variants ).toBeDefined();
			expect( anyOfError?.variants?.length ).toBeGreaterThan( 0 );

			// Formatted errors should contain variant information
			expect( formattedErrors ).toContain( 'Tried' );
			expect( formattedErrors ).toContain( 'variant' );
		} );

		it( 'should validate valid color values without errors', () => {
			const colorPropType = STUBS.color;
			const validValue = {
				$$type: 'color',
				value: '#ffffff',
			};

			const { valid, errors, formattedErrors } = validatePropValueDetailed( colorPropType, validValue );

			expect( valid ).toBe( true );
			expect( errors ).toHaveLength( 0 );
			expect( formattedErrors ).toBe( '' );
		} );
	} );

	describe( 'Complex nested anyOf validation', () => {
		it( 'should provide detailed nested errors for background-image-overlay failures', () => {
			const backgroundPropType = STUBS.background;

			// Invalid background with missing required nested property
			const invalidValue = {
				$$type: 'background',
				value: {
					'background-overlay': {
						$$type: 'background-overlay',
						value: [
							{
								$$type: 'background-image-overlay',
								value: {
									$$type: 'background-image-overlay',
									value: {
										image: {
											$$type: 'image',
											value: {
												src: {
													$$type: 'image-src',
													value: {
														$$type: 'image-src',
														value: {
															// Missing required 'id' and 'url' properties
														},
													},
												},
											},
										},
									},
								},
							},
						],
					},
				},
			};

			const { valid, errors, formattedErrors } = validatePropValueDetailed( backgroundPropType, invalidValue );

			expect( valid ).toBe( false );
			expect( errors.length ).toBeGreaterThan( 0 );

			// The formatted errors should show the deep path to the actual problem
			// Verify that the error message contains information about nested failures
			expect( formattedErrors ).toBeTruthy();
			expect( formattedErrors ).toContain( 'background-image-overlay' );
			expect( formattedErrors ).toContain( 'Tried 3 variant(s)' );
		} );

		it( 'should show which variants were tried for background-overlay', () => {
			const backgroundPropType = STUBS.background;

			// Invalid background overlay with wrong type
			const invalidValue = {
				$$type: 'background',
				value: {
					'background-overlay': {
						$$type: 'background-overlay',
						value: [
							{
								$$type: 'unknown-overlay-type',
								value: {},
							},
						],
					},
				},
			};

			const { valid, formattedErrors } = validatePropValueDetailed( backgroundPropType, invalidValue );

			expect( valid ).toBe( false );

			// Should show all the variants that were tried
			expect( formattedErrors ).toContain( 'background-color-overlay' );
			expect( formattedErrors ).toContain( 'background-image-overlay' );
			expect( formattedErrors ).toContain( 'background-gradient-overlay' );
			expect( formattedErrors ).toContain( 'Tried 3 variant(s)' );
		} );

		it( 'should validate valid background-image-overlay without errors', () => {
			const backgroundPropType = STUBS.background;

			const validValue = {
				$$type: 'background',
				value: {
					'background-overlay': {
						$$type: 'background-overlay',
						value: [
							{
								$$type: 'background-image-overlay',
								value: {
									image: {
										$$type: 'image',
										value: {
											src: {
												$$type: 'image-src',
												value: {
													id: {
														$$type: 'image-attachment-id',
														value: 123,
													},
													url: {
														$$type: 'url',
														value: 'https://example.com/image.jpg',
													},
												},
											},
											size: {
												$$type: 'string',
												value: 'large',
											},
										},
									},
									size: {
										$$type: 'background-image-size-scale',
										value: {
											height: {
												$$type: 'size',
												value: {
													size: { $$type: 'number', value: 100 },
													unit: { $$type: 'string', value: '%' },
												},
											},
											width: {
												$$type: 'size',
												value: {
													size: { $$type: 'number', value: 100 },
													unit: { $$type: 'string', value: '%' },
												},
											},
										},
									},
									repeat: { $$type: 'string', value: 'no-repeat' },
									position: {
										$$type: 'background-image-position-offset',
										value: {
											y: {
												$$type: 'size',
												value: {
													size: { $$type: 'number', value: 50 },
													unit: { $$type: 'string', value: '%' },
												},
											},
											x: {
												$$type: 'size',
												value: {
													size: { $$type: 'number', value: 50 },
													unit: { $$type: 'string', value: '%' },
												},
											},
										},
									},
								},
							},
						],
					},
				},
			};

			const { valid, errors, formattedErrors } = validatePropValueDetailed( backgroundPropType, validValue );

			expect( valid ).toBe( true );
			expect( errors ).toHaveLength( 0 );
			expect( formattedErrors ).toBe( '' );
		} );
	} );

	describe( 'Error format comparison', () => {
		it( 'should provide more details than basic validation', () => {
			const colorPropType = STUBS.color;
			const invalidValue = {
				$$type: 'wrong-type',
				value: 'test',
			};

			const { formattedErrors } = validatePropValueDetailed( colorPropType, invalidValue );

			// The detailed error should show all variants that were tried
			expect( formattedErrors ).toContain( 'Tried' );

			// Should show discriminator values
			expect( formattedErrors.length ).toBeGreaterThan( 50 ); // Detailed output is longer
		} );
	} );

	describe( 'Recursive anyOf handling', () => {
		it( 'should handle deeply nested anyOf schemas', () => {
			const backgroundPropType = STUBS.background;

			// Create a deeply nested invalid structure with wrong discriminator in nested union
			const invalidValue = {
				$$type: 'background',
				value: {
					'background-overlay': {
						$$type: 'background-overlay',
						value: [
							{
								$$type: 'background-gradient-overlay',
								value: {
									$$type: 'background-gradient-overlay',
									value: {
										type: {
											$$type: 'string',
											value: 'linear',
										},
										stops: {
											$$type: 'gradient-color-stop',
											value: [
												{
													// Invalid: wrong $$type for color-stop
													$$type: 'invalid-stop-type',
													value: {
														color: {
															$$type: 'color',
															value: '#ff0000',
														},
													},
												},
											],
										},
									},
								},
							},
						],
					},
				},
			};

			const { valid, formattedErrors } = validatePropValueDetailed( backgroundPropType, invalidValue );

			expect( valid ).toBe( false );

			// Should show the path to the invalid property and variant information
			expect( formattedErrors ).toBeTruthy();
			expect( formattedErrors ).toContain( 'background-gradient-overlay' );
			expect( formattedErrors ).toContain( 'Tried' );
		} );
	} );
} );
