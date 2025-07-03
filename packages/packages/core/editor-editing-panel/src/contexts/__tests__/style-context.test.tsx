import * as React from 'react';
import { createMockStyleDefinition, createMockStylesProvider, renderWithTheme } from 'test-utils';
import { stylesRepository, useUserStylesCapability } from '@elementor/editor-styles-repository';
import { renderHook } from '@testing-library/react';

import { StylesProviderNotFoundError } from '../../errors';
import { StyleProvider, useStyle } from '../style-context';

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn().mockReturnValue( { userCan: () => ( { updateProps: true } ) } ),
	stylesRepository: {
		getProviders: jest.fn(),
	},
} ) );

describe( 'StyleContext', () => {
	it( 'should return the correct style id and its provider', () => {
		// Arrange.
		const mockProvider1 = createMockStylesProvider( { key: 'style-provider' }, [
			createMockStyleDefinition( { id: 'style-id-1' } ),
		] );

		const mockProvider2 = createMockStylesProvider( { key: 'style-provider-2' }, [
			createMockStyleDefinition( { id: 'style-id-2' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider1, mockProvider2 ] );

		// Act.
		const { result } = renderHook( useStyle, {
			wrapper: ( { children } ) => (
				<StyleProvider
					id={ 'style-id-2' }
					meta={ { breakpoint: null, state: null } }
					setMetaState={ jest.fn() }
					setId={ jest.fn() }
				>
					{ children }
				</StyleProvider>
			),
		} );

		// Assert.
		expect( result.current.id ).toBe( 'style-id-2' );
		expect( result.current.provider ).toBe( mockProvider2 );
	} );

	it( 'should throw when style provider does not exist', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'style-provider' }, [
			createMockStyleDefinition( { id: 'style-id-1' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		// Act/Assert.
		expect( () => {
			renderWithTheme(
				<StyleProvider
					id={ 'style-id' }
					meta={ { breakpoint: null, state: null } }
					setMetaState={ jest.fn() }
					setId={ jest.fn() }
				>
					{ 'children' }
				</StyleProvider>
			);
		} ).toThrow( StylesProviderNotFoundError );

		expect( console ).toHaveErrored();
	} );

	it( 'should disable editing when user does not have updateProps capability', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'style-provider' }, [
			createMockStyleDefinition( { id: 'style-id-1' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		jest.mocked( useUserStylesCapability ).mockReturnValue( {
			userCan: () => ( { updateProps: false, update: true, delete: true, create: true } ),
		} );

		// Act.
		const { result } = renderHook( useStyle, {
			wrapper: ( { children } ) => (
				<StyleProvider
					id={ 'style-id-1' }
					meta={ { breakpoint: null, state: null } }
					setMetaState={ jest.fn() }
					setId={ jest.fn() }
				>
					{ children }
				</StyleProvider>
			),
		} );

		// Assert.
		expect( result.current.canEdit ).toBe( false );
	} );
} );
