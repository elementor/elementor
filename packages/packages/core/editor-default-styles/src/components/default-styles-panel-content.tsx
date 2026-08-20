import * as React from 'react';
import { type SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ControlActionsProvider,
	ControlReplacementsProvider,
	getControlReplacements,
} from '@elementor/editor-controls';
import {
	ClassesPropProvider,
	ElementProvider,
	SectionsList,
	StyleInheritanceProvider,
	StyleProvider,
	StyleSections,
} from '@elementor/editor-editing-panel';
import { type Element, type ElementType } from '@elementor/editor-elements';
import { Panel, PanelBody, PanelFooter, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { SaveChangesDialog, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { controlActionsMenu } from '@elementor/menus';
import { useMutation } from '@elementor/query';
import { getSessionStorageItem, SessionStorageProvider, setSessionStorageItem } from '@elementor/session';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import {
	Autocomplete,
	type AutocompleteChangeReason,
	Box,
	Button,
	CloseButton,
	ErrorBoundary,
	FormLabel,
	Stack,
	TextField,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	type AllowedHtmlTag,
	getAllowedDefaultStyleTags,
	getDefaultActiveTag,
	isAllowedDefaultStyleTag,
} from '../allowed-tags';
import { blockPanelInteractions, unblockPanelInteractions } from '../panel-interactions';
import { saveDefaultStyles } from '../save-default-styles';
import { selectIsDirty, slice } from '../store';
import { TagChip } from './tag-chip';

const { useMenuItems } = controlActionsMenu;

const SHIM_ELEMENT_ID = 'default-styles-editor-shim';
const SHIM_CLASSES_PROP = '__default_styles_classes__';
const TAG_SELECTOR_ID = 'default-styles-tag-selector';
const LAST_ACTIVE_TAG_SESSION_PREFIX = 'default-styles';
const LAST_ACTIVE_TAG_SESSION_KEY = 'last-active-tag';
const LAST_ACTIVE_TAG_STORAGE_KEY = `${ LAST_ACTIVE_TAG_SESSION_PREFIX }/${ LAST_ACTIVE_TAG_SESSION_KEY }`;

function readStoredActiveTag( allowedTags: AllowedHtmlTag[] ): AllowedHtmlTag {
	const storedTag = getSessionStorageItem< AllowedHtmlTag >( LAST_ACTIVE_TAG_STORAGE_KEY );

	if ( storedTag && isAllowedDefaultStyleTag( storedTag, allowedTags ) ) {
		return storedTag;
	}

	return getDefaultActiveTag( allowedTags );
}

type TagOption = {
	label: string;
	value: string;
};

function toTagOption( tag: AllowedHtmlTag ): TagOption {
	return { label: tag, value: tag };
}

const shimElement: Element = {
	id: SHIM_ELEMENT_ID,
	type: 'default-style',
};

const shimElementType: ElementType = {
	key: 'default-style',
	controls: [],
	propsSchema: {},
	title: __( 'Default Style', 'elementor' ),
};

type DefaultStylesPanelContentProps = {
	onRequestClose: () => void;
};

export function DefaultStylesPanelContent( { onRequestClose }: DefaultStylesPanelContentProps ) {
	const allowedTags = useMemo( () => getAllowedDefaultStyleTags(), [] );
	const tagOptions = useMemo< TagOption[] >(
		() => allowedTags.map( ( tag ) => toTagOption( tag ) ),
		[ allowedTags ]
	);
	const [ selectedTag, setSelectedTagState ] = useState< AllowedHtmlTag >( () => readStoredActiveTag( allowedTags ) );
	const selectedTagOption = useMemo( () => toTagOption( selectedTag ), [ selectedTag ] );
	const [ isTagSelectionMode, setIsTagSelectionMode ] = useState( false );
	const tagSelectorRef = useRef< HTMLDivElement | null >( null );
	const [ activeStyleState, setActiveStyleState ] = useState< StyleDefinitionState | null >( null );
	const breakpoint = useActiveBreakpoint();
	const menuItems = useMenuItems().default;
	const controlReplacements = getControlReplacements();
	const isDirty = useSelector( selectIsDirty );
	const { mutateAsync: save, isPending: isSaving } = useSave();
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();

	const setSelectedTag = ( tag: AllowedHtmlTag ) => {
		setSelectedTagState( tag );
		setSessionStorageItem( LAST_ACTIVE_TAG_STORAGE_KEY, tag );
	};

	const handleClosePanel = useCallback( () => {
		if ( isDirty ) {
			openSaveChangesDialog();
			return;
		}

		onRequestClose();
	}, [ isDirty, onRequestClose, openSaveChangesDialog ] );

	useEffect( () => {
		blockPanelInteractions();

		return () => {
			unblockPanelInteractions();
		};
	}, [] );

	usePreventUnload( isDirty );

	const openTagSelection = useCallback( () => {
		setIsTagSelectionMode( true );
	}, [] );

	const closeTagSelection = useCallback( () => {
		setIsTagSelectionMode( false );
	}, [] );

	useEffect( () => {
		if ( ! isTagSelectionMode ) {
			return;
		}

		requestAnimationFrame( () => {
			tagSelectorRef.current?.querySelector< HTMLInputElement >( 'input' )?.focus();
		} );
	}, [ isTagSelectionMode ] );

	const handleTagChange = (
		_: SyntheticEvent,
		option: TagOption | null,
		reason: AutocompleteChangeReason
	) => {
		if ( reason !== 'selectOption' || ! option?.value ) {
			return;
		}

		setSelectedTag( option.value as AllowedHtmlTag );
		setActiveStyleState( null );
		setIsTagSelectionMode( false );
	};

	const resetAndClosePanel = () => {
		dispatch( slice.actions.reset() );
		closeSaveChangesDialog();
		onRequestClose();
	};

	const handleSaveAndContinue = async () => {
		try {
			await save();
		} catch {
			return;
		}

		closeSaveChangesDialog();
		onRequestClose();
	};

	return (
		<ErrorBoundary fallback={ null }>
			<ThemeProvider>
				<ControlActionsProvider items={ menuItems }>
					<ControlReplacementsProvider replacements={ controlReplacements }>
						<Panel>
							<PanelHeader>
								<Stack
									p={ 1 }
									pl={ 2 }
									width="100%"
									direction="row"
									alignItems="center"
									justifyContent="space-between"
									spacing={ 0.5 }
								>
									<PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
										{ __( 'Default Styles', 'elementor' ) }
									</PanelHeaderTitle>
									<CloseButton
										aria-label={ __( 'Close', 'elementor' ) }
										sx={ { flexShrink: 0 } }
										onClick={ handleClosePanel }
									/>
								</Stack>
							</PanelHeader>
							<PanelBody>
								<Stack direction="row" alignItems="center" gap={ 1 } sx={ { px: 2, pt: 1 } }>
									<FormLabel htmlFor={ TAG_SELECTOR_ID } size="small" sx={ { mb: 0, flexShrink: 0 } }>
										{ __( 'Tag', 'elementor' ) }
									</FormLabel>
									<Box sx={ { flex: 1, minWidth: 0 } }>
										{ isTagSelectionMode ? (
											<Autocomplete
												ref={ tagSelectorRef }
												id={ TAG_SELECTOR_ID }
												fullWidth
												disableClearable
												clearOnBlur
												forcePopupIcon={ false }
												open={ isTagSelectionMode }
												onClose={ closeTagSelection }
												size="tiny"
												options={ tagOptions }
												value={ null }
												onChange={ handleTagChange }
												getOptionLabel={ ( option ) => option.label }
												isOptionEqualToValue={ ( option, value ) => option.value === value.value }
												renderInput={ ( params ) => (
													<TextField
														{ ...params }
														placeholder={ __( 'Select tag', 'elementor' ) }
													/>
												) }
											/>
										) : (
											<TagChip
												label={ selectedTagOption.label }
												chipProps={ {
													key: selectedTag,
													tabIndex: -1,
													disabled: false,
													'data-tag-index': 0,
													onDelete: () => {},
												} }
												activeState={ activeStyleState }
												onSelectState={ setActiveStyleState }
												onLabelClick={ openTagSelection }
											/>
										) }
									</Box>
								</Stack>
								<ElementProvider
									element={ shimElement }
									elementType={ shimElementType }
									settings={ {} }
								>
									<ClassesPropProvider prop={ SHIM_CLASSES_PROP }>
										<StyleProvider
											meta={ {
												breakpoint,
												state: activeStyleState,
											} }
											id={ selectedTag as StyleDefinitionID }
											setId={ () => {} }
											setMetaState={ setActiveStyleState }
										>
											<SessionStorageProvider prefix={ selectedTag }>
												<StyleInheritanceProvider>
													<SectionsList>
														<StyleSections />
													</SectionsList>
													<Box
														sx={ {
															height: '150px',
														} }
													/>
												</StyleInheritanceProvider>
											</SessionStorageProvider>
										</StyleProvider>
									</ClassesPropProvider>
								</ElementProvider>
							</PanelBody>
							<PanelFooter>
								<Button
									fullWidth
									size="small"
									color="global"
									variant="contained"
									onClick={ () => void save() }
									disabled={ ! isDirty }
									loading={ isSaving }
								>
									{ __( 'Save changes', 'elementor' ) }
								</Button>
							</PanelFooter>
						</Panel>
					</ControlReplacementsProvider>
				</ControlActionsProvider>

				{ isSaveChangesDialogOpen && (
					<SaveChangesDialog>
						<SaveChangesDialog.Title onClose={ closeSaveChangesDialog }>
							{ __( 'You have unsaved changes', 'elementor' ) }
						</SaveChangesDialog.Title>
						<SaveChangesDialog.Content>
							<SaveChangesDialog.ContentText>
								{ __( 'You have unsaved changes in Default Styles.', 'elementor' ) }
							</SaveChangesDialog.ContentText>
							<SaveChangesDialog.ContentText>
								{ __( 'To avoid losing your updates, save your changes before leaving.', 'elementor' ) }
							</SaveChangesDialog.ContentText>
						</SaveChangesDialog.Content>
						<SaveChangesDialog.Actions
							actions={ {
								discard: {
									label: __( 'Discard', 'elementor' ),
									action: resetAndClosePanel,
								},
								confirm: {
									label: __( 'Save & Continue', 'elementor' ),
									action: handleSaveAndContinue,
								},
							} }
						/>
					</SaveChangesDialog>
				) }
			</ThemeProvider>
		</ErrorBoundary>
	);
}

function useSave() {
	return useMutation( {
		mutationFn: () => saveDefaultStyles(),
	} );
}

function usePreventUnload( isDirty: boolean ) {
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
}
