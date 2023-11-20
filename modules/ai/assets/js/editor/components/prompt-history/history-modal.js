import { Box, LinearProgress } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import usePromptHistory from '../../hooks/use-prompt-history';
import PromptHistoryModalHeader from './parts/modal-header';
import { useEffect, useRef } from 'react';
import useDeletePromptHistoryItem from '../../hooks/use-delete-prompt-history-item';
import PromptErrorMessage from '../prompt-error-message';
import {
	renderPeriods,
} from './helpers/history-period-helpers';
import PromptHistoryEmpty from './parts/modal-empty';
import InfiniteScroll from 'react-infinite-scroller';
import PromptHistoryUpgrade from './parts/modal-upgrade';
import { usePromptHistoryContext } from './context/prompt-history-context';
import ModalContainer from './parts/modal-container';

const ITEMS_LIMIT = 10;
const FREE_PLAN_ERRORS = [ 'invalid_connect_data', 'no_subscription' ];

const PromptHistoryModal = ( props ) => {
	const lastRun = useRef( () => {} );
	const scrollContainer = useRef( null );

	const { historyType, onClose } = usePromptHistoryContext();

	const {
		items,
		meta,
		isLoading: isHistoryFetchingInProgress,
		error: historyFetchingError,
		fetchData,
		deleteItemById: deleteItemFromState,
	} = usePromptHistory( historyType );

	const {
		isLoading: isDeletingInProgress,
		error: historyDeletingError,
		deleteItem,
	} = useDeletePromptHistoryItem();

	const error = historyFetchingError || historyDeletingError;
	const isLoading = isHistoryFetchingInProgress || isDeletingInProgress;
	const isLastPage = meta && meta?.currentPage === meta?.totalPages;
	const showUpgrade = items?.length > 0 && meta?.allowedDays < 90 && isLastPage;

	useEffect( () => {
		lastRun.current = async () => fetchData( { page: 1, limit: ITEMS_LIMIT } );

		lastRun.current();
	}, [] );

	const loadNext = () => {
		if ( isLoading || isLastPage ) {
			return;
		}

		lastRun.current = async () => fetchData( { page: meta.currentPage + 1, limit: ITEMS_LIMIT } );

		lastRun.current();
	};

	const onHistoryItemDelete = async ( id ) => {
		lastRun.current = async () => await deleteItem( id );

		await lastRun.current();

		if ( ! historyDeletingError ) {
			deleteItemFromState( id );
		}
	};

	return (
		<ModalContainer { ...props }>
			<PromptHistoryModalHeader onClose={ onClose } />

			{ error && ! FREE_PLAN_ERRORS.includes( error ) && <PromptErrorMessage error={ error }
				onRetry={ lastRun.current }
				sx={ {
					position: 'absolute',
					zIndex: 1,
					marginTop: isLoading ? 0.5 : 'revert',
				} } /> }

			{ isLoading && <LinearProgress
				role="progressbar"
				aria-label={ __( 'Loading', 'elementor' ) }
				color="secondary" /> }

			<Box sx={ { overflowY: 'scroll', height: '85%' } } ref={ scrollContainer }>
				{ error && FREE_PLAN_ERRORS.includes( error ) && <PromptHistoryUpgrade variant="full" historyType={ historyType } /> }

				{ ! error && 0 === items?.length && <PromptHistoryEmpty historyType={ historyType } /> }

				{ items?.length > 0 && <InfiniteScroll loadMore={ loadNext }
					getScrollParent={ () => scrollContainer.current }
					useWindow={ false }
					isReverse={ false }
					threshold={ 30 }
					initialLoad={ false }
					hasMore={ ! isLastPage }>
					{ renderPeriods( { items, onDelete: onHistoryItemDelete } ) }
				</InfiniteScroll>
				}

				{ showUpgrade && <PromptHistoryUpgrade variant="small" historyType={ historyType } /> }
			</Box>
		</ModalContainer>
	);
};

export default PromptHistoryModal;
