import * as React from 'react';
import { List, Skeleton, Stack } from '@elementor/ui';

import { type Slug } from '../../api/post';
import { PostListContextProvider } from '../../contexts/post-list-context';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';
import UserLoadError from './user-load-error';

type ShellPanelBodyContentProps = {
	accessiblePostTypes: Slug[];
	isUserPending: boolean;
	onListError: () => void;
	showUserLoadError: boolean;
};

export default function ShellPanelBodyContent( {
	accessiblePostTypes,
	isUserPending,
	onListError,
	showUserLoadError,
}: ShellPanelBodyContentProps ) {
	if ( isUserPending ) {
		return (
			<Stack spacing={ 1 } sx={ { px: 2, py: 1 } }>
				<Skeleton animation="wave" height={ 28 } variant="rounded" width="100%" />
				<Skeleton animation="wave" height={ 28 } variant="rounded" width="80%" />
			</Stack>
		);
	}

	if ( showUserLoadError ) {
		return <UserLoadError />;
	}

	return (
		<List dense disablePadding sx={ { py: 0, width: '100%' } }>
			{ accessiblePostTypes.map( ( postTypeSlug, index ) => (
				<PostListContextProvider key={ postTypeSlug } type={ postTypeSlug } setError={ onListError }>
					<PostsCollapsibleList isOpenByDefault={ index === 0 } />
				</PostListContextProvider>
			) ) }
		</List>
	);
}
