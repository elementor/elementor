/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { fetchMarkdownPreview, revertMarkdownContent, saveMarkdownContent } from 'elementor/modules/agents/assets/js/admin/api';
import { MarkdownContentPanel } from 'elementor/modules/agents/assets/js/admin/components/markdown-content/markdown-content-panel';

const PAGE = { id: 7, title: 'About', path: '/about/', type: 'page' };
const GENERATED_CONTENT = '# About generated';
const EDITED_CONTENT = '# About edited';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%[sd]/, arg ), format ),
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	fetchMarkdownPreview: jest.fn(),
	revertMarkdownContent: jest.fn(),
	saveMarkdownContent: jest.fn(),
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/hooks/use-markdown-items', () => ( {
	useMarkdownItems: () => ( { items: [ PAGE ], isLoading: false } ),
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/components/post-type-list', () => ( {
	PostTypeList: () => <div />,
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/components/markdown-content/markdown-preview-pane', () => ( {
	MarkdownPreviewPane: ( { content, onEdit, onExpand } ) => (
		<div>
			<pre data-testid="preview">{ content }</pre>
			<button type="button" onClick={ onEdit }>Edit</button>
			<button type="button" onClick={ onExpand }>Full screen</button>
		</div>
	),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AlertCircleIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div role="alert">{ children }</div> );
jest.mock( '@elementor/ui/Dialog', () => ( { children } ) => <div role="dialog">{ children }</div> );
jest.mock( '@elementor/ui/DialogActions', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogContent', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogHeader', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogTitle', () => ( { children } ) => <h2>{ children }</h2> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick, disabled } ) => (
	<button type="button" onClick={ onClick } disabled={ disabled }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span data-testid="chip">{ label }</span> );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/TextField', () => ( { value, onChange, inputProps } ) => (
	<textarea value={ value } onChange={ onChange } aria-label={ inputProps?.[ 'aria-label' ] } />
) );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );

const createSettings = () => ( {
	isEnabled: true,
	isSaving: false,
	postTypes: [ { name: 'page', label: 'Pages', count: 1, included: true } ],
	togglePostType: jest.fn(),
} );

describe( 'MarkdownContentPanel', () => {
	beforeEach( () => {
		fetchMarkdownPreview.mockReset();
		saveMarkdownContent.mockReset().mockResolvedValue();
		revertMarkdownContent.mockReset().mockResolvedValue();
	} );

	it( 'shows no override warning or revert action for generated markdown', async () => {
		// Arrange
		fetchMarkdownPreview.mockResolvedValue( { content: GENERATED_CONTENT, isOverridden: false } );

		// Act
		render( <MarkdownContentPanel settings={ createSettings() } /> );

		// Assert
		await waitFor( () => expect( screen.getByTestId( 'preview' ).textContent ).toBe( GENERATED_CONTENT ) );
		expect( screen.queryByTestId( 'chip' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Revert to generated version' } ) ).toBeNull();
	} );

	it( 'shows the override warning and revert action when the page was edited manually', async () => {
		// Arrange
		fetchMarkdownPreview.mockResolvedValue( { content: EDITED_CONTENT, isOverridden: true } );

		// Act
		render( <MarkdownContentPanel settings={ createSettings() } /> );

		// Assert
		expect( await screen.findByTestId( 'chip' ) ).toHaveProperty( 'textContent', 'This page was edited manually and no longer syncs automatically.' );
		expect( screen.getByRole( 'button', { name: 'Revert to generated version' } ) ).toBeTruthy();
	} );

	it( 'opens the editor with the loaded markdown and saves the draft for the selected page', async () => {
		// Arrange
		fetchMarkdownPreview
			.mockResolvedValueOnce( { content: GENERATED_CONTENT, isOverridden: false } )
			.mockResolvedValue( { content: EDITED_CONTENT, isOverridden: true } );
		render( <MarkdownContentPanel settings={ createSettings() } /> );
		await waitFor( () => expect( screen.getByTestId( 'preview' ).textContent ).toBe( GENERATED_CONTENT ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit' } ) );
		const editor = screen.getByRole( 'textbox', { name: 'about.md' } );

		// Assert
		expect( editor.value ).toBe( GENERATED_CONTENT );

		// Act
		fireEvent.change( editor, { target: { value: EDITED_CONTENT } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
		expect( saveMarkdownContent ).toHaveBeenCalledWith( PAGE.id, EDITED_CONTENT );
		await waitFor( () => expect( screen.getByTestId( 'preview' ).textContent ).toBe( EDITED_CONTENT ) );
		expect( screen.getByTestId( 'chip' ) ).toBeTruthy();
	} );

	it( 'reverts only after the admin confirms and then shows the generated markdown again', async () => {
		// Arrange
		fetchMarkdownPreview
			.mockResolvedValueOnce( { content: EDITED_CONTENT, isOverridden: true } )
			.mockResolvedValue( { content: GENERATED_CONTENT, isOverridden: false } );
		render( <MarkdownContentPanel settings={ createSettings() } /> );

		// Act
		fireEvent.click( await screen.findByRole( 'button', { name: 'Revert to generated version' } ) );

		// Assert
		expect( revertMarkdownContent ).not.toHaveBeenCalled();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Revert' } ) );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );
		expect( revertMarkdownContent ).toHaveBeenCalledWith( PAGE.id );
		await waitFor( () => expect( screen.queryByTestId( 'chip' ) ).toBeNull() );
		expect( screen.getByTestId( 'preview' ).textContent ).toBe( GENERATED_CONTENT );
	} );

	it( 'keeps the editor open and shows the server error when saving fails', async () => {
		// Arrange
		const serverError = 'The markdown content cannot be empty.';
		fetchMarkdownPreview.mockResolvedValue( { content: GENERATED_CONTENT, isOverridden: false } );
		saveMarkdownContent.mockRejectedValue( serverError );
		render( <MarkdownContentPanel settings={ createSettings() } /> );
		await waitFor( () => expect( screen.getByTestId( 'preview' ).textContent ).toBe( GENERATED_CONTENT ) );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit' } ) );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'about.md' } ), { target: { value: 'x' } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		// Assert
		expect( await screen.findByRole( 'alert' ) ).toHaveProperty( 'textContent', serverError );
		expect( screen.getByRole( 'dialog' ) ).toBeTruthy();
	} );
} );
