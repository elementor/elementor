import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { fireEvent, screen } from '@testing-library/react';

import { PostListContextProvider } from '../../../../../contexts/post-list-context';
import { type Post } from '../../../../../types';
import ListItemView from '../list-item-view';
import {
	injectIntoSiteContentListItemActions,
	type SiteContentListItemActionsProps,
} from '../site-content-list-item-actions-location';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn( () => null ),
	__useNavigateToDocument: jest.fn(),
} ) );

const AngieMarker = () => <button type="button">Angie marker</button>;

const pagePost: Post = {
	id: 1,
	title: { rendered: 'Test Page' },
	status: 'publish',
	type: 'page',
	link: 'https://example.local/test-page',
	user_can: { edit: true, delete: true },
};

const postPost: Post = {
	...pagePost,
	id: 2,
	type: 'post',
	title: { rendered: 'Test Post' },
};

const readOnlyPost: Post = {
	...pagePost,
	id: 3,
	user_can: { edit: false, delete: false },
};

describe( 'ListItemView', () => {
	afterEach( () => {
		const { __useActiveDocument } = jest.requireMock( '@elementor/editor-documents' );
		__useActiveDocument.mockReturnValue( null );
		jest.clearAllMocks();
	} );

	it( 'passes the live active document title into the list item action slot', () => {
		const { __useActiveDocument } = jest.requireMock( '@elementor/editor-documents' );
		__useActiveDocument.mockReturnValue( {
			id: pagePost.id,
			status: { value: 'publish' },
			title: 'Renamed in editor',
		} );

		const TitleProbe = ( { title }: SiteContentListItemActionsProps ) => (
			<button aria-label={ `Slot title ${ title }` } type="button" />
		);

		injectIntoSiteContentListItemActions( { id: 'title-probe', component: TitleProbe } );

		renderWithQuery(
			<PostListContextProvider type="page" setError={ () => {} }>
				<ListItemView post={ pagePost } />
			</PostListContextProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Slot title Renamed in editor' } ) ).toBeInTheDocument();
	} );

	it( 'renders list item action slot only for the active editable row', () => {
		const { __useActiveDocument } = jest.requireMock( '@elementor/editor-documents' );
		__useActiveDocument.mockReturnValue( { id: pagePost.id, status: { value: 'publish' }, title: 'Test Page' } );

		injectIntoSiteContentListItemActions( { id: 'test-angie', component: AngieMarker } );

		renderWithQuery(
			<PostListContextProvider type="page" setError={ () => {} }>
				<>
					<ListItemView post={ pagePost } />
					<ListItemView post={ { ...pagePost, id: 99, title: { rendered: 'Other' } } } />
				</>
			</PostListContextProvider>
		);

		expect( screen.getAllByRole( 'button', { name: 'Angie marker' } ) ).toHaveLength( 1 );
	} );

	it( 'omits Set as homepage for post type', () => {
		renderWithQuery(
			<PostListContextProvider type="post" setError={ () => {} }>
				<ListItemView post={ postPost } />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		expect( screen.queryByRole( 'menuitem', { name: 'Set as homepage' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'View Post' } ) ).toBeInTheDocument();
	} );

	it( 'opens actions menu when user cannot edit the row', () => {
		renderWithQuery(
			<PostListContextProvider type="page" setError={ () => {} }>
				<ListItemView post={ readOnlyPost } />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		expect( screen.getByRole( 'menuitem', { name: 'View Page' } ) ).toBeInTheDocument();
	} );

	it( 'navigates when the row is editable', () => {
		const navigateToDocument = jest.fn();
		jest.mocked( useNavigateToDocument ).mockReturnValue( navigateToDocument );

		renderWithQuery(
			<PostListContextProvider type="page" setError={ () => {} }>
				<ListItemView post={ pagePost } />
			</PostListContextProvider>
		);

		fireEvent.click( screen.getByText( 'Test Page' ) );

		expect( navigateToDocument ).toHaveBeenCalledWith( pagePost.id );
	} );
} );
