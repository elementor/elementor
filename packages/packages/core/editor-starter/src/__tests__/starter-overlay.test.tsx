import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import StarterOverlay from '../components/starter-overlay';
import { useStarter } from '../hooks/use-starter';

jest.mock( '../hooks/use-starter' );

const mockUseStarter = useStarter as jest.MockedFunction< typeof useStarter >;

describe( 'StarterOverlay', () => {
	const mockDismiss = jest.fn();
	const mockOpenAiPlanner = jest.fn();
	const mockOpenTemplatesLibrary = jest.fn();
	const mockOnExited = jest.fn();

	const defaultProps = {
		config: {
			restPath: 'test-rest-path',
			aiPlannerUrl: 'https://planner.test',
			kitLibraryUrl: 'https://kit-library.test',
		},
		isDismissing: false,
		portalContainer: document.createElement( 'div' ),
		dismiss: mockDismiss,
		openAiPlanner: mockOpenAiPlanner,
		openTemplatesLibrary: mockOpenTemplatesLibrary,
		onExited: mockOnExited,
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseStarter.mockReturnValue( defaultProps );
	} );

	it( 'should call openAiPlanner when AI Site Planner card is clicked', () => {
		render( <StarterOverlay /> );

		const aiPlannerCard = screen.getByText( 'AI Site Planner' ).closest( 'button' );
		fireEvent.click( aiPlannerCard! );

		expect( mockOpenAiPlanner ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should call openTemplatesLibrary when Website templates card is clicked', () => {
		render( <StarterOverlay /> );

		const templatesCard = screen.getByText( 'Website templates' ).closest( 'button' );
		fireEvent.click( templatesCard! );

		expect( mockOpenTemplatesLibrary ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should call dismiss when Blank site card is clicked', () => {
		render( <StarterOverlay /> );

		const blankSiteCard = screen.getByText( 'Blank site' ).closest( 'button' );
		fireEvent.click( blankSiteCard! );

		expect( mockDismiss ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should call dismiss when close button is clicked', () => {
		render( <StarterOverlay /> );

		const closeButton = screen.getByLabelText( 'Close' );
		fireEvent.click( closeButton );

		expect( mockDismiss ).toHaveBeenCalledTimes( 1 );
	} );
} );
