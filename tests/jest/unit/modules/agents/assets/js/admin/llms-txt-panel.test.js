/* eslint-disable react/prop-types */
import { fireEvent, render, screen } from '@testing-library/react';

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
	saveContent: jest.fn( () => Promise.resolve() ),
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
		expect( screen.getByTestId( 'chip' ).textContent ).toBe( 'LLMs.txt file already exists and can’t be managed here.' );
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
} );
