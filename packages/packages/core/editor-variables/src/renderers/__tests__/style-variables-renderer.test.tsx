import * as React from 'react';
import { __privateUseListenTo as useListenTo } from '@elementor/editor-v1-adapters';
import { render, screen } from '@testing-library/react';

import { styleVariablesRepository } from '../../style-variables-repository';
import { StyleVariablesRenderer } from '../style-variables-renderer';

// Mock dependencies
const unsubscribeMock = jest.fn();

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateUseListenTo: jest.fn(),
	commandEndEvent: jest.fn(),
} ) );

jest.mock( '@elementor/ui', () => ( {
	Portal: jest.fn( ( { children } ) => <div data-testid="portal">{ children }</div> ),
} ) );

jest.mock( '../../style-variables-repository', () => ( {
	styleVariablesRepository: {
		subscribe: jest.fn( () => unsubscribeMock ),
	},
} ) );

jest.mock( '../../sync/get-canvas-iframe-document', () => ( {
	getCanvasIframeDocument: jest.fn(),
} ) );

describe( '<StyleVariablesRenderer />', () => {
	it( 'should not render anything when container is not available', () => {
		// Arrange.
		jest.mocked( useListenTo ).mockReturnValue( null );

		// Act.
		render( <StyleVariablesRenderer /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.queryByTestId( 'portal' ) ).not.toBeInTheDocument();
	} );

	it( 'should render style variables in portal when container is available', () => {
		// Arrange.
		const mockContainer = document.createElement( 'div' );
		const mockVariables = {
			'e-gv-a1': { value: '#ff0000', label: 'red-color', type: 'global-color-variable' },
			'e-gv-a2': { value: 'Arial', label: 'font-arial', type: 'global-font-variable' },
			'e-gv-a3': { value: 'yellow', label: 'yellow-color', type: 'global-color-variable' },
			'e-gv-a4': { value: 'red', label: 'red-color', type: 'global-color-variable', deleted: true },
		};

		jest.mocked( useListenTo ).mockReturnValue( mockContainer );
		jest.mocked( styleVariablesRepository.subscribe ).mockImplementation( ( callback ) => {
			callback( mockVariables );

			return jest.fn();
		} );

		// Act.
		render( <StyleVariablesRenderer /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'portal' ) ).toMatchSnapshot();
	} );

	it( 'should not render anything when there are no style variables', () => {
		// Arrange.
		const mockContainer = document.createElement( 'div' );

		jest.mocked( useListenTo ).mockReturnValue( mockContainer );
		jest.mocked( styleVariablesRepository.subscribe ).mockImplementation( ( callback ) => {
			callback( {} );

			return jest.fn();
		} );

		// Act.
		render( <StyleVariablesRenderer /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.queryByTestId( 'portal' ) ).not.toBeInTheDocument();
	} );

	it( 'should unsubscribe from style variables on unmount', () => {
		// Arrange.
		const mockContainer = document.createElement( 'div' );

		jest.mocked( useListenTo ).mockReturnValue( mockContainer );
		jest.mocked( styleVariablesRepository.subscribe ).mockImplementation( () => unsubscribeMock );

		// Act.
		const { unmount } = render( <StyleVariablesRenderer /> );

		unmount();

		// Assert.
		expect( unsubscribeMock ).toHaveBeenCalled();
	} );
} );
