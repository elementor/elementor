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

		if ( target === null || loadedCount < target ) {
			return;
		}

		setVisibleCount( target );
		pendingVisibleTargetRef.current = null;
	}, [ loadedCount ] );

	const canShowLess = visibleCount > POST_PER_PAGE;
	const canLoadMore = visibleCount < totalCount;

	const handleLoadMore = useCallback( () => {
		if ( isFetchingNextPage || visibleCount >= totalCount ) {
			return;
		}

		const targetVisible = Math.min( visibleCount + POST_PER_PAGE, totalCount );

		if ( targetVisible <= loadedCount ) {
			setVisibleCount( targetVisible );
			return;
		}

		if ( hasNextPage ) {
			pendingVisibleTargetRef.current = targetVisible;
			fetchNextPage();
		}
	}, [
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		loadedCount,
		totalCount,
		visibleCount,
	] );

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