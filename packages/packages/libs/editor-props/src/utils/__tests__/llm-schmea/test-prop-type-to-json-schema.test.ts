import type * as Types from '../../../types';
import { propTypeToJsonSchema, setDynamicTagNamesResolver } from '../../props-to-llm-schema';
import { STUBS } from '../../test-utils/stubs';
import { validatePropValue } from '../../validate-prop-value';

type PlainPropType = Types.PropType & { key: string };

const createMeta = ( description: string ) => ( {
	description,
} );

describe( 'PropType to LLM JSON Schema conversion', () => {
	describe( 'Primitive prop types', () => {
		const stubPropTypes: ( PlainPropType & { key: string } )[] = [
			{ kind: 'string', key: 'string', meta: createMeta( 'string-prop' ), settings: {} },
			{ kind: 'number', key: 'number', meta: createMeta( 'number-prop' ), settings: {} },
			{ kind: 'boolean', key: 'boolean', meta: createMeta( 'boolean-prop' ), settings: {} },
		];

		stubPropTypes.forEach( ( propType ) => {
			it( 'should convert ' + propType.kind + ' prop type correctly', () => {
				const jsonSchema = propTypeToJsonSchema( propType );
				expect( jsonSchema.description ).toBe( propType.meta?.description );
				expect( jsonSchema.properties ).toHaveProperty( 'value' );
				expect( jsonSchema.properties ).toHaveProperty( '$$type', { type: 'string', const: propType.kind } );
			} );
		} );
		describe( 'Invalid string nesting', () => {
			it( 'Should REJECT double-nested string PropValue', () => {
				const stubPropValue = {
					$$type: 'string',
					value: {
						$$type: 'string',
						value: 'section',
					},
				};
				const stringPropType = STUBS.tag;
				const { errors, valid } = validatePropValue( stringPropType, stubPropValue );
				expect( valid ).toBe( false );
				expect( errors?.length ).toBeGreaterThan( 0 );
			} );
		} );
		describe( 'String prop type with enum', () => {
			const enumPropType = STUBS.alignContent;
			const validEnumValues = < string[] >( enumPropType.settings.enum || [] );
			const invalidEnumValues = [ 'invalid-enum-value', '', '123', null, undefined ];
			validEnumValues.forEach( ( enumValue ) => {
				it( `Should accept valid ${ enumPropType.key } enum value ${ enumValue }`, () => {
					const propValue = {
						$$type: 'string',
						value: enumValue,
					};
					expect( validatePropValue( enumPropType, propValue ).valid ).toBe( true );
				} );
			} );
			invalidEnumValues.forEach( ( enumValue ) => {
				it( `Should reject invalid ${ enumPropType.key } enum value ${ enumValue }`, () => {
					const propValue = {
						$$type: 'string',
						value: enumValue,
					};
					const { errors, valid } = validatePropValue( enumPropType, propValue );
					expect( valid ).toBe( false );
					expect( errors?.length ).toBeGreaterThan( 0 );
				} );
			} );
		} );

		describe( 'Union prop types', () => {
			const colorPropType = STUBS.color;
			describe( 'should convert union prop type correctly', () => {
				const options: Types.TransformablePropValue< string >[] = [
					{
						$$type: 'color',
						value: '#ffffff',
					},
					{
						$$type: 'global-color-variable',
						value: 'some-global-variable',
					},
				];
				options.forEach( ( option ) => {
					it( 'Should accept PropValue of kind ' + option.$$type, () => {
						const { errors, valid, errorMessages } = validatePropValue( colorPropType, option );
						expect( errorMessages ).toBe( '' );
						expect( valid ).toBe( true );
						expect( errors ).toHaveLength( 0 );
					} );
				} );
			} );
		} );

		describe( 'Dynamic union member', () => {
			const dynamicPropType = STUBS.dynamicText;

			const getDynamicVariant = ( jsonSchema: ReturnType< typeof propTypeToJsonSchema > ) =>
				( jsonSchema.anyOf ?? [] ).find( ( variant ) => variant.properties?.$$type?.const === 'dynamic' );

			afterEach( () => {
				setDynamicTagNamesResolver( null );
			} );

			it( 'requires only the tag name from the LLM (group is resolved by the host)', () => {
				// Arrange & Act
				const jsonSchema = propTypeToJsonSchema( dynamicPropType );
				const dynamicVariant = getDynamicVariant( jsonSchema );

				// Assert
				expect( dynamicVariant ).toBeDefined();
				expect( dynamicVariant?.properties?.value?.required ).toEqual( [ 'name' ] );
				expect( dynamicVariant?.properties?.value?.properties ).not.toHaveProperty( 'group' );
			} );

			it( 'constrains the tag name to the host-provided allowed tags', () => {
				// Arrange
				setDynamicTagNamesResolver( () => [ 'post-title', 'site-title' ] );

				// Act
				const dynamicVariant = getDynamicVariant( propTypeToJsonSchema( dynamicPropType ) );

				// Assert
				expect( dynamicVariant?.properties?.value?.properties?.name?.enum ).toEqual( [
					'post-title',
					'site-title',
				] );
			} );

			it( 'never inlines the dynamic tags catalog (settings stays an open object)', () => {
				// Arrange & Act
				const dynamicVariant = getDynamicVariant( propTypeToJsonSchema( dynamicPropType ) );
				const settingsSchema = dynamicVariant?.properties?.value?.properties?.settings;

				// Assert
				expect( settingsSchema?.type ).toBe( 'object' );
				expect( settingsSchema?.properties ).toBeUndefined();
			} );

			it( 'still drops the overridable union member', () => {
				// Arrange & Act
				const jsonSchema = propTypeToJsonSchema( dynamicPropType );

				// Assert
				const overridableVariant = ( jsonSchema.anyOf ?? [] ).find(
					( variant ) => variant.properties?.$$type?.const === 'overridable'
				);
				expect( overridableVariant ).toBeUndefined();
			} );

			it( 'accepts a dynamic PropValue carrying just a name', () => {
				// Arrange
				const propValue = { $$type: 'dynamic', value: { name: 'post-title' } };

				// Act
				const { valid, errorMessages } = validatePropValue( dynamicPropType, propValue );

				// Assert
				expect( errorMessages ).toBe( '' );
				expect( valid ).toBe( true );
			} );

			it( 'still accepts the non-dynamic member of the union', () => {
				// Arrange
				const propValue = { $$type: 'string', value: 'static text' };

				// Act
				const { valid } = validatePropValue( dynamicPropType, propValue );

				// Assert
				expect( valid ).toBe( true );
			} );

			it( 'rejects a dynamic PropValue missing the tag name', () => {
				// Arrange
				const propValue = { $$type: 'dynamic', value: { settings: {} } };

				// Act
				const { valid } = validatePropValue( dynamicPropType, propValue );

				// Assert
				expect( valid ).toBe( false );
			} );
		} );

		describe( 'Dynamic is a whole-value replacement (outermost only)', () => {
			const titlePropType = STUBS.htmlV3Title;

			const findVariant = ( variants: ReturnType< typeof propTypeToJsonSchema >[ 'anyOf' ], constKey: string ) =>
				( variants ?? [] ).find( ( variant ) => variant.properties?.$$type?.const === constKey );

			it( 'offers dynamic at the property root', () => {
				// Arrange & Act
				const jsonSchema = propTypeToJsonSchema( titlePropType );

				// Assert
				expect( findVariant( jsonSchema.anyOf, 'dynamic' ) ).toBeDefined();
			} );

			it( 'does not duplicate dynamic on a nested field once the root offers it', () => {
				// Arrange & Act
				const jsonSchema = propTypeToJsonSchema( titlePropType );
				const htmlVariant = findVariant( jsonSchema.anyOf, 'html-v3' );
				const contentVariants = htmlVariant?.properties?.value?.properties?.content?.anyOf;

				// Assert
				expect( findVariant( contentVariants, 'string' ) ).toBeDefined();
				expect( findVariant( contentVariants, 'dynamic' ) ).toBeUndefined();
			} );

			it( 'still accepts a whole-property dynamic value', () => {
				// Arrange
				const propValue = {
					$$type: 'dynamic',
					value: { name: 'post-title', group: 'post', settings: {} },
				};

				// Act
				const { valid } = validatePropValue( titlePropType, propValue );

				// Assert
				expect( valid ).toBe( true );
			} );
		} );

		describe( 'Dynamic on a nested field (image src)', () => {
			const imagePropType = STUBS.dynamicImage;

			const findVariant = ( variants: ReturnType< typeof propTypeToJsonSchema >[ 'anyOf' ], constKey: string ) =>
				( variants ?? [] ).find( ( variant ) => variant.properties?.$$type?.const === constKey );

			it( 'offers dynamic on the nested src, not on the image root', () => {
				// Arrange & Act
				const jsonSchema = propTypeToJsonSchema( imagePropType );
				const srcSchema = jsonSchema.properties?.value?.properties?.src;

				// Assert
				expect( jsonSchema.anyOf ).toBeUndefined();
				expect( jsonSchema.properties?.$$type?.const ).toBe( 'image' );
				expect( findVariant( srcSchema?.anyOf, 'dynamic' ) ).toBeDefined();
				expect( findVariant( srcSchema?.anyOf, 'image-src' ) ).toBeDefined();
			} );

			it( 'accepts an image whose src is dynamic', () => {
				// Arrange
				const propValue = {
					$$type: 'image',
					value: {
						src: { $$type: 'dynamic', value: { name: 'featured-image' } },
						size: { $$type: 'string', value: 'full' },
					},
				};

				// Act
				const { valid, errorMessages } = validatePropValue( imagePropType, propValue );

				// Assert
				expect( errorMessages ).toBe( '' );
				expect( valid ).toBe( true );
			} );

			it( 'rejects a dynamic value placed at the image root', () => {
				// Arrange
				const propValue = { $$type: 'dynamic', value: { name: 'featured-image' } };

				// Act
				const { valid } = validatePropValue( imagePropType, propValue );

				// Assert
				expect( valid ).toBe( false );
			} );
		} );
	} );

	describe( 'Complex object prop type', () => {
		const backgroundPropType = STUBS.background as Types.ObjectPropType;
		describe( 'background prop type', () => {
			const backgroundOverlays = [
				// background-color-overlay
				{
					$$type: 'background-color-overlay',
					value: {
						color: {
							$$type: 'color',
							value: '#000000',
						},
					},
				},
				// background-gradient-overlay
				{
					$$type: 'background-gradient-overlay',
					value: {
						type: {
							$$type: 'string',
							value: 'linear',
						},
						angle: {
							$$type: 'number',
							value: 45,
						},
						positions: {
							$$type: 'string',
							value: 'center center',
						},
						stops: {
							$$type: 'gradient-color-stop',
							value: [
								{
									$$type: 'color-stop',
									value: {
										color: {
											$$type: 'color',
											value: '#ff0000',
										},
										offset: {
											$$type: 'number',
											value: 0,
										},
									},
								},
								{
									$$type: 'color-stop',
									value: {
										color: {
											$$type: 'color',
											value: '#0000ff',
										},
										offset: {
											$$type: 'number',
											value: 100,
										},
									},
								},
							],
						},
					},
				},
				// background-image-overlay
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
									},
									url: {
										$$type: 'url',
										value: 'https://example.com/image.jpg',
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
			];
			backgroundOverlays.forEach( ( bgOverlayPropValue ) => {
				it( `Should accept ${ bgOverlayPropValue.$$type } as background-overlay`, () => {
					const propValue = {
						$$type: 'background',
						value: {
							'background-overlay': { $$type: 'background-overlay', value: [ bgOverlayPropValue ] },
						},
					} as const;
					const { errors, valid, errorMessages } = validatePropValue( backgroundPropType, propValue );
					expect( errorMessages ).toBe( '' );
					expect( errors ).toHaveLength( 0 );
					expect( valid ).toBe( true );
				} );
			} );
			it( 'Should accept clipped background prop value', () => {
				const propValue = {
					$$type: 'background',
					value: {
						clip: {
							$$type: 'string',
							value: 'text',
						},
					},
				};
				const { errors, valid, errorMessages } = validatePropValue( backgroundPropType, propValue );
				expect( errorMessages ).toBe( '' );
				expect( valid ).toBe( true );
				expect( errors ).toHaveLength( 0 );
			} );
		} );
	} );
} );
