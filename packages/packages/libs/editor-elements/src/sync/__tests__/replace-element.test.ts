import { createMockElement } from 'test-utils';
import {
	__privateRunCommand as runCommand,
	__privateRunCommandSync as runCommandSync,
} from '@elementor/editor-v1-adapters';

import { replaceElement } from '../replace-element';
import { type ExtendedWindow, type V1ElementModelProps } from '../types';

jest.mock( '@elementor/editor-v1-adapters' );

const mockRunCommand = jest.mocked( runCommand );
const mockRunCommandSync = jest.mocked( runCommandSync );

const currentElement = createMockElement( { model: { id: 'current-element' } } );
const siblingElement1 = createMockElement( { model: { id: 'sibling-element-1' } } );
const siblingElement2 = createMockElement( { model: { id: 'sibling-element-2' } } );
const parentElement = createMockElement( {
	model: { id: 'parent-element' },
	children: [ siblingElement1, currentElement, siblingElement2 ],
} );



const newElement: Omit< V1ElementModelProps, 'id' > = {
	elType: 'widget',
	widgetType: 'e-heading',
};

describe( 'replaceElement', () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	it( 'should replace element', () => {
		// Arrange.
		extendedWindow.elementor = {
			getContainer: ( id ) => {
				switch ( id ) {
					case currentElement.id:
						return { ...currentElement, parent: parentElement };
					case parentElement.id:
						return { ...parentElement };
				}
			},
		};

		// Act.
		replaceElement( { currentElement, newElement } );

		// Assert.
		expect( mockRunCommandSync ).toHaveBeenCalledWith( 'document/elements/create', {
			container: parentElement,
			model: newElement,
			options: { at: 1, useHistory: true, edit: false },
		} );

		expect( mockRunCommand ).toHaveBeenCalledWith( 'document/elements/delete', {
			container: { ...currentElement, parent: parentElement },
			options: { useHistory: true },
		} );
	} );

	it( 'should wrap widget in container when replacing element at document top level', () => {
		// Arrange.
		const documentElement = createMockElement( { model: { id: 'document' }, children: [ currentElement ] } );
		const createdContainerElement = createMockElement( { model: { id: 'created-container-id' } } );

		const extendedWindow = window as unknown as ExtendedWindow;
		extendedWindow.elementor = {
			getContainer: ( id ) => {
				switch ( id ) {
					case currentElement.id:
						return { ...currentElement, parent: documentElement };
					case 'document':
						return { ...documentElement };
					case 'created-container-id':
						return { ...createdContainerElement };
				}
			},
		};

		mockRunCommandSync.mockReturnValueOnce( createdContainerElement );

		// Act.
		replaceElement( { currentElement, newElement } );

		// Assert.
		// First, create wrapper container
		expect( mockRunCommandSync ).toHaveBeenNthCalledWith( 1, 'document/elements/create', {
			container: documentElement,
			model: { elType: 'container' },
			options: { at: 0, useHistory: false, edit: false },
		} );

		// Then, create the widget inside the container
		expect( mockRunCommandSync ).toHaveBeenNthCalledWith( 2, 'document/elements/create', {
			container: createdContainerElement,
			model: newElement,
			options: { at: 0, useHistory: true, edit: false },
		} );

		// Finally, delete the original element
		expect( mockRunCommand ).toHaveBeenCalledWith( 'document/elements/delete', {
			container: { ...currentElement, parent: documentElement },
			options: { useHistory: true },
		} );
	} );
} );
