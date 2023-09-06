import { Backdrop, Box, LinearProgress, Modal, Slide, styled } from '@elementor/ui';
import usePromptHistory from '../../hooks/use-prompt-history';
import PromptHistoryModalHeader from './parts/modal-header';
import PromptHistoryPeriod from './parts/modal-period';
import { PromptHistoryContext } from './index';
import { useContext, useEffect, useRef } from 'react';
import useDeletePromptHistoryItem from '../../hooks/use-delete-prompt-history-item';
import PromptErrorMessage from '../prompt-error-message';
import { groupPromptHistoryData, LAST_30_DAYS_KEY, LAST_7_DAYS_KEY } from './helpers/history-period-helpers';
import PromptHistoryEmpty from './parts/modal-empty';
import InfiniteScroll from 'react-infinite-scroller';
import PromptHistoryUpgrade from './parts/modal-upgrade';
import { HISTORY_TYPES } from './history-types';

const StyledContent = styled( Box )`
	width: 360px;
	position: relative;
	margin-top: ${ ( { theme } ) => theme.spacing( 5 ) };
	margin-right: ${ ( { theme } ) => theme.spacing( 5 ) };
	background-color: ${ ( { theme } ) => theme.palette.background.paper };
	border-radius: ${ ( { theme } ) => theme.border.radius.sm };
	height: ${ ( { fullHeight } ) => fullHeight ? '86vh' : '52vh' };

	@media screen and (max-width: 456px) {
		width: 320px;
	}

  @media screen and (max-width: 420px) {
		width: 230px;
  }
`;

const ITEMS_LIMIT = 10;
const NO_HISTORY_ACCESS_ERROR = 'invalid_connect_data';

const PromptHistoryModal = ( { ...props } ) => {
	const lastRun = useRef( () => {} );
	const scrollContainer = useRef( null );
	const { onModalClose, promptType } = useContext( PromptHistoryContext );

	const {
		items,
		meta,
		isLoading: isHistoryFetchingInProgress,
		error: historyFetchingError,
		send: fetchData,
		deleteItemById,
	} = usePromptHistory( promptType );

	const {
		isLoading: isDeletingInProgress,
		error: historyDeletingError,
		send: deleteItem,
	} = useDeletePromptHistoryItem();

	const error = historyFetchingError || historyDeletingError;
	const isLoading = isHistoryFetchingInProgress || isDeletingInProgress;
	const isLastPage = meta && meta?.currentPage === meta?.totalPages;

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
			deleteItemById( id );
		}
	};

	const renderPeriods = () => {
		const groupData = groupPromptHistoryData( items );
		const periods = [];

		if ( groupData[ LAST_7_DAYS_KEY ]?.items?.length ) {
			periods.push( <PromptHistoryPeriod periodTitle={ groupData[ LAST_7_DAYS_KEY ].label }
				onHistoryItemDelete={ onHistoryItemDelete }
				historyItems={ groupData[ LAST_7_DAYS_KEY ].items } /> );
		}

		if ( groupData[ LAST_30_DAYS_KEY ]?.items?.length ) {
			periods.push( <PromptHistoryPeriod periodTitle={ groupData[ LAST_30_DAYS_KEY ].label }
				onHistoryItemDelete={ onHistoryItemDelete }
				historyItems={ groupData[ LAST_30_DAYS_KEY ].items } /> );
		}

		for ( let i = 11; i >= 0; i-- ) {
			if ( groupData[ i ] ) {
				periods.push( <PromptHistoryPeriod periodTitle={ groupData[ i ].label }
					onHistoryItemDelete={ onHistoryItemDelete }
					historyItems={ groupData[ i ].items } /> );
			}
		}

		return periods;
	};

	return (
		<Modal
			container={ () => document.querySelector( '.MuiDialogContent-root:not(.MuiBackdrop-root), #e-form-media .MuiBox-root' ) }
			open={ true }
			hideBackdrop={ true }
			onClose={ onModalClose }
			sx={ { position: 'absolute' } }
			{ ...props }>
			<Backdrop open={ true }
				sx={ { position: 'absolute', justifyContent: 'flex-end', alignItems: 'flex-start' } }
				aria-hidden={ false }>
				<Slide direction="left" in={ true } mountOnEnter unmountOnExit>
					<StyledContent aria-label={ __( 'Prompt history modal', 'elementor' ) }
						fullHeight={ promptType === HISTORY_TYPES.IMAGE }>
						<PromptHistoryModalHeader onClose={ onModalClose } />

						{ error && NO_HISTORY_ACCESS_ERROR !== error && <PromptErrorMessage error={ error }
							onRetry={ lastRun.current }
							sx={ { position: 'absolute', zIndex: 1 } } /> }

						{ isLoading && <LinearProgress
							role="progressbar"
							aria-label={ __( 'Loading', 'elementor' ) }
							color="secondary" /> }

						<Box sx={ { overflowY: 'scroll', height: '85%' } } ref={ scrollContainer }>
							{ error && NO_HISTORY_ACCESS_ERROR === error && <PromptHistoryUpgrade variant="full" /> }

							{ 0 === items?.length && <PromptHistoryEmpty promptType={ promptType } /> }

							{ items?.length > 0 && <InfiniteScroll loadMore={ loadNext }
								getScrollParent={ () => scrollContainer.current }
								useWindow={ false }
								isReverse={ false }
								threshold={ 30 }
								initialLoad={ false }
								hasMore={ ! isLastPage }
								children={ renderPeriods() } /> }

							{ items?.length > 0 && meta?.allowedDays < 90 && isLastPage && <PromptHistoryUpgrade variant="small" /> }
						</Box>
					</StyledContent>
				</Slide>
			</Backdrop>
		</Modal>
	);
};

export default PromptHistoryModal;
