import { createMockElement } from 'test-utils';
import { getElements } from '@elementor/editor-elements';

import { type ExtendedWindow } from '../types';

describe( 'getElements', () => {
	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		const element = createMockElement( { model: { id: 'element' } } );
		const container = createMockElement( { model: { id: 'container', elements: [ element.model ] } } );
		const container2 = createMockElement( { model: { id: 'container-2' } } );
		const document = createMockElement( {
			model: { id: 'document', elements: [ container.model, container2.model ] },
		} );

		const elementsMap = new Map( [
			[ 'container', container ],
			[ 'container-2', container2 ],
			[ 'element', element ],
		] );

		extendedWindow.elementor = {
			documents: {
				getCurrent: () => ( { container: document } ),
			},
			getContainer: ( id ) => elementsMap.get( id ),
		};
	} );

	it( 'should return all elements in the current document recursively', () => {
		// Act.
		const elements = getElements();

		// Assert.
		expect( elements ).toEqual( [
			expect.objectContaining( { id: 'document' } ),
			expect.objectContaining( { id: 'container' } ),
			expect.objectContaining( { id: 'element' } ),
			expect.objectContaining( { id: 'container-2' } ),
		] );
	} );

	it( 'should get all elements in the selected container recursively', () => {
		// Act.
		const elements = getElements( 'container' );

		// Assert.
		expect( elements ).toEqual( [
			expect.objectContaining( { id: 'container' } ),
			expect.objectContaining( { id: 'element' } ),
		] );
	} );
} );
