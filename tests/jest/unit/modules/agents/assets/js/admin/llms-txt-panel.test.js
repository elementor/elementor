/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LlmsTxtPanel } from 'elementor/modules/agents/assets/js/admin/components/llms-txt/llms-txt-panel';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%(\d\$)?[sd]/, arg ), format ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AlertCircleIcon: () => <span />,
	ArchiveTemplateIcon: () => <span />,
	ArrowsDiagonalIcon: () => <span />,
	ChevronDownIcon: () => <span />,
	ChevronUpIcon: () => <span />,
	ExternalLinkIcon: () => <span />,
	FileIcon: () => <span />,
	PencilIcon: () => <span />,
	PinIcon: () => <span />,
	ZoomIcon: () => <span />,
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	listContentItems: jest.fn( () => Promise.resolve( { items: [], hasMore: false } ) ),
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div role="alert">{ children }</div> );
jest.mock( '@elementor/ui/Dialog', () => ( { children } ) => <div role="dialog">{ children }</div> );
jest.mock( '@elementor/ui/DialogActions', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogContent', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogHeader', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogTitle', () => ( { children } ) => <h2>{ children }</h2> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, disabled, onClick, type = 'button' } ) => (
	<button type={ type } disabled={ disabled } onClick={ onClick }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span data-testid="chip">{ label }</span> );
