import { fireEvent, render, screen } from '@testing-library/react';

import { RowAction } from 'elementor/modules/agents/assets/js/admin/scanner/components/fix-row-actions';
import { FIX_WITH_MANUAL } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';

const defaultProps = {
	check: {
		id: 'public-api',
		fixWith: FIX_WITH_MANUAL,
	},
	isResolved: false,
	agentAccessUrl: 'https://example.com/agent-access',
	seoPluginSearchUrl: 'https://example.com/seo',
	onOpen: jest.fn(),
	onFixWithAngie: jest.fn(),
	onSetEnabled: jest.fn(),
	onUndo: jest.fn(),
	onRescan: jest.fn(),
};

describe( 'RowAction', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders Manual fix as a clickable button and opens the row on click', () => {
		// Arrange
		render( <RowAction { ...defaultProps } /> );
		const action = screen.getByRole( 'button', { name: 'Manual fix' } );

		// Act
		fireEvent.click( action );

		// Assert
		expect( defaultProps.onOpen ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.onOpen ).toHaveBeenCalledWith( 'public-api' );
	} );
} );
