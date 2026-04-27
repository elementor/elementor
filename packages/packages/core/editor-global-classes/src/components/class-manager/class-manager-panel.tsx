import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { ConfirmationDialog, SaveChangesDialog, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { useMutation } from '@elementor/query';
import { __dispatch as dispatch } from '@elementor/store';
import {
	Alert,
	Box,
	Button,
	Chip,
	DialogHeader,
	Divider,
	ErrorBoundary,
	Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useClassesOrder } from '../../hooks/use-classes-order';
import { useDirtyState } from '../../hooks/use-dirty-state';
import { useFilters } from '../../hooks/use-filters';
import { saveGlobalClasses } from '../../save-global-classes';
import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';
import { ActiveFilters } from '../search-and-filter/components/filter/active-filters';
import { CssClassFilter } from '../search-and-filter/components/filter/css-class-filter';
import { ClassManagerSearch } from '../search-and-filter/components/search/class-manager-search';
import { SearchAndFilterProvider } from '../search-and-filter/context';
import { ClassManagerIntroduction } from './class-manager-introduction';
import { hasDeletedItems, onDelete } from './delete-class';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { GlobalClassesList } from './global-classes-list';
import { StartSyncToV3Modal } from './start-sync-to-v3-modal';

const STOP_SYNC_MESSAGE_KEY = 'stop-sync-class';

type StopSyncConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export type ClassManagerPanelViewProps = {
	/** Invoked when the user closes the class manager (e.g. from the design system shell). */
	onRequestClose: () => void;
};

export function ClassManagerPanelView( { onRequestClose: closePanel }: ClassManagerPanelViewProps ) {
	const isDirty = useDirtyState();
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
	const [ stopSyncConfirmation, setStopSyncConfirmation ] = useState< string | null >( null );
	const [ startSyncConfirmation, setStartSyncConfirmation ] = useState< string | null >( null );
	const [ isStopSyncSuppressed ] = useSuppressedMessage( STOP_SYNC_MESSAGE_KEY );

	const { mutateAsync: publish, isPending: isPublishing } = usePublish();

	const resetAndClosePanel = () => {
		dispatch( slice.actions.resetToInitialState( { context: 'frontend' } ) );
		closeSaveChangesDialog();
	};

	const handleStopSync = useCallback( ( classId: string ) => {
		dispatch(
			slice.actions.update( {
				style: {
					id: classId,
					sync_to_v3: false,
				},
			} )
		);
		trackGlobalClasses( { event: 'classSyncToV3', classId, action: 'unsync' } );
		setStopSyncConfirmation( null );
	}, [] );

	const handleStartSync = useCallback( ( classId: string ) => {
		dispatch(
			slice.actions.update( {
				style: {
					id: classId,
					sync_to_v3: true,
				},
			} )
		);
		trackGlobalClasses( { event: 'classSyncToV3', classId, action: 'sync' } );
		setStartSyncConfirmation( null );
	}, [] );

	const handleStopSyncRequest = useCallback(
		( classId: string ) => {
			if ( ! isStopSyncSuppressed ) {
				setStopSyncConfirmation( classId );
			} else {
				handleStopSync( classId );
			}
		},
		[ isStopSyncSuppressed, handleStopSync ]
	);

	usePreventUnload();

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Box
					sx={ {
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
						minHeight: 0,
						flex: 1,
					} }
				>
					<SearchAndFilterProvider>
						<Box px={ 2 } pt={ 1 } pb={ 1 }>
							<Stack
								direction="row"
								justifyContent="space-between"
								gap={ 0.5 }
								alignItems="center"
								sx={ { pb: 0.5 } }
							>
								<Box sx={ { flexGrow: 1 } }>
									<ClassManagerSearch />
								</Box>
								<TotalCssClassCounter />
								<CssClassFilter />
							</Stack>
							<ActiveFilters />
						</Box>
						<Divider />
						<Box
							px={ 2 }
							sx={ {
								flexGrow: 1,
								overflowY: 'auto',
								minHeight: 0,
							} }
						>
							<GlobalClassesList
								disabled={ isPublishing }
								onStopSyncRequest={ handleStopSyncRequest }
								onStartSyncRequest={ ( classId ) => setStartSyncConfirmation( classId ) }
							/>
						</Box>
						<Box px={ 2 } py={ 1.5 }>
							<Button
								fullWidth
								size="small"
								color="global"
								variant="contained"
								onClick={ publish }
								disabled={ ! isDirty }
								loading={ isPublishing }
							>
								{ __( 'Save changes', 'elementor' ) }
							</Button>
						</Box>
					</SearchAndFilterProvider>
				</Box>
			</ErrorBoundary>
			<ClassManagerIntroduction />
			{ startSyncConfirmation && (
				<StartSyncToV3Modal
					externalOpen
					classId={ startSyncConfirmation }
					onExternalClose={ () => setStartSyncConfirmation( null ) }
					onConfirm={ () => handleStartSync( startSyncConfirmation ) }
				/>
			) }
			{ stopSyncConfirmation && (
				<StopSyncConfirmationDialog
					open
					onClose={ () => setStopSyncConfirmation( null ) }
					onConfirm={ () => handleStopSync( stopSyncConfirmation ) }
				/>
			) }
			{ isSaveChangesDialogOpen && (
				<SaveChangesDialog>
					<DialogHeader onClose={ closeSaveChangesDialog } logo={ false }>
						<SaveChangesDialog.Title>
							{ __( 'You have unsaved changes', 'elementor' ) }
						</SaveChangesDialog.Title>
					</DialogHeader>
					<SaveChangesDialog.Content>
						<SaveChangesDialog.ContentText>
							{ __( 'You have unsaved changes in the Class Manager.', 'elementor' ) }
						</SaveChangesDialog.ContentText>
						<SaveChangesDialog.ContentText>
							{ __( 'To avoid losing your updates, save your changes before leaving.', 'elementor' ) }
						</SaveChangesDialog.ContentText>
					</SaveChangesDialog.Content>
					<SaveChangesDialog.Actions
						actions={ {
							discard: {
								label: __( 'Discard', 'elementor' ),
								action: () => {
									resetAndClosePanel();
								},
							},
							confirm: {
								label: __( 'Save & Continue', 'elementor' ),
								action: async () => {
									await publish();
									closeSaveChangesDialog();
									closePanel();
								},
							},
						} }
					/>
				</SaveChangesDialog>
			) }
		</ThemeProvider>
	);
}

