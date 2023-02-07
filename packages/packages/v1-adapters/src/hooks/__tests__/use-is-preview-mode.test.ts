import { act, renderHook } from '@testing-library/react-hooks';
import { getCurrentEditMode, useIsPreviewMode } from '../../';
import { dispatchEditModeChange } from '../../__tests__/utils';

jest.mock( '../../readers', () => {
	return {
		getCurrentEditMode: jest.fn(),
	};
} );

const mockedGetCurrentEditMode = jest.mocked( getCurrentEditMode );

describe( '@elementor/v1-adapters - useIsPreviewMode', () => {
	it.each( [
		{ mode: 'preview', expected: true },
		{ mode: 'edit', expected: false },
		{ mode: 'picker', expected: false },
	] as const )( 'should return $expected when the current edit mode is $mode', ( { mode, expected } ) => {
		// Arrange.
		mockedGetCurrentEditMode.mockReturnValue( mode );

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
			mockedGetCurrentEditMode.mockReturnValue( 'preview' );
			dispatchEditModeChange();
		} );

		// Assert.
		expect( result.current ).toBe( true );

		// Act.
		act( () => {
			mockedGetCurrentEditMode.mockReturnValue( 'edit' );
			dispatchEditModeChange();
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );
} );
