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
import { usePostsBaselineTotal } from '../../../hooks/use-posts-baseline-total';
import { shouldPinHomepageForSiteContentSort } from '../../../site-content-sort';
import {
  hasActiveSiteContentStatusFilters,
  isSiteContentListNarrowed,
  isSiteContentTrashFilterActive,
  serializeSiteContentStatusFilters,
} from '../../../site-content-status-filter';
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
  const { type, editMode, resetEditMode, setEditMode } = usePostListContext();
  const { registerSection, searchQuery, siteContentSort, statusFilters, unregisterSection } =
    useContentPanelCoordinator();
  const [ isOpen, setIsOpen ] = useState( isOpenByDefault );
  const trimmedSearch = searchQuery.trim();
  const [ debouncedSearch, setDebouncedSearch ] = useState( trimmedSearch );
  const focusAfterShowLessRef = useRef( false );
  const listTopRef = useRef< HTMLDivElement | null >( null );
  const loadMoreButtonRef = useRef< HTMLButtonElement | null >( null );
  const sectionHeaderRef = useRef< HTMLDivElement | null >( null );

  useEffect( () => {
    const handle = window.setTimeout(
      () => setDebouncedSearch( trimmedSearch ),
      SEARCH_DEBOUNCE_MS
    );

    return () => window.clearTimeout( handle );
  }, [ trimmedSearch ] );

  const {
    data: { posts, total },
    isError: postsError,
    isPending: postsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts( type, debouncedSearch, statusFilters, siteContentSort );
  const isNarrowed = isSiteContentListNarrowed( statusFilters, debouncedSearch );
  const isTrashFilter = isSiteContentTrashFilterActive( statusFilters );
  const baselineStatus = isTrashFilter ? 'trash' : 'any';
  const { data: baselineTotal } = usePostsBaselineTotal( type, isNarrowed, baselineStatus );
  const { data: homepageId } = useHomepage();
  const isPageType = type === 'page';
  const statusFiltersKey = serializeSiteContentStatusFilters( statusFilters );

  useEffect( () => {
    if ( isTrashFilter ) {
      resetEditMode();
    }
  }, [ isTrashFilter, resetEditMode ] );

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

    const shouldPinHomepage = isPageType && shouldPinHomepageForSiteContentSort( siteContentSort );

    const sorted = shouldPinHomepage
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
  }, [ homepageId, isPageType, posts, siteContentSort ] );

  const pagination = usePostListPagination( {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loadedCount: filteredPosts.length,
    resetKey: `${ type }:${ debouncedSearch }:${ statusFiltersKey }:${ siteContentSort }`,
    totalCount: total,
  } );

  const displayedPosts = useMemo(
    () => filteredPosts.slice( 0, pagination.visibleCount ),
    [ filteredPosts, pagination.visibleCount ]
  );

  const handleShowLess = () => {
    focusAfterShowLessRef.current = true;
    pagination.handleShowLess();

    const listTop = listTopRef.current;

    if ( listTop && typeof listTop.scrollIntoView === 'function' ) {
      listTop.scrollIntoView( { block: 'nearest' } );
    }
  };

  useEffect( () => {
    if ( ! focusAfterShowLessRef.current ) {
      return;
    }

    focusAfterShowLessRef.current = false;

    const loadMoreButton = loadMoreButtonRef.current;

    if ( loadMoreButton ) {
      loadMoreButton.focus();
      return;
    }

    sectionHeaderRef.current?.focus();
  }, [ pagination.canLoadMore, pagination.visibleCount ] );

  useEffect( () => {
    if (
      ( debouncedSearch || hasActiveSiteContentStatusFilters( statusFilters ) ) &&
      filteredPosts.length > 0
    ) {
      setIsOpen( true );
    }
  }, [ debouncedSearch, filteredPosts.length, statusFilters ] );

  if ( postsError ) {
    return <ErrorState />;
  }

  if ( postsPending && ! posts?.length ) {
    return (
      <Box sx={ { px: 2 } }>
        <Box>
          <Skeleton
            sx={ { my: 3 } }
            animation="wave"
            variant="rounded"
            width="100%"
            height="24px"
          />
          <Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
          <Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
          <Skeleton sx={ { my: 3 } } animation="wave" variant="rounded" width="70%" height="24px" />
        </Box>
      </Box>
    );
  }

  const displayCount = total;
  const sectionTitle = postTypesMap[ type ].labels.plural_name;
  const showNoResults =
    ( debouncedSearch || hasActiveSiteContentStatusFilters( statusFilters ) ) &&
    filteredPosts.length === 0;
  const countChipLabel =
    isNarrowed && baselineTotal !== undefined ? `${ total } / ${ baselineTotal }` : undefined;

  return (
    <CollapsibleList
      count={ displayCount }
      countChipLabel={ countChipLabel }
      headerRef={ sectionHeaderRef }
      isOpen={ isOpen }
      onOpenChange={ setIsOpen }
      title={ sectionTitle }
      trailingActions={
        isTrashFilter ? null : <SectionAddButton onBeforeCreate={ () => setIsOpen( true ) } />
      }
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
      { ! isTrashFilter && [ 'duplicate', 'create' ].includes( editMode.mode ) && <PostListItem /> }
      <PostListPaginationActions
        canLoadMore={ pagination.canLoadMore }
        canShowLess={ pagination.canShowLess }
        isLoadingMore={ isFetchingNextPage }
        loadMoreButtonRef={ loadMoreButtonRef }
        onLoadMore={ pagination.handleLoadMore }
        onShowLess={ handleShowLess }
      />
    </CollapsibleList>
  );
}
