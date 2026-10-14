import { dispatchEditModeChange } from 'test-utils';
import { changeEditMode, type EditMode, useEditMode } from '@elementor/editor-v1-adapters';
import { act, renderHook } from '@testing-library/react';

import type { ExtendedWindow } from '../edit-mode';

describe( 'edit mode', () => {
	it( 'should return the current edit mode, and listen for changes', () => {
		// Arrange.
		mockEditMode( 'edit' );

		// Act.
		const { result } = renderHook( useEditMode );

		// Assert.
		expect( result.current ).toBe( 'edit' );

		// Act.
		act( () => {
			changeEditMode( 'preview' );
		} );

		// Assert.
		expect( result.current ).toBe( 'preview' );
	} );
} );

function mockEditMode( initialMode: EditMode ) {
	let currentMode: EditMode = initialMode;

	( window as unknown as ExtendedWindow ).elementor = {
		changeEditMode: ( newMode ) => {
			currentMode = newMode;

			dispatchEditModeChange();
		},
		channels: {
			dataEditMode: {
				request: () => currentMode,
			},
		},
	};
}
