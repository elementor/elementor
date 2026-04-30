import * as React from 'react';
import { render } from '@testing-library/react';

import { service } from '../../service';
import { styleVariablesRepository } from '../../style-variables-repository';
import { GlobalStylesImportListener } from '../global-styles-import-listener';

jest.mock( '../../service', () => ( {
	service: {
		load: jest.fn(),
	},
} ) );

jest.mock( '../../style-variables-repository', () => ( {
	styleVariablesRepository: {
		update: jest.fn(),
	},
} ) );

const dispatchImportEvent = ( detail: unknown ) => {
	window.dispatchEvent( new CustomEvent( 'elementor/global-styles/imported', { detail } ) );
};

describe( 'GlobalStylesImportListener', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'always calls service.load() even when detail has no global_variables', () => {
		render( <GlobalStylesImportListener /> );

		dispatchImportEvent( {} );

		expect( service.load ).toHaveBeenCalledTimes( 1 );
		expect( styleVariablesRepository.update ).not.toHaveBeenCalled();
	} );

	it( 'calls service.load() when detail is undefined', () => {
		render( <GlobalStylesImportListener /> );

		dispatchImportEvent( undefined );

		expect( service.load ).toHaveBeenCalledTimes( 1 );
		expect( styleVariablesRepository.update ).not.toHaveBeenCalled();
	} );

	it( 'updates repository optimistically and calls service.load() when global_variables.data is present', () => {
		render( <GlobalStylesImportListener /> );

		const data = { foo: { value: 'bar' } };
		dispatchImportEvent( { global_variables: { data } } );

		expect( styleVariablesRepository.update ).toHaveBeenCalledWith( data );
		expect( service.load ).toHaveBeenCalledTimes( 1 );
	} );
} );
