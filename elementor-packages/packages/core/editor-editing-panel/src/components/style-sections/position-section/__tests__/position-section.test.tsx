import '@testing-library/jest-dom';

import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { type PropValue } from '@elementor/editor-props';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { useSessionStorage } from '@elementor/session';
import { fireEvent, screen } from '@testing-library/react';

import { useStyle } from '../../../../contexts/style-context';
import { useStylesField } from '../../../../hooks/use-styles-field';
import { useStylesFields } from '../../../../hooks/use-styles-fields';
import { PositionSection } from '../position-section';

jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../hooks/use-styles-fields' );
jest.mock( '../../../../contexts/style-context' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );

const renderPositionSection = () => {
	return renderField( <PositionSection />, {
		propTypes: {
			position: createMockPropType( { kind: 'plain', key: 'string' } ),
			'inset-block-start': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-block-end': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-inline-start': createMockPropType( { kind: 'object', key: 'size' } ),
			'inset-inline-end': createMockPropType( { kind: 'object', key: 'size' } ),
			'z-index': createMockPropType( { kind: 'plain', key: 'number' } ),
			'scroll-margin-top': createMockPropType( { kind: 'object', key: 'size' } ),
		},
	} );
};

describe( '<PositionSection />', () => {
	it( 'should hide position inputs if position is static', () => {
		// Arrange.
		mockPosition( 'static' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.queryAllByText( 'Top' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Bottom' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Right' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Left' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Z-index' ) ).toHaveLength( 0 );
	} );

	it( 'should hide position inputs if not selected value', () => {
		// Arrange.
		mockPosition( null );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.queryAllByText( 'Top' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Bottom' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Right' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Left' ) ).toHaveLength( 0 );
		expect( screen.queryAllByText( 'Z-index' ) ).toHaveLength( 0 );
	} );

	it( 'should show position inputs if position is not static', () => {
		// Arrange.
		mockPosition( 'relative' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs if position is absolute', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	it( 'should show position inputs if position is sticky', () => {
		// Arrange.
		mockPosition( 'sticky' );
		mockDimensions();
		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Top' ) ).toBeVisible();
		expect( screen.getByText( 'Bottom' ) ).toBeVisible();
		expect( screen.getByText( 'Right' ) ).toBeVisible();
		expect( screen.getByText( 'Left' ) ).toBeVisible();
		expect( screen.getByText( 'Z-index' ) ).toBeVisible();
	} );

	describe( 'Dimensions values persistence', () => {
		jest.mocked( useStyle ).mockReturnValue( {
			id: 'styleDefId',
			setId: jest.fn(),
			meta: { breakpoint: 'mobile', state: null },
			setMetaState: jest.fn(),
			provider: {} as StylesProvider,
		} );

		it( 'should save dimension values to history when changing position to static', () => {
			// Arrange.
			mockPosition( 'absolute' );
			mockDimensions( 44 );

			const setHistory = jest.fn();
			jest.mocked( useSessionStorage ).mockImplementation( () => [ null, setHistory, jest.fn() ] );

			// Act.
			renderPositionSection();

			const select = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( select );

			const staticOption = screen.getByText( 'Static' );
			fireEvent.click( staticOption );

			// Assert.
			expect( useSessionStorage ).toHaveBeenCalledWith( `styles/styleDefId/mobile/null/dimensions` );
			expect( setHistory ).toHaveBeenCalledWith( {
				'inset-block-start': {
					value: {
						size: 44,
						unit: 'px',
					},
					$$type: 'size',
				},
			} );
		} );

		it( 'should reset dimension values in the model when changing position to static', () => {
			// Arrange.
			mockPosition( 'absolute' );

			const setStylesFields = jest.fn();
			jest.mocked( useStylesFields ).mockReturnValue( {
				values: {
					'inset-block-start': {
						value: {
							size: 44,
							unit: 'px',
						},
						$$type: 'size',
					},
				},
				setValues: setStylesFields,
				canEdit: true,
			} );

			// Act.
			renderPositionSection();

			const select = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( select );

			const staticOption = screen.getByText( 'Static' );
			fireEvent.click( staticOption );

			// Assert.
			expect( useStylesFields ).toHaveBeenCalledWith( [
				'inset-block-start',
				'inset-block-end',
				'inset-inline-start',
				'inset-inline-end',
			] );
			expect( setStylesFields ).toHaveBeenCalledWith( {
				'inset-block-start': undefined,
				'inset-block-end': undefined,
				'inset-inline-start': undefined,
				'inset-inline-end': undefined,
			} );
		} );

		it( `should populate the model's dimension values from history when switching from static to a different position`, () => {
			// Arrange.
			mockPosition( 'static' );

			const setStylesFields = jest.fn();
			jest.mocked( useStylesFields ).mockReturnValue( { values: {}, setValues: setStylesFields, canEdit: true } );

			jest.mocked( useSessionStorage ).mockImplementation( () => [
				{
					'inset-inline-start': {
						value: {
							size: 54,
							unit: 'px',
						},
						$$type: 'size',
					},
				},
				jest.fn(),
				jest.fn(),
			] );

			// Act.
			renderPositionSection();

			const select = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( select );

			const absoluteOption = screen.getByText( 'Absolute' );
			fireEvent.click( absoluteOption );

			// Assert.
			expect( useSessionStorage ).toHaveBeenCalledWith( `styles/styleDefId/mobile/null/dimensions` );
			expect( useStylesFields ).toHaveBeenCalledWith( [
				'inset-block-start',
				'inset-block-end',
				'inset-inline-start',
				'inset-inline-end',
			] );
			expect( setStylesFields ).toHaveBeenCalledWith( {
				'inset-inline-start': {
					value: {
						size: 54,
						unit: 'px',
					},
					$$type: 'size',
				},
			} );
		} );
	} );

	it.skip( 'should show anchor offset input in all cases', () => {
		// Arrange.
		mockPosition( 'absolute' );
		mockDimensions( 44 );

		jest.mocked( useSessionStorage ).mockImplementation( () => [ null, jest.fn(), jest.fn() ] );

		// Act.
		renderPositionSection();

		// Assert.
		expect( screen.getByText( 'Anchor offset' ) ).toBeVisible();
	} );
} );

// mock functions
function mockPosition( position: string | null ) {
	jest.mocked( useStylesField ).mockImplementation( ( propName ) => {
		let value: PropValue = {
			$$type: 'string',
			value: null,
		};

		switch ( propName ) {
			case 'position':
				value = position
					? {
							$$type: 'string',
							value: position,
					  }
					: null;

				break;

			case 'z-index':
				value = {
					$$type: 'number',
					value: 0,
				};
				break;
		}

		return {
			value,
			setValue: jest.fn(),
			canEdit: true,
		};
	} );
}

function mockDimensions( size?: number ) {
	jest.mocked( useStylesFields ).mockReturnValue( {
		values: {
			'inset-block-start': {
				value: {
					size: size ?? 0,
					unit: 'px',
				},
				$$type: 'size',
			},
		},
		setValues: jest.fn(),
		canEdit: true,
	} );
}
