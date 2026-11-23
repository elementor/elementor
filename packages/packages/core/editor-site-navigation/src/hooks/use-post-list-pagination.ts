import { useCallback, useEffect, useRef, useState } from 'react';

import { POST_PER_PAGE } from '../api/post';

type UsePostListPaginationArgs = {
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	loadedCount: number;
	resetKey: string;
	totalCount: number;
};

export function usePostListPagination( {
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	loadedCount,
	resetKey,
	totalCount,
}: UsePostListPaginationArgs ) {
	const [ visibleCount, setVisibleCount ] = useState( POST_PER_PAGE );
	const pendingVisibleTargetRef = useRef< number | null >( null );

	useEffect( () => {
		setVisibleCount( POST_PER_PAGE );
		pendingVisibleTargetRef.current = null;
	}, [ resetKey ] );

	useEffect( () => {
		const target = pendingVisibleTargetRef.current;

		if ( target === null ) {
			return;
		}

		if ( loadedCount >= target ) {
			setVisibleCount( target );
			pendingVisibleTargetRef.current = null;
			return;
		}

		if ( ! isFetchingNextPage ) {
			setVisibleCount( Math.min( target, loadedCount ) );
			pendingVisibleTargetRef.current = null;
		}
	}, [ isFetchingNextPage, loadedCount ] );

	const canShowLess = visibleCount > POST_PER_PAGE;
	const canLoadMore = visibleCount < loadedCount || hasNextPage;

	const handleLoadMore = useCallback( () => {
		if ( isFetchingNextPage || ! canLoadMore ) {
			return;
		}

		const targetVisible = Math.min( visibleCount + POST_PER_PAGE, totalCount );

		if ( targetVisible <= loadedCount ) {
			setVisibleCount( Math.min( targetVisible, loadedCount ) );
			return;
		}

		if ( hasNextPage ) {
			pendingVisibleTargetRef.current = targetVisible;
			fetchNextPage();
			return;
		}

		if ( visibleCount < loadedCount ) {
			setVisibleCount( Math.min( visibleCount + POST_PER_PAGE, loadedCount ) );
		}
	}, [ canLoadMore, fetchNextPage, hasNextPage, isFetchingNextPage, loadedCount, totalCount, visibleCount ] );

	const handleShowLess = useCallback( () => {
		pendingVisibleTargetRef.current = null;
		setVisibleCount( POST_PER_PAGE );
	}, [] );

	return {
		canLoadMore,
		canShowLess,
		handleLoadMore,
		handleShowLess,
		visibleCount,
	};
}
