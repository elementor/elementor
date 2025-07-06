import * as React from 'react';
import { PageTypeIcon } from '@elementor/icons';
import { Box, Button, CircularProgress, List, Skeleton } from '@elementor/ui';

import { postTypesMap } from '../../../api/post';
import { usePostListContext } from '../../../contexts/post-list-context';
import { useHomepage } from '../../../hooks/use-homepage';
import { usePosts } from '../../../hooks/use-posts';
import AddNewButton from '../add-new-button';
import CollapsibleList from './collapsible-list';
import ErrorState from './error-state';
import PostListItem from './post-list-item';

type Props = {
	isOpenByDefault?: boolean;
};

export default function PostsCollapsibleList( { isOpenByDefault = false }: Props ) {
	const { type, editMode } = usePostListContext();
	const {
		data: { posts, total },
		isLoading: postsLoading,
		isError: postsError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePosts( type );
	const { data: homepageId } = useHomepage();

	if ( postsError ) {
		return <ErrorState />;
	}

	if ( ! posts || postsLoading ) {
		return (
			<Box sx={ { px: 5 } }>
				<Box display="flex" justifyContent="flex-end" alignItems="center">
					<Skeleton sx={ { my: 4 } } animation="wave" variant="rounded" width="110px" height="28px" />
				</Box>
				<Box>
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="100%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
				</Box>
			</Box>
		);
	}

	const label = `${ postTypesMap[ type ].labels.plural_name } (${ total.toString() })`;

	const mappedPosts = posts.map( ( post ) => {
		if ( post.id === homepageId ) {
			return { ...post, isHome: true };
		}

		return post;
	} );

	const sortedPosts = mappedPosts.sort( ( a, b ) => {
		if ( a.id === homepageId ) {
			return -1;
		}

		if ( b.id === homepageId ) {
			return 1;
		}

		return 0;
	} );

	return (
		<>
			<Box
				display="flex"
				justifyContent="flex-end"
				alignItems="center"
				sx={ {
					py: 1,
					px: 2,
				} }
			>
				<AddNewButton />
			</Box>
			<List dense>
				<CollapsibleList label={ label } Icon={ PageTypeIcon } isOpenByDefault={ isOpenByDefault || false }>
					{ sortedPosts.map( ( post ) => {
						return <PostListItem key={ post.id } post={ post } />;
					} ) }
					{ [ 'duplicate', 'create' ].includes( editMode.mode ) && <PostListItem /> }
					{ hasNextPage && (
						<Box
							sx={ {
								display: 'flex',
								justifyContent: 'center',
							} }
						>
							<Button onClick={ fetchNextPage } color="secondary">
								{ isFetchingNextPage ? <CircularProgress /> : 'Load More' }
							</Button>
						</Box>
					) }
				</CollapsibleList>
			</List>
		</>
	);
}
