import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceOverrideProp } from '../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp } from '../../prop-types/component-instance-prop-type';
import { applyOverridesToElement } from '../apply-overrides-to-elements';

const COMPONENT_WIDGET_TYPE = 'e-component';

describe( 'applyOverridesToElement', () => {
	describe( 'regular element (not component instance)', () => {
		it( 'should replace overridable with override_value when matching override exists', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Overridden text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Overridden text' } );
		} );

		it( 'should replace overridable with origin_value when no matching override exists', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Original text' } );
		} );

		it( 'should handle multiple overridables - some with overrides and some without', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
					title: {
						$$type: 'overridable',
						value: {
							override_key: 'key2',
							origin_value: { $$type: 'string', value: 'Original title' },
						},
					},
					link: {
						$$type: 'overridable',
						value: {
							override_key: 'key3',
							origin_value: {
								$$type: 'link',
								value: {
									destination: { $$type: 'url', value: 'https://example.com' },
									isTargetBlank: { $$type: 'boolean', value: false },
								},
							},
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Overridden text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
				{
					$$type: 'override',
					value: {
						override_key: 'key3',
						override_value: {
							$$type: 'link',
							value: {
								destination: { $$type: 'url', value: 'https://new-link.com' },
								isTargetBlank: { $$type: 'boolean', value: true },
							},
						},
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Overridden text' } );
			expect( result.settings?.title ).toEqual( { $$type: 'string', value: 'Original title' } );
			expect( result.settings?.link ).toEqual( {
				$$type: 'link',
				value: {
					destination: { $$type: 'url', value: 'https://new-link.com' },
					isTargetBlank: { $$type: 'boolean', value: true },
				},
			} );
		} );

		it( 'should not modify regular settings (non-overridables)', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
					description: { $$type: 'string', value: 'Description' },
				},
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Overridden text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.description ).toEqual( { $$type: 'string', value: 'Description' } );
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Overridden text' } );
		} );
	} );

	describe( 'component instance element', () => {
		const innerComponentId = 100;
		const outerComponentId = 200;

		const innerOverrideKey = 'inner-key';
		const outerOverrideKey = 'outer-key';

		const innerOverrideValue = { $$type: 'string', value: 'Inner override text' };
		const innerOverride: ComponentInstanceOverrideProp = {
			$$type: 'override',
			value: {
				override_key: innerOverrideKey,
				override_value: innerOverrideValue,
				schema_source: { type: 'component', id: innerComponentId },
			},
		};

		const componentInstanceElement: V1ElementData = {
			id: 'product-card-1',
			elType: 'widget',
			widgetType: COMPONENT_WIDGET_TYPE,
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: { $$type: 'number', value: innerComponentId },
						overrides: {
							$$type: 'overrides',
							value: [
								{
									$$type: 'overridable',
									value: {
										override_key: outerOverrideKey,
										origin_value: innerOverride,
									},
								},
							],
						},
					},
				},
			},
		};

		it( 'should replace overridable in overrides with new override containing override_value from parent', () => {
			// Arrange
			const outerOverrideValue = { $$type: 'string', value: 'Outer override text' };
			const outerOverrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: outerOverrideKey,
						override_value: outerOverrideValue,
						schema_source: { type: 'component', id: outerComponentId },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( componentInstanceElement, outerOverrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 1 );

			const override = resultOverrides?.[ 0 ] as ComponentInstanceOverrideProp;
			expect( override?.value.override_value ).toEqual( outerOverrideValue );
			expect( override?.value.override_key ).toEqual( innerOverrideKey );
			expect( override?.value.schema_source ).toEqual( innerOverride.value.schema_source );
		} );

		it( 'should replace overridable in overrides with origin_value when no matching override exists', () => {
			// Arrange
			const outerOverrides: ComponentInstanceOverride[] = [];

			// Act
			const result = applyOverridesToElement( componentInstanceElement, outerOverrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 1 );

			const override = resultOverrides?.[ 0 ] as ComponentInstanceOverrideProp;
			expect( override ).toEqual( innerOverride );
		} );

		it( 'should handle multiple overridables in overrides', () => {
			// Arrange
			const innerOverrideKey1 = 'inner-key-1';
			const innerOverrideKey2 = 'inner-key-2';
			const outerOverrideKey1 = 'outer-key-1';
			const outerOverrideKey2 = 'outer-key-2';

			const innerOverrideValue1 = { $$type: 'string', value: 'Add to cart' };
			const innerOverrideValue2 = { $$type: 'string', value: 'Add to wishlist' };

			const innerOverride1: ComponentInstanceOverrideProp = {
				$$type: 'override',
				value: {
					override_key: innerOverrideKey1,
					override_value: innerOverrideValue1,
					schema_source: { type: 'component', id: innerComponentId },
				},
			};
			const innerOverride2: ComponentInstanceOverrideProp = {
				$$type: 'override',
				value: {
					override_key: innerOverrideKey2,
					override_value: innerOverrideValue2,
					schema_source: { type: 'component', id: innerComponentId },
				},
			};

			const elementWithMultipleOverridables: V1ElementData = {
				id: 'product-card-1',
				elType: 'widget',
				widgetType: COMPONENT_WIDGET_TYPE,
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: innerComponentId },
							overrides: {
								$$type: 'overrides',
								value: [
									{
										$$type: 'overridable',
										value: {
											override_key: outerOverrideKey1,
											origin_value: innerOverride1,
										},
									},
									{
										$$type: 'overridable',
										value: {
											override_key: outerOverrideKey2,
											origin_value: innerOverride2,
										},
									},
								],
							},
						},
					},
				},
			};

			const outerOverrideValue1 = { $$type: 'string', value: 'Add to cart 👕👕' };
			const outerOverrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: outerOverrideKey1,
						override_value: outerOverrideValue1,
						schema_source: { type: 'component', id: outerComponentId },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( elementWithMultipleOverridables, outerOverrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 2 );

			const firstOverride = resultOverrides?.[ 0 ] as ComponentInstanceOverrideProp;
			expect( firstOverride?.value.override_key ).toEqual( innerOverrideKey1 );
			expect( firstOverride?.value.override_value ).toEqual( outerOverrideValue1 );
			expect( firstOverride?.value.schema_source ).toEqual( innerOverride1.value.schema_source );

			const secondOverride = resultOverrides?.[ 1 ] as ComponentInstanceOverrideProp;
			expect( secondOverride ).toEqual( innerOverride2 );
		} );

		it( 'should not modify regular overrides (non-overridables) in component instance', () => {
			// Arrange
			const regularOverride: ComponentInstanceOverrideProp = {
				$$type: 'override',
				value: {
					override_key: 'regular-key',
					override_value: { $$type: 'string', value: 'Regular value' },
					schema_source: { type: 'component', id: innerComponentId },
				},
			};

			const elementWithMixedOverrides: V1ElementData = {
				id: 'product-card-1',
				elType: 'widget',
				widgetType: COMPONENT_WIDGET_TYPE,
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: innerComponentId },
							overrides: {
								$$type: 'overrides',
								value: [
									regularOverride,
									{
										$$type: 'overridable',
										value: {
											override_key: outerOverrideKey,
											origin_value: innerOverride,
										},
									},
								],
							},
						},
					},
				},
			};

			const outerOverrideValue = { $$type: 'string', value: 'Outer override text' };
			const outerOverrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: outerOverrideKey,
						override_value: outerOverrideValue,
						schema_source: { type: 'component', id: outerComponentId },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( elementWithMixedOverrides, outerOverrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 2 );
			expect( resultOverrides?.[ 0 ] ).toEqual( regularOverride );
		} );

		it( 'should return element unchanged when component instance has no overrides', () => {
			// Arrange
			const elementWithEmptyOverrides: V1ElementData = {
				id: 'product-card-1',
				elType: 'widget',
				widgetType: COMPONENT_WIDGET_TYPE,
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: innerComponentId },
							overrides: {
								$$type: 'overrides',
								value: [],
							},
						},
					},
				},
			};

			const outerOverrideValue = { $$type: 'string', value: 'Outer override text' };
			const outerOverrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: outerOverrideKey,
						override_value: outerOverrideValue,
						schema_source: { type: 'component', id: outerComponentId },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( elementWithEmptyOverrides, outerOverrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 0 );
		} );
	} );

	describe( 'recursion (nested elements)', () => {
		it( 'should apply overrides to child elements', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
				settings: {},
				elements: [
					{
						id: 'button1',
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: {
								$$type: 'overridable',
								value: {
									override_key: 'key1',
									origin_value: { $$type: 'string', value: 'Child text' },
								},
							},
						},
					},
				],
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Overridden child text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.elements?.[ 0 ]?.settings?.text ).toEqual( {
				$$type: 'string',
				value: 'Overridden child text',
			} );
		} );

		it( 'should apply overrides to deeply nested elements', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
				settings: {},
				elements: [
					{
						id: 'container2',
						elType: 'container',
						settings: {},
						elements: [
							{
								id: 'button1',
								elType: 'widget',
								widgetType: 'button',
								settings: {
									text: {
										$$type: 'overridable',
										value: {
											override_key: 'key1',
											origin_value: { $$type: 'string', value: 'Deep text' },
										},
									},
								},
							},
						],
					},
				],
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Overridden deep text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.elements?.[ 0 ]?.elements?.[ 0 ]?.settings?.text ).toEqual( {
				$$type: 'string',
				value: 'Overridden deep text',
			} );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return element unchanged when it has no settings', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Some value' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result ).toEqual( element );
		} );

		it( 'should replace all overridables with origin_value when overrides array is empty', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
					title: {
						$$type: 'overridable',
						value: {
							override_key: 'key2',
							origin_value: { $$type: 'string', value: 'Original title' },
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Original text' } );
			expect( result.settings?.title ).toEqual( { $$type: 'string', value: 'Original title' } );
		} );

		it( 'should handle overridable with null origin_value', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: null,
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toBeNull();
		} );
	} );

	describe( 'detach inside component edit mode (outer overrides are overridables)', () => {
		const innerComponentId = 100;

		it( 'should replace inner overridable with outer overridable value & key when matching outer overridable exists', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'inner-key',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
				},
			};

			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'overridable',
					value: {
						override_key: 'outer-key',
						origin_value: {
							$$type: 'override',
							value: {
								override_key: 'inner-key',
								override_value: { $$type: 'string', value: 'Exposed override text' },
								schema_source: { type: 'component', id: 100 },
							},
						},
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( {
				$$type: 'overridable',
				value: {
					override_key: 'outer-key',
					origin_value: { $$type: 'string', value: 'Exposed override text' },
				},
			} );
		} );

		it( 'should handle component instance element: replace inner overridable with outer overridable value & key when matching outer overridable exists', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'product-b-instance-1',
				elType: 'widget',
				widgetType: COMPONENT_WIDGET_TYPE,
				settings: {
					component_instance: {
						$$type: 'component-instance',
						value: {
							component_id: { $$type: 'number', value: innerComponentId },
							overrides: {
								$$type: 'overrides',
								value: [
									{
										$$type: 'overridable',
										value: {
											override_key: 'key-1',
											origin_value: {
												$$type: 'override',
												value: {
													override_key: 'key-0',
													override_value: { $$type: 'string', value: 'Add to cart' },
													schema_source: { type: 'component', id: innerComponentId },
												},
											},
										},
									},
								],
							},
						},
					},
				},
			};

			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'overridable',
					value: {
						override_key: 'key-2',
						origin_value: {
							$$type: 'override',
							value: {
								override_key: 'key-1',
								override_value: { $$type: 'string', value: 'Add to cart 👕👕' },
								schema_source: { type: 'component', id: innerComponentId },
							},
						},
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			const resultOverrides = ( result.settings?.component_instance as ComponentInstanceProp )?.value?.overrides
				?.value;
			expect( resultOverrides ).toHaveLength( 1 );

			const override = resultOverrides?.[ 0 ] as ComponentInstanceOverrideProp;
			expect( override ).toEqual( {
				$$type: 'overridable',
				value: {
					override_key: 'key-2',
					origin_value: {
						$$type: 'override',
						value: {
							override_key: 'key-0',
							override_value: { $$type: 'string', value: 'Add to cart 👕👕' },
							schema_source: { type: 'component', id: innerComponentId },
						},
					},
				},
			} );
		} );

		it( 'should handle mixed overrides - some regular and some overridables', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'button1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original text' },
						},
					},
					title: {
						$$type: 'overridable',
						value: {
							override_key: 'key2',
							origin_value: { $$type: 'string', value: 'Original title' },
						},
					},
				},
			};
			const overrides: ComponentInstanceOverride[] = [
				{
					$$type: 'override',
					value: {
						override_key: 'key1',
						override_value: { $$type: 'string', value: 'Regular override text' },
						schema_source: { type: 'component', id: 100 },
					},
				},
				{
					$$type: 'overridable',
					value: {
						override_key: 'outer-key',
						origin_value: {
							$$type: 'override',
							value: {
								override_key: 'key2',
								override_value: { $$type: 'string', value: 'Exposed override title' },
								schema_source: { type: 'component', id: 100 },
							},
						},
					},
				},
			];

			// Act
			const result = applyOverridesToElement( element, overrides );

			// Assert
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Regular override text' } );
			expect( result.settings?.title ).toEqual( {
				$$type: 'overridable',
				value: {
					override_key: 'outer-key',
					origin_value: { $$type: 'string', value: 'Exposed override title' },
				},
			} );
		} );
	} );
} );