const ErrorBoundaryFallback = () => (
	<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
		<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
			<strong>{ __( 'Something went wrong', 'elementor' ) }</strong>
		</Alert>
	</Box>
);

const usePreventUnload = () => {
	const isDirty = useDirtyState();

	useEffect( () => {
		const handleBeforeUnload = ( event: BeforeUnloadEvent ) => {
			if ( isDirty ) {
				event.preventDefault();
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ isDirty ] );
};

const usePublish = () => {
	return useMutation( {
		mutationFn: () => saveGlobalClasses( { context: 'frontend' } ),
		onSuccess: async () => {
			setDocumentModifiedStatus( false );

			if ( hasDeletedItems() ) {
				await onDelete();
			}
		},
	} );
};

const TotalCssClassCounter = () => {
	const filters = useFilters();
	const cssClasses = useClassesOrder();

	return (
		<Chip
			size={ 'small' }
			label={ filters ? `${ filters.length } / ${ cssClasses?.length }` : cssClasses?.length }
		/>
	);
};

const StopSyncConfirmationDialog = ( { open, onClose, onConfirm }: StopSyncConfirmationDialogProps ) => {
	const [ , suppressStopSyncMessage ] = useSuppressedMessage( STOP_SYNC_MESSAGE_KEY );

	return (
		<ConfirmationDialog open={ open } onClose={ onClose }>
			<ConfirmationDialog.Title icon={ FlippedColorSwatchIcon } iconColor="primary">
				{ __( 'Un-sync typography class', 'elementor' ) }
			</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __( "You're about to stop syncing a typography class to Global Fonts.", 'elementor' ) }
				</ConfirmationDialog.ContentText>
				<ConfirmationDialog.ContentText sx={ { mt: 1 } }>
					{ __(
						"Note that if it's being used anywhere, the affected elements will inherit the default typography.",
						'elementor'
					) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions
				onClose={ onClose }
				onConfirm={ onConfirm }
				cancelLabel={ __( 'Cancel', 'elementor' ) }
				confirmLabel={ __( 'Got it', 'elementor' ) }
				color="primary"
				onSuppressMessage={ suppressStopSyncMessage }
				suppressLabel={ __( "Don't show again", 'elementor' ) }
			/>
		</ConfirmationDialog>
	);
};
