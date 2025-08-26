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
	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;
		extendedWindow.elementor = {
			getContainer: ( id ) => {
				if ( id === currentElement.id ) {
					return { ...currentElement, parent: parentElement };
				} else if ( id === parentElement.id ) {
					return { ...parentElement };
				}

				return undefined;
			},
		};
	} );

	it( 'should replace element', () => {
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
} );
