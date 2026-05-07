import { act, renderHook } from '@testing-library/react';

import { getVariables } from '../../../../hooks/use-prop-variables';
import { STORAGE_UPDATED_EVENT } from '../../../../storage';
import { useVariablesManagerState } from '../use-variables-manager-state';

jest.mock( '../../../../hooks/use-prop-variables', () => ( {
	getVariables: jest.fn(),
} ) );

describe( 'useVariablesManagerState', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 're-reads variables from storage when STORAGE_UPDATED_EVENT fires', () => {
		const initialVariables = {
			'var-1': { label: 'old', value: '#000', type: 'color' },
		};
		const updatedVariables = {
			'var-1': { label: 'old', value: '#000', type: 'color' },
			'var-2': { label: 'new', value: '#fff', type: 'color' },
		};

		jest.mocked( getVariables ).mockReturnValueOnce( initialVariables ).mockReturnValueOnce( updatedVariables );

		const { result } = renderHook( () => useVariablesManagerState() );

		expect( result.current.variables ).toEqual( initialVariables );

		act( () => {
			window.dispatchEvent( new Event( STORAGE_UPDATED_EVENT ) );
		} );

		expect( result.current.variables ).toEqual( updatedVariables );
	} );

	it( 'resets dirty and deleted state on storage update', () => {
		jest.mocked( getVariables )
			.mockReturnValueOnce( { 'var-1': { label: 'a', value: '1', type: 'color' } } )
			.mockReturnValue( { 'var-2': { label: 'b', value: '2', type: 'color' } } );

		const { result } = renderHook( () => useVariablesManagerState() );

		act( () => {
			result.current.handleDeleteVariable( 'var-1' );
		} );

		expect( result.current.isDirty ).toBe( true );
		expect( result.current.deletedVariables ).toEqual( [ 'var-1' ] );

		act( () => {
			window.dispatchEvent( new Event( STORAGE_UPDATED_EVENT ) );
		} );

		expect( result.current.isDirty ).toBe( false );
		expect( result.current.deletedVariables ).toEqual( [] );
	} );
} );
