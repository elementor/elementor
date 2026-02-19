import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceOverride } from '../../prop-types/component-instance-override-prop-type';
import { applyOverridesToElements } from '../apply-overrides-to-elements';

describe( 'applyOverridesToElements', () => {
	it( 'should apply simple override to element settings', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'widget',
				widgetType: 'heading',
				settings: {
					title: 'Original Title',
					color: 'blue',
				},
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'element-1_title',
				override_value: 'Overridden Title',
				schema_source: {
					type: 'component',
					id: 123,
				},
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result[ 0 ].settings?.title ).toBe( 'Overridden Title' );
		expect( result[ 0 ].settings?.color ).toBe( 'blue' );
	} );

	it( 'should apply multiple overrides to same element', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: 'Click me',
					size: 'medium',
					color: 'primary',
				},
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'element-1_text',
				override_value: 'Submit',
				schema_source: { type: 'component', id: 123 },
			},
			{
				override_key: 'element-1_size',
				override_value: 'large',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result[ 0 ].settings?.text ).toBe( 'Submit' );
		expect( result[ 0 ].settings?.size ).toBe( 'large' );
		expect( result[ 0 ].settings?.color ).toBe( 'primary' );
	} );

	it( 'should apply overrides to nested elements', () => {
		const elements: V1ElementData[] = [
			{
				id: 'container-1',
				elType: 'e-flexbox',
				settings: {},
				elements: [
					{
						id: 'element-1',
						elType: 'widget',
						widgetType: 'heading',
						settings: {
							title: 'Original',
						},
					},
				],
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'element-1_title',
				override_value: 'New Title',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result[ 0 ].elements?.[ 0 ].settings?.title ).toBe( 'New Title' );
	} );

	it( 'should preserve nested component instances without applying overrides', () => {
		const elements: V1ElementData[] = [
			{
				id: 'container-1',
				elType: 'e-flexbox',
				settings: {},
				elements: [
					{
						id: 'nested-component',
						elType: 'widget',
						widgetType: 'e-component',
						settings: {
							component_instance: {
								$$type: 'component-instance',
								value: {
									component_id: { $$type: 'number', value: 456 },
								},
							},
						},
					},
				],
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'nested-component_something',
				override_value: 'should not apply',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result[ 0 ].elements?.[ 0 ].settings?.something ).toBeUndefined();
		expect( result[ 0 ].elements?.[ 0 ].widgetType ).toBe( 'e-component' );
	} );

	it( 'should handle elements without settings gracefully', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'e-flexbox',
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'element-1_something',
				override_value: 'value',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 'element-1' );
	} );

	it( 'should handle overrides for non-existent elements', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'widget',
				widgetType: 'heading',
				settings: {
					title: 'Title',
				},
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'non-existent_prop',
				override_value: 'value',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( result[ 0 ].settings?.title ).toBe( 'Title' );
	} );

	it( 'should return cloned elements when no overrides provided', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'widget',
				widgetType: 'heading',
				settings: {
					title: 'Title',
				},
			},
		];

		const result = applyOverridesToElements( elements, [] );

		expect( result ).toEqual( elements );
		expect( result ).not.toBe( elements );
	} );

	it( 'should deep clone elements to avoid mutations', () => {
		const elements: V1ElementData[] = [
			{
				id: 'element-1',
				elType: 'widget',
				widgetType: 'heading',
				settings: {
					title: 'Original',
				},
			},
		];

		const overrides: ComponentInstanceOverride[] = [
			{
				override_key: 'element-1_title',
				override_value: 'Modified',
				schema_source: { type: 'component', id: 123 },
			},
		];

		const result = applyOverridesToElements( elements, overrides );

		expect( elements[ 0 ].settings?.title ).toBe( 'Original' );
		expect( result[ 0 ].settings?.title ).toBe( 'Modified' );
	} );
} );
