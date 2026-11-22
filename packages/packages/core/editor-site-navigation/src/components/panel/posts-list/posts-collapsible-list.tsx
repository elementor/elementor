import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Skeleton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { postTypesMap } from '../../../api/post';
import { useContentPanelCoordinator } from '../../../contexts/content-panel-coordinator';
import { usePostListContext } from '../../../contexts/post-list-context';
import { useHomepage } from '../../../hooks/use-homepage';
import { usePostListPagination } from '../../../hooks/use-post-list-pagination';
import { usePosts } from '../../../hooks/use-posts';
import SectionAddButton from '../section-add-button';
import CollapsibleList from './collapsible-list';
import ErrorState from './error-state';
import PostListItem from './post-list-item';
import PostListPaginationActions from './post-list-pagination-actions';

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
	isOpenByDefault?: boolean;
};

export default function PostsCollapsibleList( { isOpenByDefault = false }: Props ) {
	const { type, editMode, setEditMode } = usePostListContext();
	const { registerSection, unregisterSection, searchQuery } = useContentPanelCoordinator();
	const [ isOpen, setIsOpen ] = useState( isOpenByDefault );
	const trimmedSearch = searchQuery.trim();
	const [ debouncedSearch, setDebouncedSearch ] = useState( trimmedSearch );
	const listTopRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		const handle = window.setTimeout( () => setDebouncedSearch( trimmedSearch ), SEARCH_DEBOUNCE_MS );

		return () => window.clearTimeout( handle );
	}, [ trimmedSearch ] );

	const {
		data: { posts, total },
		isError: postsError,
		isPending: postsPending,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePosts( type, debouncedSearch );
	const { data: homepageId } = useHomepage();
	const isPageType = type === 'page';

	useEffect( () => {
		registerSection( type, {
			setExpanded: setIsOpen,
			startCreate: () => setEditMode( { mode: 'create', details: {} } ),
		} );

		return () => unregisterSection( type );
	}, [ registerSection, unregisterSection, type, setEditMode ] );

	const filteredPosts = useMemo( () => {
		if ( ! posts ) {
			return [];
		}

		const mappedPosts = isPageType
			? posts.map( ( post ) => ( post.id === homepageId ? { ...post, isHome: true } : post ) )
			: posts;

		const sorted = isPageType
			? [ ...mappedPosts ].sort( ( a, b ) => {
					if ( a.id === homepageId ) {
						return -1;
					}

					if ( b.id === homepageId ) {
						return 1;
					}

					return 0;
			  } )
			: mappedPosts;

		return sorted;
	}, [ posts, isPageType, homepageId ] );

	const pagination = usePostListPagination( {
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		loadedCount: filteredPosts.length,
		resetKey: `${ type }:${ debouncedSearch }`,
		totalCount: total,
	} );

	const displayedPosts = useMemo(
		() => filteredPosts.slice( 0, pagination.visibleCount ),
		[ filteredPosts, pagination.visibleCount ]
	);

	const handleShowLess = () => {
		pagination.handleShowLess();
		listTopRef.current?.scrollIntoView( { block: 'nearest' } );
	};

	useEffect( () => {
		if ( debouncedSearch && filteredPosts.length > 0 ) {
			setIsOpen( true );
		}
	}, [ debouncedSearch, filteredPosts.length ] );

	if ( postsError ) {
		return <ErrorState />;
	}

	if ( postsPending && ! posts?.length ) {
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

	const displayCount = total;
	const sectionTitle = postTypesMap[ type ].labels.plural_name;
	const showNoResults = debouncedSearch && filteredPosts.length === 0;

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
			<Box ref={ listTopRef } />
			{ displayedPosts.map( ( post ) => {
				return <PostListItem key={ post.id } post={ post } />;
			} ) }
			{ [ 'duplicate', 'create' ].includes( editMode.mode ) && <PostListItem /> }
			<PostListPaginationActions
				canLoadMore={ pagination.canLoadMore }
				canShowLess={ pagination.canShowLess }
				isLoadingMore={ isFetchingNextPage }
				onLoadMore={ pagination.handleLoadMore }
				onShowLess={ handleShowLess }
			/>
		</CollapsibleList>
	);
}
