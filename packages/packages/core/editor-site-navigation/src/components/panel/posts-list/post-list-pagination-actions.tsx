import * as React from 'react';
import { CollapseIcon } from '@elementor/editor-ui';
import { Box, Button, CircularProgress, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const listPaginationButtonProps = {
	color: 'secondary' as const,
	size: 'small' as const,
	variant: 'outlined' as const,
};

type PostListPaginationActionsProps = {
	canLoadMore: boolean;
	canShowLess: boolean;
	isLoadingMore: boolean;
	onLoadMore: () => void;
	onShowLess: () => void;
};

export default function PostListPaginationActions( {
	canLoadMore,
	canShowLess,
	isLoadingMore,
	onLoadMore,
	onShowLess,
}: PostListPaginationActionsProps ) {
	if ( ! canLoadMore && ! canShowLess ) {
		return null;
	}

	const loadMoreLabel = __( 'Load more', 'elementor' );
	const showLessLabel = __( 'Show less', 'elementor' );

	const loadMoreButton = (
		<Button
			{ ...listPaginationButtonProps }
			aria-label={ loadMoreLabel }
			disabled={ isLoadingMore }
			endIcon={ isLoadingMore ? undefined : <CollapseIcon open={ false } /> }
			fullWidth
			onClick={ onLoadMore }
			sx={ { flex: 1, my: 0.5 } }
		>
			{ isLoadingMore ? <CircularProgress size={ 20 } /> : loadMoreLabel }
		</Button>
	);

	const showLessButton = (
		<Button
			{ ...listPaginationButtonProps }
			aria-label={ showLessLabel }
			endIcon={ <CollapseIcon open /> }
			fullWidth
			onClick={ onShowLess }
			sx={ { flex: 1, my: 0.5 } }
		>
			{ showLessLabel }
		</Button>
	);

	if ( canShowLess && canLoadMore ) {
		return (
			<Box sx={ { px: 2, width: '100%' } }>
				<Stack direction="row" spacing={ 1 }>
					{ showLessButton }
					{ loadMoreButton }
				</Stack>
			</Box>
		);
	}

	return <Box sx={ { px: 2, width: '100%' } }>{ canShowLess ? showLessButton : loadMoreButton }</Box>;
}
