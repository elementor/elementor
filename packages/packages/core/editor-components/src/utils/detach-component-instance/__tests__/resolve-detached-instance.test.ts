import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

import { type ComponentInstanceOverride } from '../../../prop-types/component-instance-overrides-prop-type';
import { resolveDetachedInstance } from '../resolve-detached-instance';

describe( 'resolveDetachedInstance', () => {
	describe( 'ID regeneration', () => {
		it( 'should regenerate element IDs', () => {
			// Arrange
			const originalId = 'button1';
			const element: V1ElementData = {
				id: originalId,
				elType: 'widget',
				widgetType: 'button',
				settings: {
					text: { $$type: 'string', value: 'Click me' },
				},
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = resolveDetachedInstance( element, overrides );

			// Assert
			expect( result.id ).not.toBe( originalId );
			expect( result.id ).toBeDefined();
			expect( typeof result.id ).toBe( 'string' );
		} );

		it( 'should regenerate style IDs and update these IDs in classes prop', () => {
			// Arrange
			const localStyleId = 'local-123';

			const localStyleValue: StyleDefinition = {
				id: localStyleId,
				label: 'local',
				type: 'class',
				variants: [],
			};

			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
				settings: {
					classes: {
						$$type: 'classes',
						value: [ 'g-123', 'g-456', localStyleId, 'g-789' ],
					},
				},
				styles: {
					[ localStyleId ]: localStyleValue,
				},
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = resolveDetachedInstance( element, overrides );

			// Assert
			const stylesEntries = Object.entries( result.styles as Record< StyleDefinitionID, StyleDefinition > );
			expect( stylesEntries ).toHaveLength( 1 );
			const [ newStyleId, newStyleValue ] = stylesEntries[ 0 ];
			expect( newStyleId ).not.toBe( localStyleId );
			expect( newStyleValue ).toEqual( { ...localStyleValue, id: newStyleId } );

			const classes = result.settings?.classes as { $$type: string; value: string[] };
			expect( classes.value ).toHaveLength( 4 );
			expect( classes.value ).toEqual( [ 'g-123', 'g-456', newStyleId, 'g-789' ] );
		} );
	} );

	describe( 'integration - full flow', () => {
		it( 'should handle element with styles, overrides, and nested children', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
				settings: {
					title: {
						$$type: 'overridable',
						value: {
							override_key: 'key1',
							origin_value: { $$type: 'string', value: 'Original title' },
						},
					},
					classes: {
						$$type: 'classes',
						value: [ 'style-100' ],
					},
				},
				styles: {
					'style-100': {
						id: 'style-100',
						label: 'Primary',
						type: 'class',
						variants: [],
					},
				},
				elements: [
					{
						id: 'button1',
						elType: 'widget',
						widgetType: 'button',
						settings: {
							text: {
								$$type: 'overridable',
								value: {
									override_key: 'key2',
									origin_value: { $$type: 'string', value: 'Original button' },
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
						override_value: { $$type: 'string', value: 'Overridden title' },
						schema_source: { type: 'component', id: 100 },
					},
				},
				{
					$$type: 'override',
					value: {
						override_key: 'key2',
						override_value: { $$type: 'string', value: 'Overridden button' },
						schema_source: { type: 'component', id: 100 },
					},
				},
			];

			// Act
			const result = resolveDetachedInstance( element, overrides );

			// Assert
			expect( result.id ).not.toBe( 'container1' );
			expect( result.settings?.title ).toEqual( { $$type: 'string', value: 'Overridden title' } );

			const classes = result.settings?.classes as { $$type: string; value: string[] };
			expect( classes.value[ 0 ] ).not.toBe( 'style-100' );
			expect( classes.value[ 0 ] ).toMatch( /^e-/ );

			expect( result.elements?.[ 0 ]?.id ).not.toBe( 'button1' );
			expect( result.elements?.[ 0 ]?.settings?.text ).toEqual( {
				$$type: 'string',
				value: 'Overridden button',
			} );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle element with no settings', () => {
			// Arrange
			const element: V1ElementData = {
				id: 'container1',
				elType: 'container',
			};
			const overrides: ComponentInstanceOverride[] = [];

			// Act
			const result = resolveDetachedInstance( element, overrides );

			// Assert
			expect( result.id ).not.toBe( 'container1' );
			expect( result.elType ).toBe( 'container' );
			expect( result.settings ).toBeUndefined();
		} );

		it( 'should clone the element (not mutate original)', () => {
			// Arrange
			const originalId = 'button1';
			const element: V1ElementData = {
				id: originalId,
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
			const result = resolveDetachedInstance( element, overrides );

			// Assert
			expect( element.id ).toBe( originalId );
			expect( element.settings?.text ).toEqual( {
				$$type: 'overridable',
				value: {
					override_key: 'key1',
					origin_value: { $$type: 'string', value: 'Original text' },
				},
			} );

			expect( result.id ).not.toBe( originalId );
			expect( result.settings?.text ).toEqual( { $$type: 'string', value: 'Overridden text' } );
		} );
	} );
} );
