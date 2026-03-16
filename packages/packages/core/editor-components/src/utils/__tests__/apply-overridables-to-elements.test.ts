import { type V1ElementData } from '@elementor/editor-elements';

import { type OverridableProps } from '../../types';
import { applyOverridablesToElements } from '../apply-overridables-to-elements';

describe( 'applyOverridablesToElements', () => {
	it( 'should wrap matching element settings with $$type overridable', () => {
		// Arrange
		const elements: V1ElementData[] = [
			{
				id: 'root-1',
				elType: 'container',
				settings: {},
				elements: [
					{
						id: 'heading-1',
						elType: 'widget',
						widgetType: 'e-heading',
						settings: { title: 'Hello World' },
						elements: [],
					},
				],
			},
		];

		const overridableProps: OverridableProps = {
			props: {
				'prop-abc': {
					overrideKey: 'prop-abc',
					label: 'Heading Text',
					elementId: 'heading-1',
					propKey: 'title',
					elType: 'widget',
					widgetType: 'e-heading',
					originValue: 'Hello World',
					groupId: 'group-1',
				},
			},
			groups: {
				items: { 'group-1': { id: 'group-1', label: 'Default', props: [ 'prop-abc' ] } },
				order: [ 'group-1' ],
			},
		};

		// Act
		applyOverridablesToElements( elements, overridableProps );

		// Assert
		const heading = elements[ 0 ]?.elements?.[ 0 ];
		expect( heading?.settings?.title ).toEqual( {
			$$type: 'overridable',
			value: {
				override_key: 'prop-abc',
				origin_value: 'Hello World',
			},
		} );
	} );

	it( 'should handle multiple overridable props across different elements', () => {
		// Arrange
		const elements: V1ElementData[] = [
			{
				id: 'root-1',
				elType: 'container',
				settings: {},
				elements: [
					{
						id: 'heading-1',
						elType: 'widget',
						widgetType: 'e-heading',
						settings: { title: 'Title' },
						elements: [],
					},
					{
						id: 'button-1',
						elType: 'widget',
						widgetType: 'e-button',
						settings: { text: 'Click me' },
						elements: [],
					},
				],
			},
		];

		const overridableProps: OverridableProps = {
			props: {
				'prop-1': {
					overrideKey: 'prop-1',
					label: 'Heading',
					elementId: 'heading-1',
					propKey: 'title',
					elType: 'widget',
					widgetType: 'e-heading',
					originValue: 'Title',
					groupId: 'group-1',
				},
				'prop-2': {
					overrideKey: 'prop-2',
					label: 'Button',
					elementId: 'button-1',
					propKey: 'text',
					elType: 'widget',
					widgetType: 'e-button',
					originValue: 'Click me',
					groupId: 'group-1',
				},
			},
			groups: {
				items: { 'group-1': { id: 'group-1', label: 'Default', props: [ 'prop-1', 'prop-2' ] } },
				order: [ 'group-1' ],
			},
		};

		// Act
		applyOverridablesToElements( elements, overridableProps );

		// Assert
		expect( elements[ 0 ]?.elements?.[ 0 ]?.settings?.title ).toEqual( {
			$$type: 'overridable',
			value: { override_key: 'prop-1', origin_value: 'Title' },
		} );
		expect( elements[ 0 ]?.elements?.[ 1 ]?.settings?.text ).toEqual( {
			$$type: 'overridable',
			value: { override_key: 'prop-2', origin_value: 'Click me' },
		} );
	} );

	it( 'should skip props whose element is not found in the tree', () => {
		// Arrange
		const elements: V1ElementData[] = [
			{
				id: 'root-1',
				elType: 'container',
				settings: {},
				elements: [],
			},
		];

		const overridableProps: OverridableProps = {
			props: {
				'prop-1': {
					overrideKey: 'prop-1',
					label: 'Missing Element',
					elementId: 'nonexistent',
					propKey: 'title',
					elType: 'widget',
					widgetType: 'e-heading',
					originValue: 'test',
					groupId: 'group-1',
				},
			},
			groups: {
				items: { 'group-1': { id: 'group-1', label: 'Default', props: [ 'prop-1' ] } },
				order: [ 'group-1' ],
			},
		};

		// Act & Assert - should not throw
		applyOverridablesToElements( elements, overridableProps );
	} );

	it( 'should not modify elements when overridableProps has no props', () => {
		// Arrange
		const elements: V1ElementData[] = [
			{
				id: 'heading-1',
				elType: 'widget',
				widgetType: 'e-heading',
				settings: { title: 'Original' },
				elements: [],
			},
		];

		const overridableProps: OverridableProps = {
			props: {},
			groups: { items: {}, order: [] },
		};

		// Act
		applyOverridablesToElements( elements, overridableProps );

		// Assert
		expect( elements[ 0 ]?.settings?.title ).toBe( 'Original' );
	} );

	it( 'should handle deeply nested elements', () => {
		// Arrange
		const elements: V1ElementData[] = [
			{
				id: 'root',
				elType: 'container',
				settings: {},
				elements: [
					{
						id: 'level-1',
						elType: 'container',
						settings: {},
						elements: [
							{
								id: 'deep-heading',
								elType: 'widget',
								widgetType: 'e-heading',
								settings: { title: 'Deep' },
								elements: [],
							},
						],
					},
				],
			},
		];

		const overridableProps: OverridableProps = {
			props: {
				'prop-deep': {
					overrideKey: 'prop-deep',
					label: 'Deep Heading',
					elementId: 'deep-heading',
					propKey: 'title',
					elType: 'widget',
					widgetType: 'e-heading',
					originValue: 'Deep',
					groupId: 'group-1',
				},
			},
			groups: {
				items: { 'group-1': { id: 'group-1', label: 'Default', props: [ 'prop-deep' ] } },
				order: [ 'group-1' ],
			},
		};

		// Act
		applyOverridablesToElements( elements, overridableProps );

		// Assert
		const deepHeading = elements[ 0 ]?.elements?.[ 0 ]?.elements?.[ 0 ];
		expect( deepHeading?.settings?.title ).toEqual( {
			$$type: 'overridable',
			value: { override_key: 'prop-deep', origin_value: 'Deep' },
		} );
	} );
} );
