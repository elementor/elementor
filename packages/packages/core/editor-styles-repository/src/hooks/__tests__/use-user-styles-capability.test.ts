import { DESIGN_RESTRICTION, useCurrentUserCapabilities, useUserRestrictions } from '@elementor/editor-current-user';
import { renderHook } from '@testing-library/react';

import { documentElementsStylesProvider } from '../../providers/document-elements-styles-provider';
import { stylesRepository } from '../../styles-repository';
import { type StylesProvider } from '../../types';
import { useUserStylesCapability } from '../use-user-styles-capability';

jest.mock( '@elementor/editor-current-user' );
jest.mock( '../../styles-repository' );

const UPDATE_CAPABILITY = 'update_style';
const PROVIDER_WITH_CAPABILITIES_KEY = 'provider-with-capabilities';

const providerWithCapabilities: Pick< StylesProvider, 'getKey' | 'capabilities' > = {
	getKey: () => PROVIDER_WITH_CAPABILITIES_KEY,
	capabilities: {
		create: UPDATE_CAPABILITY,
		delete: UPDATE_CAPABILITY,
		update: UPDATE_CAPABILITY,
		updateProps: UPDATE_CAPABILITY,
	},
};

const deniedCapabilities = {
	create: false,
	delete: false,
	update: false,
	updateProps: false,
};

describe( 'useUserStylesCapability', () => {
	beforeEach( () => {
		jest.mocked( useUserRestrictions ).mockReturnValue( {
			isRestricted: () => false,
			restrictions: undefined,
			hasContentOnlyAccess: false,
		} );

		jest.mocked( useCurrentUserCapabilities ).mockReturnValue( {
			capabilities: [ UPDATE_CAPABILITY ],
			canUser: ( capability ) => capability === UPDATE_CAPABILITY,
			isAdmin: false,
		} );
	} );

	it( 'should deny all capabilities for content-only users on a provider without capabilities', () => {
		// Arrange
		jest.mocked( useUserRestrictions ).mockReturnValue( {
			isRestricted: ( restriction ) => restriction === DESIGN_RESTRICTION,
			restrictions: [ DESIGN_RESTRICTION ],
			hasContentOnlyAccess: true,
		} );

		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( documentElementsStylesProvider );

		// Act
		const { result } = renderHook( () => useUserStylesCapability() );

		// Assert
		expect( result.current.userCan( 'document-elements-42' ) ).toEqual( deniedCapabilities );
	} );

	it( 'should deny all capabilities for content-only users on a provider with capabilities', () => {
		// Arrange
		jest.mocked( useUserRestrictions ).mockReturnValue( {
			isRestricted: ( restriction ) => restriction === DESIGN_RESTRICTION,
			restrictions: [ DESIGN_RESTRICTION ],
			hasContentOnlyAccess: true,
		} );

		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( providerWithCapabilities as StylesProvider );

		// Act
		const { result } = renderHook( () => useUserStylesCapability() );

		// Assert
		expect( result.current.userCan( PROVIDER_WITH_CAPABILITIES_KEY ) ).toEqual( deniedCapabilities );
	} );
} );