jest.mock( '@elementor/ui/Collapse', () => ( { children, in: isOpen } ) => ( isOpen ? <div>{ children }</div> : null ) );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/IconButton', () => ( { children, onClick, 'aria-label': ariaLabel } ) => (
	<button type="button" onClick={ onClick } aria-label={ ariaLabel }>{ children }</button>
) );
jest.mock( '@elementor/ui/Stack', () => ( { children, component, onSubmit } ) => (
	'form' === component ? <form onSubmit={ onSubmit }>{ children }</form> : <div>{ children }</div>
) );
jest.mock( '@elementor/ui/Switch', () => ( { checked, disabled, onChange, inputProps } ) => (
	<input type="checkbox" role="switch" aria-label={ inputProps?.[ 'aria-label' ] } checked={ checked } disabled={ disabled } onChange={ onChange } />
) );
jest.mock( '@elementor/ui/TextField', () => ( { value, onChange, disabled, inputProps } ) => (
	<textarea aria-label={ inputProps[ 'aria-label' ] } maxLength={ inputProps.maxLength } value={ value } disabled={ disabled } onChange={ onChange } />
) );
jest.mock( '@elementor/ui/Tooltip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );

const createPostTypes = ( total ) => Array.from( { length: total }, ( _, index ) => ( {
	name: `type-${ index }`,
	label: `Type ${ index }`,
	count: index,
	included: true,
} ) );

const MAX_CUSTOM_TEXT_LENGTH = 2000;
const CUSTOM_TEXT_FIELD_NAME = 'Instructions for agents';

const createSettings = ( overrides = {} ) => ( {
	content: '# Site',
	customText: '',
	excludedPostIds: [],
	flushExclusions: jest.fn( () => Promise.resolve() ),
	hasPhysicalFile: false,
	isEnabled: true,
	isManuallyEdited: false,
	maxCustomTextLength: MAX_CUSTOM_TEXT_LENGTH,
	postTypes: createPostTypes( 2 ),
	revertContent: jest.fn( () => Promise.resolve() ),
	saveContent: jest.fn( () => Promise.resolve() ),
	saveCustomText: jest.fn( () => Promise.resolve() ),
	takeOverFile: jest.fn( () => Promise.resolve() ),
	togglePostExclusion: jest.fn(),
	togglePostType: jest.fn(),
	...overrides,
} );

describe( 'LlmsTxtPanel', () => {
	it( 'shows only the first four post types until "Show more" is clicked', () => {
		// Arrange
		render( <LlmsTxtPanel settings={ createSettings( { postTypes: createPostTypes( 6 ) } ) } /> );

		// Assert
		expect( screen.getAllByRole( 'switch' ) ).toHaveLength( 4 );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Show more' } ) );

		// Assert
		expect( screen.getAllByRole( 'switch' ) ).toHaveLength( 6 );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Show less' } ) );

		// Assert
		expect( screen.getAllByRole( 'switch' ) ).toHaveLength( 4 );
	} );

	it( 'hides "Show more" when there are four or fewer post types', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { postTypes: createPostTypes( 4 ) } ) } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Show more' } ) ).toBeNull();
	} );

	it( 'toggles a post type through the settings callback', () => {
		// Arrange
		const settings = createSettings();
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'switch', { name: 'Type 1' } ) );

		// Assert
		expect( settings.togglePostType ).toHaveBeenCalledWith( 'type-1' );
	} );

	it( 'shows published and agent-visible counts when posts are excluded', () => {
		// Arrange
		const postTypes = [ { name: 'page', label: 'Pages', count: 5, included: true, excludedCount: 2 } ];

		// Act
		render( <LlmsTxtPanel settings={ createSettings( { postTypes } ) } /> );

		// Assert
		expect( screen.getByText( '3/5 published' ) ).toBeTruthy();
	} );

	it( 'opens the post list when the post type name is clicked', async () => {
		// Arrange
		const settings = createSettings();
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Choose which Type 1 to include' } ) );

		// Assert
		expect( await screen.findByRole( 'dialog' ) ).toBeTruthy();
		expect( screen.getByRole( 'heading', { name: 'Type 1' } ) ).toBeTruthy();
	} );

	it( 'does not open the post list when the file was edited manually', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { isManuallyEdited: true } ) } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Choose which Type 1 to include' } ) ).toBeNull();
	} );

	it( 'keeps rows checked but disabled and shows the warning when the file was edited manually', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { isManuallyEdited: true } ) } /> );

		// Assert
		screen.getAllByRole( 'switch' ).forEach( ( row ) => {
			expect( row.checked ).toBe( true );
			expect( row.disabled ).toBe( true );
		} );
		expect( screen.getByRole( 'alert' ).textContent ).toContain( 'You’re editing llms.txt by hand.' );
		expect( screen.queryByTestId( 'chip' ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Edit' } ) ).toBeTruthy();
	} );

	it( 'tracks the llms.txt file as opened when the edit action is used', () => {
		// Arrange
		const dispatchEvent = jest.fn();
		window.elementorCommon = { eventsManager: { dispatchEvent } };
		render( <LlmsTxtPanel settings={ createSettings() } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit' } ) );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_file_opened', expect.objectContaining( { file_type: 'llms_txt' } ) );
		expect( screen.getByRole( 'dialog' ) ).toBeTruthy();

		delete window.elementorCommon;
	} );

	it( 'turns rows off, disables them and hides the preview actions when a physical file exists', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { hasPhysicalFile: true, isEnabled: false } ) } /> );

		// Assert
		screen.getAllByRole( 'switch' ).forEach( ( row ) => {
			expect( row.checked ).toBe( false );
			expect( row.disabled ).toBe( true );
		} );
		expect( screen.getByTestId( 'chip' ).textContent ).toBe( 'This file is managed outside Agent Ready and can’t be controlled from here.' );
		expect( screen.queryByRole( 'button', { name: 'Edit' } ) ).toBeNull();
		expect( screen.queryByText( '# Site' ) ).toBeNull();
	} );

	it( 'hides the preview when the module is disabled', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { isEnabled: false } ) } /> );

		// Assert
		expect( screen.queryByText( '# Site' ) ).toBeNull();
		screen.getAllByRole( 'switch' ).forEach( ( row ) => expect( row.disabled ).toBe( true ) );
	} );

	it( 'reverts to the generated version only after the admin confirms', async () => {
		// Arrange
		const settings = createSettings( { isManuallyEdited: true } );
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Switch back' } ) );

		// Assert
		expect( settings.revertContent ).not.toHaveBeenCalled();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Revert' } ) );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
		expect( settings.revertContent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'warns before taking over a physical file and leaves it untouched on cancel', () => {
		// Arrange
		const settings = createSettings( { hasPhysicalFile: true, isEnabled: false } );
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Take over llms.txt' } ) );

		// Assert
		expect( screen.getByRole( 'dialog' ).textContent ).toContain( 'will be replaced' );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		// Assert
		expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		expect( settings.takeOverFile ).not.toHaveBeenCalled();
	} );

	it( 'takes over the physical file after the admin confirms', async () => {
		// Arrange
		const settings = createSettings( { hasPhysicalFile: true, isEnabled: false } );
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Take over llms.txt' } ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Take over' } ) );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
		expect( settings.takeOverFile ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows the saved instructions in a persistent field with a character count and caps its length', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { customText: 'Existing note.' } ) } /> );

		// Assert
		const field = screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } );
		expect( field.value ).toBe( 'Existing note.' );
		expect( field.maxLength ).toBe( MAX_CUSTOM_TEXT_LENGTH );
		expect( screen.getByText( '14/2,000' ) ).toBeTruthy();
	} );

	it( 'enables Save only after the instructions change and keeps the text in the field after saving', async () => {
		// Arrange
		const settings = createSettings();
		render( <LlmsTxtPanel settings={ settings } /> );
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );

		// Assert
		expect( saveButton.disabled ).toBe( true );

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ), { target: { value: 'Our note.' } } );

		// Assert
		expect( saveButton.disabled ).toBe( false );

		// Act
		fireEvent.click( saveButton );

		// Assert
		await waitFor( () => expect( settings.saveCustomText ).toHaveBeenCalledWith( 'Our note.' ) );
		expect( screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ).value ).toBe( 'Our note.' );
	} );

	it( 'shows the error and keeps the typed text when saving fails', async () => {
		// Arrange
		const serverError = 'Could not save.';
		const settings = createSettings( { saveCustomText: jest.fn( () => Promise.reject( serverError ) ) } );
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ), { target: { value: 'Our note.' } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		// Assert
		expect( await screen.findByRole( 'alert' ) ).toHaveProperty( 'textContent', serverError );
		expect( screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ).value ).toBe( 'Our note.' );
	} );

	it( 'disables the instructions field when the file was edited manually and hides it for a physical file', () => {
		// Arrange & Act
		const { rerender } = render( <LlmsTxtPanel settings={ createSettings( { isManuallyEdited: true } ) } /> );

		// Assert
		expect( screen.getByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ).disabled ).toBe( true );

		// Act
		rerender( <LlmsTxtPanel settings={ createSettings( { hasPhysicalFile: true, isEnabled: false } ) } /> );

		// Assert
		expect( screen.queryByRole( 'textbox', { name: CUSTOM_TEXT_FIELD_NAME } ) ).toBeNull();
	} );

	it( 'keeps the dialog open and shows the server error when the take over fails', async () => {
		// Arrange
		const serverError = 'The llms.txt file couldn’t be replaced.';
		const settings = createSettings( { hasPhysicalFile: true, isEnabled: false, takeOverFile: jest.fn( () => Promise.reject( serverError ) ) } );
		render( <LlmsTxtPanel settings={ settings } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Take over llms.txt' } ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Take over' } ) );

		// Assert
		expect( await screen.findByRole( 'alert' ) ).toHaveProperty( 'textContent', serverError );
		expect( screen.getByRole( 'dialog' ) ).toBeTruthy();
	} );
} );
