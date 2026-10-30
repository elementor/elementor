/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LlmsTxtPanel } from 'elementor/modules/agents/assets/js/admin/components/llms-txt/llms-txt-panel';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%[sd]/, arg ), format ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AlertCircleIcon: () => <span />,
	ArchiveTemplateIcon: () => <span />,
	ArrowsDiagonalIcon: () => <span />,
	ChevronDownIcon: () => <span />,
	ChevronUpIcon: () => <span />,
	FileIcon: () => <span />,
	PencilIcon: () => <span />,
	PinIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div role="alert">{ children }</div> );
jest.mock( '@elementor/ui/Dialog', () => ( { children } ) => <div role="dialog">{ children }</div> );
jest.mock( '@elementor/ui/DialogActions', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogContent', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogHeader', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogTitle', () => ( { children } ) => <h2>{ children }</h2> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick } ) => (
	<button type="button" onClick={ onClick }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span data-testid="chip">{ label }</span> );
jest.mock( '@elementor/ui/Collapse', () => ( { children, in: isOpen } ) => ( isOpen ? <div>{ children }</div> : null ) );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/IconButton', () => ( { children, onClick, 'aria-label': ariaLabel } ) => (
	<button type="button" onClick={ onClick } aria-label={ ariaLabel }>{ children }</button>
) );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Switch', () => ( { checked, disabled, onChange, inputProps } ) => (
	<input type="checkbox" role="switch" aria-label={ inputProps?.[ 'aria-label' ] } checked={ checked } disabled={ disabled } onChange={ onChange } />
) );
jest.mock( '@elementor/ui/Tooltip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );

const createPostTypes = ( total ) => Array.from( { length: total }, ( _, index ) => ( {
	name: `type-${ index }`,
	label: `Type ${ index }`,
	count: index,
	included: true,
} ) );

const createSettings = ( overrides = {} ) => ( {
	content: '# Site',
	hasPhysicalFile: false,
	isEnabled: true,
	isManuallyEdited: false,
	postTypes: createPostTypes( 2 ),
	revertContent: jest.fn( () => Promise.resolve() ),
	saveContent: jest.fn( () => Promise.resolve() ),
	takeOverFile: jest.fn( () => Promise.resolve() ),
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

	it( 'keeps rows checked but disabled and shows the warning when the file was edited manually', () => {
		// Arrange & Act
		render( <LlmsTxtPanel settings={ createSettings( { isManuallyEdited: true } ) } /> );

		// Assert
		screen.getAllByRole( 'switch' ).forEach( ( row ) => {
			expect( row.checked ).toBe( true );
			expect( row.disabled ).toBe( true );
		} );
		expect( screen.getByTestId( 'chip' ).textContent ).toBe( 'This file was edited manually and no longer syncs automatically.' );
		expect( screen.getByRole( 'button', { name: 'Edit' } ) ).toBeTruthy();
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
		fireEvent.click( screen.getByRole( 'button', { name: 'Revert to generated version' } ) );

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
