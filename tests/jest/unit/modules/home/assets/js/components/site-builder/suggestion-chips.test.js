import { fireEvent, render } from '@testing-library/react';
import SuggestionChips from 'elementor/modules/home/assets/js/site-builder/components/suggestion-chips';

jest.mock( 'elementor/modules/home/assets/js/site-builder/components/styled-components', () => {
	const PropTypes = require( 'prop-types' );

	const PlannerChipsRow = ( { children } ) => <div data-testid="chips-row">{ children }</div>;
	PlannerChipsRow.propTypes = { children: PropTypes.node };

	const SuggestionChip = ( { label, onClick, selected } ) => (
		<button type="button" data-selected={ selected } onClick={ onClick }>
			{ label }
		</button>
	);
	SuggestionChip.propTypes = {
		label: PropTypes.string,
		onClick: PropTypes.func,
		selected: PropTypes.bool,
	};

	return { PlannerChipsRow, SuggestionChip };
} );

const PAGE_SUGGESTIONS = [ 'Home', 'Services', 'Contact' ];
const SITE_TYPE_SUGGESTIONS = [ 'Business website', 'Portfolio website', 'E-commerce store' ];

let siteBuilderState = {};

const mockState = ( overrides ) => {
	siteBuilderState = {
		sessionStep: null,
		pageSuggestions: [],
		siteTypeSuggestions: [],
		isLoading: false,
		error: null,
		...overrides,
	};

	return siteBuilderState;
};

const renderChips = ( props = {} ) => render(
	<SuggestionChips onChipSelect={ jest.fn() } siteBuilderState={ siteBuilderState } { ...props } />,
);

const setDefaultState = () => {
	mockState();
};

beforeEach( () => {
	setDefaultState();
} );

describe( 'SuggestionChips', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows site-type suggestions when the planner has never been used (sessionStep is null)', () => {
		mockState( { sessionStep: null, siteTypeSuggestions: SITE_TYPE_SUGGESTIONS } );

		const { getByText } = renderChips();

		SITE_TYPE_SUGGESTIONS.forEach( ( label ) => {
			expect( getByText( label ) ).toBeTruthy();
		} );
	} );

	it( 'shows site-type suggestions when the session is still at INIT (sessionStep is 0)', () => {
		mockState( { sessionStep: 0, siteTypeSuggestions: SITE_TYPE_SUGGESTIONS } );

		const { getByText } = renderChips();

		SITE_TYPE_SUGGESTIONS.forEach( ( label ) => {
			expect( getByText( label ) ).toBeTruthy();
		} );
	} );

	it( 'hides site-type suggestions once the session has advanced past INIT', () => {
		mockState( { sessionStep: 1, siteTypeSuggestions: SITE_TYPE_SUGGESTIONS } );

		const { container } = renderChips();

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'shows page-name suggestions once the session reaches WIREFRAMES', () => {
		mockState( { sessionStep: 3, pageSuggestions: PAGE_SUGGESTIONS } );

		const { getByText } = renderChips();

		PAGE_SUGGESTIONS.forEach( ( label ) => {
			expect( getByText( label ) ).toBeTruthy();
		} );
	} );

	it( 'shows page-name suggestions when session is at DEPLOYED_TO_PLUGIN (step 6)', () => {
		mockState( { sessionStep: 6, pageSuggestions: PAGE_SUGGESTIONS } );

		const { getByText } = renderChips();

		PAGE_SUGGESTIONS.forEach( ( label ) => {
			expect( getByText( label ) ).toBeTruthy();
		} );
	} );

	it( 'renders nothing when the session is between INIT and WIREFRAMES', () => {
		mockState( {
			sessionStep: 2,
			pageSuggestions: PAGE_SUGGESTIONS,
			siteTypeSuggestions: SITE_TYPE_SUGGESTIONS,
		} );

		const { container } = renderChips();

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'renders nothing when sessionStep cannot be coerced to a finite number', () => {
		mockState( {
			sessionStep: 'not-a-number',
			pageSuggestions: PAGE_SUGGESTIONS,
			siteTypeSuggestions: SITE_TYPE_SUGGESTIONS,
		} );

		const { container } = renderChips();

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'invokes onChipSelect with the chosen suggestion when a chip is clicked', () => {
		const onChipSelect = jest.fn();
		mockState( { sessionStep: null, siteTypeSuggestions: SITE_TYPE_SUGGESTIONS } );

		const { getByText } = renderChips( { onChipSelect } );

		fireEvent.click( getByText( 'Portfolio website' ) );

		expect( onChipSelect ).toHaveBeenCalledWith( 'Portfolio website' );
	} );
} );
