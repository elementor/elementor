import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Skeleton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { postTypesMap } from '../../../api/post';
import { useContentPanelCoordinator } from '../../../contexts/content-panel-coordinator';
import { usePostListContext } from '../../../contexts/post-list-context';
import { useHomepage } from '../../../hooks/use-homepage';
import { usePosts } from '../../../hooks/use-posts';
import { postTitleMatchesSearch } from '../../../utils/post-title-plain';
import SectionAddButton from '../section-add-button';
import CollapsibleList from './collapsible-list';
import ErrorState from './error-state';
import PostListItem from './post-list-item';

type Props = {
	isOpenByDefault?: boolean;
};

export default function PostsCollapsibleList( { isOpenByDefault = false }: Props ) {
	const { type, editMode, setEditMode } = usePostListContext();
	const { registerSection, unregisterSection, searchQuery } = useContentPanelCoordinator();
	const [ isOpen, setIsOpen ] = useState( isOpenByDefault );
	const {
		data: { posts, total },
		isLoading: postsLoading,
		isError: postsError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePosts( type );
	const { data: homepageId } = useHomepage();
	const isPageType = type === 'page';
	const trimmedSearch = searchQuery.trim();

	useEffect( () => {
		registerSection( type, {
			setExpanded: setIsOpen,
			startCreate: () => setEditMode( { mode: 'create', details: {} } ),
		} );

		return () => unregisterSection( type );
	}, [ registerSection, unregisterSection, type, setEditMode ] );

	const { filteredPosts } = useMemo( () => {
		if ( ! posts ) {
			return { sortedPosts: [], filteredPosts: [] };
		}

		const mappedPosts = isPageType
			? posts.map( ( post ) => ( post.id === homepageId ? { ...post, isHome: true } : post ) )
			: posts;

		const sorted = isPageType
			? mappedPosts.sort( ( a, b ) => {
					if ( a.id === homepageId ) {
						return -1;
					}

					if ( b.id === homepageId ) {
						return 1;
					}

					return 0;
			  } )
			: mappedPosts;

		const filtered = sorted.filter( ( post ) => postTitleMatchesSearch( post.title.rendered, searchQuery ) );

		return { filteredPosts: filtered };
	}, [ posts, isPageType, homepageId, searchQuery ] );

	useEffect( () => {
		if ( trimmedSearch && filteredPosts.length > 0 ) {
			setIsOpen( true );
		}
	}, [ trimmedSearch, filteredPosts.length ] );

	if ( postsError ) {
		return <ErrorState />;
	}

	if ( ! posts || postsLoading ) {
		return (
			<Box sx={ { px: 2 } }>
				<Box>
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="100%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
					<Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
				</Box>
			</Box>
		);
	}

	const displayCount = trimmedSearch ? filteredPosts.length : total;
	const sectionTitle = postTypesMap[ type ].labels.plural_name;
	const showNoResults = trimmedSearch && filteredPosts.length === 0;

	return (
		<CollapsibleList
			count={ displayCount }
			isOpen={ isOpen }
			onOpenChange={ setIsOpen }
			title={ sectionTitle }
			trailingActions={ <SectionAddButton onBeforeCreate={ () => setIsOpen( true ) } /> }
		>
			{ showNoResults && (
				<Box sx={ { py: 2, px: 2 } }>
					<Typography variant="body2" color="text.secondary">
						{ __( 'No results found', 'elementor' ) }
					</Typography>
				</Box>
			) }
			{ filteredPosts.map( ( post ) => {
				return <PostListItem key={ post.id } post={ post } />;
			} ) }
			{ [ 'duplicate', 'create' ].includes( editMode.mode ) && <PostListItem /> }
			{ hasNextPage && ! trimmedSearch && (
				<Box
					sx={ {
						display: 'flex',
						justifyContent: 'center',
					} }
				>
					<Button onClick={ fetchNextPage } color="secondary">
						{ isFetchingNextPage ? <CircularProgress /> : __( 'Load more', 'elementor' ) }
					</Button>
				</Box>
			) }
		</CollapsibleList>
	);
}
