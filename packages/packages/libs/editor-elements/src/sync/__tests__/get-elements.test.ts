import { createMockElement } from 'test-utils';
import { getElements, getHostDocumentElements } from '@elementor/editor-elements';

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

describe( 'getHostDocumentElements', () => {
	it( 'returns the host document elements, even when another document is active', () => {
		// Arrange.
		const extendedWindow = window as unknown as ExtendedWindow;

		const element = createMockElement( { model: { id: 'element' } } );
		const hostContainer = createMockElement( { model: { id: 'host-document', elements: [ element.model ] } } );
		const activeContainer = createMockElement( { model: { id: 'active-document' } } );

		extendedWindow.elementor = {
			documents: {
				getCurrent: () => ( { container: activeContainer } ),
				getInitialId: () => 49,
				get: ( id ) => ( id === 49 ? { container: hostContainer } : undefined ),
			},
			getContainer: ( id ) => ( id === 'element' ? element : undefined ),
		};

		// Act.
		const elements = getHostDocumentElements();

		// Assert.
		expect( elements ).toEqual( [
			expect.objectContaining( { id: 'host-document' } ),
			expect.objectContaining( { id: 'element' } ),
		] );
	} );

	it( 'returns an empty array when the host document id is unavailable', () => {
		// Arrange.
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			documents: {
				getInitialId: () => undefined as unknown as number,
			},
		};

		// Act.
		const elements = getHostDocumentElements();

		// Assert.
		expect( elements ).toEqual( [] );
	} );
} );
