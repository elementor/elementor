/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { BrowserToolsPanel } from 'elementor/modules/agents/assets/js/admin/components/browser-tools/browser-tools-panel';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

jest.mock( '@elementor/icons', () => ( {
	BriefcaseIcon: () => <span />,
	FileTextIcon: () => <span />,
	SearchIcon: () => <span />,
	SitemapIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div role="alert">{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, disabled, onClick, type = 'button' } ) => (
	<button type={ type } disabled={ disabled } onClick={ onClick }>{ children }</button>
) );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/Stack', () => ( { children, component, onSubmit } ) => (
	'form' === component ? <form onSubmit={ onSubmit }>{ children }</form> : <div>{ children }</div>
) );
jest.mock( '@elementor/ui/TextField', () => ( { value, onChange, inputProps } ) => (
	<textarea aria-label={ inputProps[ 'aria-label' ] } maxLength={ inputProps.maxLength } value={ value } onChange={ onChange } />
) );
jest.mock( '@elementor/ui/Typography', () => ( { children, color } ) => <span data-color={ color }>{ children }</span> );

const SAVED_DETAILS = 'Open Monday to Friday, 9-17.';
const MAX_DETAILS_LENGTH = 2000;

const tools = [
	{ name: 'search_site_content', label: 'Search site content', description: 'Find pages.' },
	{ name: 'query_business_info', label: 'Get business information', description: 'Business details.' },
	{ name: 'read_page_content', label: 'Read page content', description: 'Page text.' },
];

const renderPanel = ( settings, isMarkdownEnabled = false ) => render(
	<BrowserToolsPanel
		settings={ {
			businessDetails: SAVED_DETAILS,
			isAvailable: true,
			maxBusinessDetailsLength: MAX_DETAILS_LENGTH,
			saveBusinessDetails: jest.fn( () => Promise.resolve() ),
			tools,
			...settings,
		} }
		isMarkdownEnabled={ isMarkdownEnabled }
	/>,
);

describe( 'BrowserToolsPanel', () => {
	it( 'renders every tool with the active styling', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getByText( 'Search site content' ).getAttribute( 'data-color' ) ).toBe( 'text.primary' );
		expect( screen.getByText( 'Get business information' ).getAttribute( 'data-color' ) ).toBe( 'text.primary' );
		expect( screen.getByText( 'Business details.' ).getAttribute( 'data-color' ) ).toBe( 'text.secondary' );
	} );

	it( 'shows a single Edit details button for business information and no form by default', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getAllByRole( 'button', { name: 'Edit details' } ) ).toHaveLength( 1 );
		expect( screen.queryByRole( 'textbox', { name: 'Business details' } ) ).toBeNull();
	} );

	it( 'opens the form with the saved details when Edit details is clicked', () => {
		// Arrange
		renderPanel();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit details' } ) );

		// Assert
		const textarea = screen.getByRole( 'textbox', { name: 'Business details' } );

		expect( textarea.value ).toBe( SAVED_DETAILS );
		expect( textarea.getAttribute( 'maxlength' ) ).toBe( String( MAX_DETAILS_LENGTH ) );
		expect( screen.queryByRole( 'button', { name: 'Edit details' } ) ).toBeNull();
	} );

	it( 'keeps Save disabled until the details change', () => {
		// Arrange
		renderPanel();
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit details' } ) );

		// Act
		const disabledBeforeEdit = screen.getByRole( 'button', { name: 'Save' } ).disabled;
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Business details' } ), { target: { value: 'New details' } } );

		// Assert
		expect( disabledBeforeEdit ).toBe( true );
		expect( screen.getByRole( 'button', { name: 'Save' } ).disabled ).toBe( false );
	} );

	it( 'saves the edited details and closes the form', async () => {
		// Arrange
		const saveBusinessDetails = jest.fn( () => Promise.resolve() );
		renderPanel( { saveBusinessDetails } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit details' } ) );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Business details' } ), { target: { value: 'New details' } } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'textbox', { name: 'Business details' } ) ).toBeNull() );
		expect( saveBusinessDetails ).toHaveBeenCalledWith( 'New details' );
		expect( screen.getByRole( 'button', { name: 'Edit details' } ) ).toBeTruthy();
	} );

	it( 'shows the error and keeps the form open when saving fails', async () => {
		// Arrange
		const saveBusinessDetails = jest.fn( () => Promise.reject( 'Could not save.' ) );
		renderPanel( { saveBusinessDetails } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit details' } ) );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Business details' } ), { target: { value: 'New details' } } );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		// Assert
		expect( ( await screen.findByRole( 'alert' ) ).textContent ).toBe( 'Could not save.' );
		expect( screen.getByRole( 'textbox', { name: 'Business details' } ).value ).toBe( 'New details' );
	} );

	it( 'closes the form without saving when Cancel is clicked', () => {
		// Arrange
		const saveBusinessDetails = jest.fn( () => Promise.resolve() );
		renderPanel( { saveBusinessDetails } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit details' } ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		// Assert
		expect( saveBusinessDetails ).not.toHaveBeenCalled();
		expect( screen.queryByRole( 'textbox', { name: 'Business details' } ) ).toBeNull();
	} );

	it( 'explains that read page content needs Markdown when Markdown is off', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getByText( 'Turn on Markdown content to make this tool available.' ) ).toBeTruthy();
	} );

	it( 'hides the Markdown notice as soon as Markdown is on', () => {
		// Arrange & Act
		renderPanel( {}, true );

		// Assert
		expect( screen.queryByText( 'Turn on Markdown content to make this tool available.' ) ).toBeNull();
	} );

	it( 'shows a notice when the Abilities API is unavailable', () => {
		// Arrange & Act
		renderPanel( { isAvailable: false } );

		// Assert
		expect( screen.getByRole( 'alert' ).textContent ).toContain( 'WordPress 6.9' );
	} );
} );
