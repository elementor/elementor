import * as React from 'react';
import { createMockStyleDefinition, createMockStylesProvider, renderWithTheme } from 'test-utils';
import { stylesRepository, useUserStylesCapability } from '@elementor/editor-styles-repository';
import { setAppliedClassContext } from '@elementor/editor-variables';
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

jest.mock( '@elementor/editor-variables', () => ( {
	setAppliedClassContext: jest.fn(),
} ) );

describe( 'StyleContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should set the applied class context to the class label when the style belongs to a named provider', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'global-classes' }, [
			createMockStyleDefinition( { id: 'style-id-1', label: 'my-button-class' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		// Act.
		renderWithTheme(
			<StyleProvider
				id={ 'style-id-1' }
				meta={ { breakpoint: null, state: null } }
				setMetaState={ jest.fn() }
				setId={ jest.fn() }
			>
				{ 'children' }
			</StyleProvider>
		);

		// Assert.
		expect( setAppliedClassContext ).toHaveBeenCalledWith( 'my-button-class' );
	} );

	it( 'should set the applied class context to "local" when the style belongs to the elements provider', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'document-elements-1' }, [
			createMockStyleDefinition( { id: 'style-id-1', label: 'local' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		// Act.
		renderWithTheme(
			<StyleProvider
				id={ 'style-id-1' }
				meta={ { breakpoint: null, state: null } }
				setMetaState={ jest.fn() }
				setId={ jest.fn() }
			>
				{ 'children' }
			</StyleProvider>
		);

		// Assert.
		expect( setAppliedClassContext ).toHaveBeenCalledWith( 'local' );
	} );

	it( 'should reset the applied class context on unmount', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'document-elements-1' }, [
			createMockStyleDefinition( { id: 'style-id-1' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ mockProvider ] );

		// Act.
		const { unmount } = renderWithTheme(
			<StyleProvider
				id={ 'style-id-1' }
				meta={ { breakpoint: null, state: null } }
				setMetaState={ jest.fn() }
				setId={ jest.fn() }
			>
				{ 'children' }
			</StyleProvider>
		);
		unmount();

		// Assert.
		expect( setAppliedClassContext ).toHaveBeenLastCalledWith( null );
	} );

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
		const mockConsoleError = jest.fn();
		window.console.error = mockConsoleError;
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

		expect( mockConsoleError ).toHaveBeenCalled();
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
