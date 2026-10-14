import * as React from 'react';
import { createMockStyleDefinition, renderWithStore } from 'test-utils';
import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { RenderTemplateStyles } from '../render-template-styles';
import { slice } from '../store';
import { clearTemplatesStyles, templatesStylesProvider } from '../templates-styles-provider';

function createMockDocument( id: number, elements: V1ElementData[] = [] ): Document {
	return { id, elements } as unknown as Document;
}

function createMockElementData( overrides: Partial< V1ElementData > = {} ): V1ElementData {
	return {
		id: '1',
		elType: 'widget',
		widgetType: 'heading',
		settings: {},
		styles: {},
		elements: [],
		...overrides,
	} as V1ElementData;
}

describe( 'RenderTemplateStyles', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();

		clearTemplatesStyles();
	} );

	it( 'should extract styles from templates and add them to the provider', () => {
		// Arrange.
		const style1 = createMockStyleDefinition( { id: 'style-1' } );
		const style2 = createMockStyleDefinition( { id: 'style-2' } );

		__dispatch(
			slice.actions.setTemplates( [
				createMockDocument( 200, [ createMockElementData( { styles: { 'style-1': style1 } } ) ] ),
				createMockDocument( 300, [ createMockElementData( { styles: { 'style-2': style2 } } ) ] ),
			] )
		);

		// Act.
		renderWithStore( <RenderTemplateStyles />, store );

		// Assert.
		const styles = templatesStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( style1 );
		expect( styles ).toContainEqual( style2 );
	} );

	it( 'should extract styles from nested elements', () => {
		// Arrange.
		const parentStyle = createMockStyleDefinition( { id: 'parent-style' } );
		const childStyle = createMockStyleDefinition( { id: 'child-style' } );

		__dispatch(
			slice.actions.setTemplates( [
				createMockDocument( 200, [
					createMockElementData( {
						styles: { 'parent-style': parentStyle },
						elements: [
							createMockElementData( {
								id: '2',
								styles: { 'child-style': childStyle },
							} ),
						],
					} ),
				] ),
			] )
		);

		// Act.
		renderWithStore( <RenderTemplateStyles />, store );

		// Assert.
		const styles = templatesStylesProvider.actions.all();
		expect( styles ).toHaveLength( 2 );
		expect( styles ).toContainEqual( parentStyle );
		expect( styles ).toContainEqual( childStyle );
	} );

	it( 'should handle templates with no elements', () => {
		// Arrange.
		__dispatch( slice.actions.setTemplates( [ createMockDocument( 200 ) ] ) );

		// Act.
		renderWithStore( <RenderTemplateStyles />, store );

		// Assert.
		expect( templatesStylesProvider.actions.all() ).toEqual( [] );
	} );

	it( 'should render nothing', () => {
		// Act.
		const { container } = renderWithStore( <RenderTemplateStyles />, store );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
