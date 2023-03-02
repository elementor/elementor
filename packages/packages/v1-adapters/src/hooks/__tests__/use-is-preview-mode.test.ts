import { act, renderHook } from '@testing-library/react-hooks';
import { useIsPreviewMode } from '../../';
import { dispatchEditModeChange } from '../../__tests__/utils';
import { mockGetCurrentEditMode } from './test-utils';

describe( '@elementor/v1-adapters - useIsPreviewMode', () => {
	it.each( [
		{ mode: 'preview', expected: true },
		{ mode: 'edit', expected: false },
		{ mode: 'picker', expected: false },
	] as const )( 'should return $expected when the current edit mode is $mode', ( { mode, expected } ) => {
		// Arrange.
		mockGetCurrentEditMode( () => mode );

		// Act.
		const { result } = renderHook( () => useIsPreviewMode() );

		// Assert.
		expect( result.current ).toBe( expected );
	} );

	it( 'should update the state when the edit mode changes', () => {
		// Arrange.
		const { result } = renderHook( () => useIsPreviewMode() );

		// Assert.
		expect( result.current ).toBe( false );

		// Act.
		act( () => {
			mockGetCurrentEditMode( () => 'preview' );
			dispatchEditModeChange();
		} );

		// Assert.
		expect( result.current ).toBe( true );

		// Act.
		act( () => {
			mockGetCurrentEditMode( () => 'edit' );
			dispatchEditModeChange();
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );
} );
