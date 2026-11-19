import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { fireEvent, screen } from '@testing-library/react';

import { PostListContextProvider } from '../../../../../contexts/post-list-context';
import { type Post } from '../../../../../types';
import ListItemView from '../list-item-view';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn( () => null ),
	__useNavigateToDocument: jest.fn(),
} ) );

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

		const rowButtons = screen.getAllByRole( 'button' );
		fireEvent.click( rowButtons[ 0 ] );

		expect( navigateToDocument ).toHaveBeenCalledWith( pagePost.id );
	} );
} );
