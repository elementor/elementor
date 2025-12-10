import { valid } from 'semver';

import type * as Types from '../../../types';
import { propTypeToJsonSchema } from '../../props-to-llm-schema';
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
