import * as React from 'react';
import { useState } from 'react';
import {
	ClassesPropProvider,
	ElementProvider,
	SectionsList,
	StyleInheritanceProvider,
	StyleSections,
	StyleProvider,
} from '@elementor/editor-editing-panel';
import { ControlActionsProvider, ControlReplacementsProvider, getControlReplacements } from '@elementor/editor-controls';
import { type Element, type ElementType } from '@elementor/editor-elements';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { ThemeProvider } from '@elementor/editor-ui';
import { controlActionsMenu } from '@elementor/menus';
import { SessionStorageProvider } from '@elementor/session';
import { Box, CloseButton, ErrorBoundary, FormControl, MenuItem, Select, type SelectChangeEvent, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ALLOWED_HTML_WRAPPER_TAGS, type AllowedHtmlTag } from '../allowed-tags';
import { saveDefaultStyles } from '../save-default-styles';

const { useMenuItems } = controlActionsMenu;

const SHIM_ELEMENT_ID = 'default-styles-editor-shim';
const SHIM_CLASSES_PROP = '__default_styles_classes__';

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

export type DefaultStylesPanelContentProps = {
	onRequestClose: () => void | Promise< void >;
};

export function DefaultStylesPanelContent( { onRequestClose }: DefaultStylesPanelContentProps ) {
	const [ selectedTag, setSelectedTag ] = useState< AllowedHtmlTag >( 'h1' );
	const [ activeStyleState, setActiveStyleState ] = useState< StyleDefinitionState | null >( null );
	const breakpoint = useActiveBreakpoint();
	const menuItems = useMenuItems().default;
	const controlReplacements = getControlReplacements();

	const handleClose = () => {
		void saveDefaultStyles( 'preview' ).then( () => onRequestClose() );
	};

	return (
		<ErrorBoundary fallback={ null }>
			<ThemeProvider>
				<ControlActionsProvider items={ menuItems }>
					<ControlReplacementsProvider replacements={ controlReplacements }>
						<Panel>
							<PanelHeader>
								<PanelHeaderTitle>{ __( 'Default Styles', 'elementor' ) }</PanelHeaderTitle>
								<CloseButton size="small" onClick={ handleClose } />
							</PanelHeader>
							<PanelBody>
								<Stack sx={ { px: 2, pt: 1, gap: 1 } }>
									<FormControl fullWidth size="small">
										<Select
											value={ selectedTag }
											onChange={ ( event: SelectChangeEvent< AllowedHtmlTag > ) =>
												setSelectedTag( event.target.value as AllowedHtmlTag )
											}
										>
											{ ALLOWED_HTML_WRAPPER_TAGS.map( ( tag ) => (
												<MenuItem key={ tag } value={ tag }>
													{ tag }
												</MenuItem>
											) ) }
										</Select>
									</FormControl>
								</Stack>
								<ElementProvider element={ shimElement } elementType={ shimElementType } settings={ {} }>
									<ClassesPropProvider prop={ SHIM_CLASSES_PROP }>
										<StyleProvider
											meta={ { breakpoint, state: activeStyleState } }
											id={ selectedTag as StyleDefinitionID }
											setId={ () => {} }
											setMetaState={ setActiveStyleState }
										>
											<SessionStorageProvider prefix={ selectedTag }>
												<StyleInheritanceProvider>
													<SectionsList>
														<StyleSections />
													</SectionsList>
													<Box sx={ { height: '150px' } } />
												</StyleInheritanceProvider>
											</SessionStorageProvider>
										</StyleProvider>
									</ClassesPropProvider>
								</ElementProvider>
							</PanelBody>
						</Panel>
					</ControlReplacementsProvider>
				</ControlActionsProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
