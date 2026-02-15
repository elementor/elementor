import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getCurrentDocument, getV1DocumentsManager, setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	__createPanel as createPanel,
	Panel,
	PanelBody,
	PanelFooter,
	PanelHeader,
	PanelHeaderTitle,
} from '@elementor/editor-panels';
import { SaveChangesDialog, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { __privateRunCommand as runCommand, changeEditMode } from '@elementor/editor-v1-adapters';
import { XIcon } from '@elementor/icons';
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
	IconButton,
	type IconButtonProps,
	Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useClassesOrder } from '../../hooks/use-classes-order';
import { useDirtyState } from '../../hooks/use-dirty-state';
import { useFilters } from '../../hooks/use-filters';
import { saveGlobalClasses } from '../../save-global-classes';
import { slice } from '../../store';
import { ActiveFilters } from '../search-and-filter/components/filter/active-filters';
import { CssClassFilter } from '../search-and-filter/components/filter/css-class-filter';
import { ClassManagerSearch } from '../search-and-filter/components/search/class-manager-search';
import { SearchAndFilterProvider } from '../search-and-filter/context';
import { StopSyncConfirmationDialog } from '../ui/stop-sync-confirmation-dialog';
import { ClassManagerIntroduction } from './class-manager-introduction';
import { hasDeletedItems, onDelete } from './delete-class';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { GlobalClassesList } from './global-classes-list';
import { blockPanelInteractions, unblockPanelInteractions } from './panel-interactions';

const id = 'global-classes-manager';

const reloadDocument = () => {
	const currentDocument = getCurrentDocument();
	const documentsManager = getV1DocumentsManager();

	documentsManager.invalidateCache();

	return runCommand( 'editor/documents/switch', {
		id: currentDocument?.id,
		shouldScroll: false,
		shouldNavigateToDefaultRoute: false,
	} );
};

// We need to disable the app-bar buttons, and the elements overlays when opening the classes manager panel.
// The buttons and overlays are enabled only in edit mode, so we're creating a custom new edit mode that
// will force them to be disabled. We can't use the `preview` edit mode in this case since it'll force
// the panel to be closed.
export const { panel, usePanelActions } = createPanel( {
	id,
	component: ClassManagerPanel,
	allowedEditModes: [ 'edit', id ],
	onOpen: () => {
		changeEditMode( id );

		blockPanelInteractions();
	},
	onClose: async () => {
		changeEditMode( 'edit' );
		await reloadDocument();
		unblockPanelInteractions();
	},
	isOpenPreviousElement: true,
} );

export function ClassManagerPanel() {
	const isDirty = useDirtyState();
	const { close: closePanel } = usePanelActions();
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
	const [ stopSyncConfirmation, setStopSyncConfirmation ] = useState< string | null >( null );

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
		setStopSyncConfirmation( null );
	}, [] );

	usePreventUnload();

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Panel>
					<SearchAndFilterProvider>
						<PanelHeader>
							<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
								<Stack width="100%" direction="row" gap={ 1 }>
									<PanelHeaderTitle sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
										<FlippedColorSwatchIcon fontSize="inherit" />
										{ __( 'Class Manager', 'elementor' ) }
									</PanelHeaderTitle>
									<TotalCssClassCounter />
								</Stack>
								<CloseButton
									sx={ { marginLeft: 'auto' } }
									disabled={ isPublishing }
									onClose={ () => {
										if ( isDirty ) {
											openSaveChangesDialog();
											return;
										}

										closePanel();
									} }
								/>
							</Stack>
						</PanelHeader>
						<PanelBody
							sx={ {
								display: 'flex',
								flexDirection: 'column',
								height: '100%',
							} }
						>
							<Box px={ 2 } pb={ 1 }>
								<Stack direction="row" justifyContent="spaceBetween" gap={ 0.5 } sx={ { pb: 0.5 } }>
									<Box sx={ { flexGrow: 1 } }>
										<ClassManagerSearch />
									</Box>
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
							} }
						>
							<GlobalClassesList
								disabled={ isPublishing }
								onStopSyncRequest={ ( id ) => setStopSyncConfirmation( id ) }
							/>
						</Box>
						</PanelBody>

						<PanelFooter>
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
						</PanelFooter>
					</SearchAndFilterProvider>
				</Panel>
			</ErrorBoundary>
			<ClassManagerIntroduction />
			{ stopSyncConfirmation && (
				<StopSyncConfirmationDialog
					open
					closeDialog={ () => setStopSyncConfirmation( null ) }
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

const CloseButton = ( { onClose, ...props }: IconButtonProps & { onClose: () => void } ) => (
	<IconButton size="small" color="secondary" onClick={ onClose } aria-label="Close" { ...props }>
		<XIcon fontSize="small" />
	</IconButton>
);

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
