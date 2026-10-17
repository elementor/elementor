import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { getElementStateParams, getWidgetsCache, updateElementStateParams } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../../contexts/element-context';
import { StateSection } from '../state-section';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementStateParams: jest.fn(),
	updateElementStateParams: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

const CONTAINER_ID = 'flexbox-1';
const CONTAINER_TYPE = 'e-flexbox';
const WIDGET_TYPE = 'e-heading';
const RATE_PARAM = {
	key: 'rate',
	label: 'rate',
	type: 'number' as const,
	prop_type: 'number' as const,
	default: 4,
	exposed: { control: 'number' as const, label: 'Rate per m2' },
};
const INTERNAL_PARAM = { key: 'angle', label: 'angle', type: 'number' as const, default: 0 };

const renderStateSection = ( type = CONTAINER_TYPE ) => {
	const element = { id: CONTAINER_ID, type };
	const elementType = createMockElementType( { key: type, title: type } );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<ControlActionsProvider items={ [] }>
				<StateSection />
			</ControlActionsProvider>
		</ElementProvider>
	);
};

describe( '<StateSection />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ CONTAINER_TYPE ]: { elType: CONTAINER_TYPE },
			[ WIDGET_TYPE ]: { elType: 'widget' },
		} as never );
	} );

	it( 'should render a control only for the exposed params', () => {
		// Arrange
		jest.mocked( getElementStateParams ).mockReturnValue( [ RATE_PARAM, INTERNAL_PARAM ] );

		// Act
		renderStateSection();

		// Assert
		expect( screen.getByText( 'Rate per m2' ) ).toBeInTheDocument();
		expect( screen.getAllByRole( 'spinbutton' ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 4 );
	} );

	it( 'should store the edited value as the param default', () => {
		// Arrange
		jest.mocked( getElementStateParams ).mockReturnValue( [ INTERNAL_PARAM, RATE_PARAM ] );
		renderStateSection();

		// Act
		fireEvent.input( screen.getByRole( 'spinbutton' ), { target: { value: '9' } } );

		// Assert
		expect( updateElementStateParams ).toHaveBeenLastCalledWith( {
			elementId: CONTAINER_ID,
			stateParams: [ INTERNAL_PARAM, { ...RATE_PARAM, default: 9 } ],
		} );
	} );

	it( 'should render nothing when no param is exposed', () => {
		// Arrange
		jest.mocked( getElementStateParams ).mockReturnValue( [ INTERNAL_PARAM ] );

		// Act
		renderStateSection();

		// Assert
		expect( screen.queryByText( 'State' ) ).not.toBeInTheDocument();
	} );

	it( 'should not render for widgets', () => {
		// Arrange
		jest.mocked( getElementStateParams ).mockReturnValue( [ RATE_PARAM ] );

		// Act
		renderStateSection( WIDGET_TYPE );

		// Assert
		expect( screen.queryByRole( 'spinbutton' ) ).not.toBeInTheDocument();
	} );
} );
