import '@testing-library/jest-dom';

import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { getStylesSchema } from '@elementor/editor-styles';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesField } from '../../../../hooks/use-styles-field';
import { SizeSection } from '../size-section';

jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../contexts/style-context' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

describe( '<SizeSection />', () => {
	beforeEach( () => {
		( jest.mocked( getStylesSchema ) as jest.Mock ).mockReturnValue( {
			width: createMockPropType( { kind: 'object', key: 'size' } ),
			height: createMockPropType( { kind: 'object', key: 'size' } ),
			'min-width': createMockPropType( { kind: 'object', key: 'size' } ),
			'min-height': createMockPropType( { kind: 'object', key: 'size' } ),
			'max-width': createMockPropType( { kind: 'object', key: 'size' } ),
			'max-height': createMockPropType( { kind: 'object', key: 'size' } ),
			overflow: createMockPropType( { kind: 'plain', key: 'string' } ),
			'object-fit': createMockPropType( { kind: 'plain', key: 'string' } ),
			'object-position': createMockPropType( { kind: 'plain', key: 'string' } ),
		} );
	} );

	it.skip( 'should not show object-position field when object-fit is "fill"', () => {
		jest.mocked( useStylesField ).mockImplementation( ( property: string ) => {
			const response = { value: null, setValue: jest.fn(), canEdit: true };

			if ( property === 'object-fit' ) {
				return { ...response, value: { value: 'fill', $$type: 'string' } };
			}
			if ( property === 'object-position' ) {
				return { ...response, value: { value: 'center center', $$type: 'string' } };
			}

			return response;
		} );

		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<SizeSection />
			</ControlActionsProvider>
		);
		const showMoreButton = screen.getByText( 'Show more' );
		fireEvent.click( showMoreButton );

		expect( screen.getByText( 'Object fit' ) ).toBeVisible();
		expect( screen.queryByText( 'Object position' ) ).not.toBeInTheDocument();
	} );

	it.skip( 'should show object-position field when object-fit is not "fill"', () => {
		jest.mocked( useStylesField ).mockImplementation( ( property: string ) => {
			const response = { value: null, setValue: jest.fn(), canEdit: true };

			if ( property === 'object-fit' ) {
				return { ...response, value: { value: 'cover', $$type: 'string' } };
			}
			if ( property === 'object-position' ) {
				return { ...response, value: { value: 'center center', $$type: 'string' } };
			}
			return response;
		} );

		renderWithTheme(
			<ControlActionsProvider items={ [] }>
				<SizeSection />
			</ControlActionsProvider>
		);
		const showMoreButton = screen.getByText( 'Show more' );
		fireEvent.click( showMoreButton );

		expect( screen.getByText( 'Object position' ) ).toBeVisible();
	} );
} );
