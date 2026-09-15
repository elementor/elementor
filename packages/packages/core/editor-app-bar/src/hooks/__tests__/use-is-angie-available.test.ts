import { act, renderHook, waitFor } from '@testing-library/react';

const mockIsAngiePluginAvailable = jest.fn();
const mockWaitForAngiePluginAvailable = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngiePluginAvailable: () => mockIsAngiePluginAvailable(),
	waitForAngiePluginAvailable: () => mockWaitForAngiePluginAvailable(),
} ) );

import { useIsAngieAvailable } from '../use-is-angie-available';

describe( 'useIsAngieAvailable', () => {
	beforeEach( () => {
		mockIsAngiePluginAvailable.mockReset();
		mockWaitForAngiePluginAvailable.mockReset();
	} );

	it( 'should return true when the Angie plugin is already available on mount', () => {
		// Arrange.
		mockIsAngiePluginAvailable.mockReturnValue( true );
		mockWaitForAngiePluginAvailable.mockResolvedValue( true );

		// Act.
		const { result } = renderHook( () => useIsAngieAvailable() );

		// Assert.
		expect( result.current ).toBe( true );
		expect( mockWaitForAngiePluginAvailable ).not.toHaveBeenCalled();
	} );

	it( 'should return false when the Angie plugin is not available yet', () => {
		// Arrange.
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockWaitForAngiePluginAvailable.mockReturnValue( new Promise( () => undefined ) );

		// Act.
		const { result } = renderHook( () => useIsAngieAvailable() );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should update when the Angie plugin becomes available after mount', async () => {
		// Arrange.
		mockIsAngiePluginAvailable.mockReturnValue( false );
		let resolveWait: ( value: boolean ) => void = () => undefined;
		mockWaitForAngiePluginAvailable.mockReturnValue(
			new Promise< boolean >( ( resolve ) => {
				resolveWait = resolve;
			} )
		);

		const { result } = renderHook( () => useIsAngieAvailable() );
		expect( result.current ).toBe( false );

		// Act.
		await act( async () => {
			resolveWait( true );
		} );

		// Assert.
		await waitFor( () => expect( result.current ).toBe( true ) );
	} );

	it( 'should ignore plugin becoming available after unmount', async () => {
		// Arrange.
		mockIsAngiePluginAvailable.mockReturnValue( false );
		let resolveWait: ( value: boolean ) => void = () => undefined;
		mockWaitForAngiePluginAvailable.mockReturnValue(
			new Promise< boolean >( ( resolve ) => {
				resolveWait = resolve;
			} )
		);

		const { result, unmount } = renderHook( () => useIsAngieAvailable() );

		// Act.
		unmount();
		await act( async () => {
			resolveWait( true );
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );
} );
