import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ControlActionsProvider,
	ControlReplacementsProvider,
	getControlReplacements,
} from '@elementor/editor-controls';
import {
	ClassesPropProvider,
	CreatableAutocomplete,
	ElementProvider,
	type Option,
	SectionsList,
	StyleInheritanceProvider,
	StyleProvider,
	StyleSections,
	StyleTabSlot,
} from '@elementor/editor-editing-panel';
import { type Element, type ElementType } from '@elementor/editor-elements';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { SaveChangesDialog, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { controlActionsMenu } from '@elementor/menus';
import { useMutation } from '@elementor/query';
import { getSessionStorageItem, SessionStorageProvider, setSessionStorageItem } from '@elementor/session';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import {
	type AutocompleteChangeReason,
	Box,
	Button,
	ErrorBoundary,
	FormControl,
	FormLabel,
	Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	type AllowedHtmlTag,
	getAllowedDefaultStyleTags,
	getDefaultActiveTag,
	isAllowedDefaultStyleTag,
} from '../allowed-tags';
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

function toTagChip( tag: AllowedHtmlTag ): Option {
	return { label: tag, value: tag, fixed: true };
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

export type DefaultStylesTabEmbeddedProps = {
	onRequestClose: () => void | Promise< void >;
	onExposeCloseAttempt?: ( attemptClose: ( () => void ) | null ) => void;
};

export function DefaultStylesTabEmbedded( { onRequestClose, onExposeCloseAttempt }: DefaultStylesTabEmbeddedProps ) {
	const allowedTags = useMemo( () => getAllowedDefaultStyleTags(), [] );
	const tagOptions = useMemo< Option[] >(
		() => allowedTags.map( ( tag ) => ( { label: tag, value: tag } ) ),
		[ allowedTags ]
	);
	const [ selectedTag, setSelectedTagState ] = useState< AllowedHtmlTag >( () => readStoredActiveTag( allowedTags ) );
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

		void onRequestClose();
	}, [ isDirty, onRequestClose, openSaveChangesDialog ] );

	useEffect( () => {
		if ( ! onExposeCloseAttempt ) {
			return;
		}

		onExposeCloseAttempt( () => handleClosePanel() );

		return () => onExposeCloseAttempt( null );
	}, [ onExposeCloseAttempt, handleClosePanel ] );

	usePreventUnload( isDirty );

	const handleTagSelect = ( _selected: Option[], reason: AutocompleteChangeReason, option: Option ) => {
		if ( reason !== 'selectOption' || ! option.value ) {
			return;
		}

		setSelectedTag( option.value as AllowedHtmlTag );
		setActiveStyleState( null );
	};

	const resetAndClosePanel = () => {
		dispatch( slice.actions.reset() );
		closeSaveChangesDialog();
		void onRequestClose();
	};

	const handleSaveAndContinue = async () => {
		try {
			await save();
		} catch {
			return;
		}

		closeSaveChangesDialog();
		void onRequestClose();
	};

	return (
		<ErrorBoundary fallback={ null }>
			<ThemeProvider>
				<ControlActionsProvider items={ menuItems }>
					<ControlReplacementsProvider replacements={ controlReplacements }>
						<Stack
							sx={ {
								flex: 1,
								minHeight: 0,
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column',
							} }
						>
							<Box sx={ { flex: 1, minHeight: 0, overflow: 'auto' } }>
								<Stack sx={ { px: 2, pt: 1, gap: 1 } }>
									<FormControl fullWidth size="small">
										<FormLabel htmlFor={ TAG_SELECTOR_ID } size="small" sx={ { mb: 1 } }>
											{ __( 'Tag', 'elementor' ) }
										</FormLabel>
										<CreatableAutocomplete< Option >
											id={ TAG_SELECTOR_ID }
											size="tiny"
											placeholder={ __( 'Type tag name', 'elementor' ) }
											options={ tagOptions }
											selected={ [ toTagChip( selectedTag ) ] }
											onSelect={ handleTagSelect }
											renderTags={ ( values, getTagProps ) =>
												values.map( ( value, index ) => (
													<TagChip
														key={ value.value ?? value.label }
														label={ value.label }
														chipProps={ getTagProps( { index } ) }
														activeState={ activeStyleState }
														onSelectState={ setActiveStyleState }
													/>
												) )
											}
										/>
									</FormControl>
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
														<StyleTabSlot />
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
							</Box>
							<Box sx={ { flexShrink: 0, px: 2, py: 1.5 } }>
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
							</Box>
						</Stack>
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
