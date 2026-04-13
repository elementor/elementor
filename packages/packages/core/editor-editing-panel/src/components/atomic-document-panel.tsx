import * as React from 'react';
import { useEffect, useState } from 'react';
import {
	ControlActionsProvider,
	ControlReplacementsProvider,
	getControlReplacements,
} from '@elementor/editor-controls';
import { type Element, type ElementType } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { controlActionsMenu } from '@elementor/menus';
import { SessionStorageProvider } from '@elementor/session';
import { ErrorBoundary, Box, Divider, Tab, Tabs } from '@elementor/ui';
import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	windowEvent,
} from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ElementProvider } from '../contexts/element-context';
import { ScrollProvider } from '../contexts/scroll-context';

import { StyleTab } from './style-tab';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

// Fired by mutateElementStyles after every style mutation.
const ELEMENT_STYLE_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/style';

// ---------------------------------------------------------------------------
// Build element / elementType context from the current atomic document
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDocumentConfig = (): any => ( window as any )?.elementor?.config?.document;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDocumentContainer = (): any =>
	( window as any )?.elementor?.documents?.getCurrent?.()?.container ?? null;

type DocumentElementContext = {
	element: Element;
	elementType: ElementType;
	settings: Record< string, AnyTransformable | null >;
};

const buildDocumentElementContext = (): DocumentElementContext | null => {
	const config = getDocumentConfig();
	const container = getDocumentContainer();

	if ( ! config || ! container ) {
		return null;
	}

	const element: Element = {
		id: container.id as string,
		type: ( config.type as string ) ?? 'header-v4',
	};

	const propsSchema = config.panel?.atomic_props_schema ?? {};
	const title = config.panel?.title ?? __( 'Document', 'elementor' );

	const elementType: ElementType = {
		key: element.type,
		controls: config.panel?.atomic_controls ?? [],
		propsSchema,
		title,
		styleStates: [],
		pseudoStates: [],
	};

	// Ensure getElementLabel() can resolve a label for this document container.
	// CssClassSelector calls getElementLabel(element.id) for undo action titles;
	// it reads container.model.get('elType') and looks it up in window.elementor.widgetsCache.
	// Documents are never in widgetsCache, so we register the entry on demand.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const elType = container.model?.get?.( 'widgetType' ) || container.model?.get?.( 'elType' );
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const widgetsCache = ( window as any )?.elementor?.widgetsCache;
	if ( elType && widgetsCache && ! widgetsCache[ elType ] ) {
		widgetsCache[ elType ] = { title };
	}

	// Read prop values from the container's settings model for all props except 'classes'.
	const settings: Record< string, AnyTransformable | null > = Object.fromEntries(
		Object.keys( propsSchema ).map( ( key ) => [
			key,
			( container.settings?.get?.( key ) as AnyTransformable ) ?? null,
		] )
	);

	// Derive the 'classes' prop directly from the styles stored in the container model.
	//
	// `document/elements/set-settings` is scoped to canvas elements and does not update
	// container.settings for the document root container, so reading
	// container.settings.get('classes') always returns null after createElementStyle runs.
	// Instead we treat every style ID present in the model as "applied" — for documents
	// there is only one editing target (the root container), so this is always correct.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const docStyles: Record< string, unknown > = container.model?.get?.( 'styles' ) ?? {};
	const appliedStyleIds = Object.keys( docStyles );

	settings.classes = appliedStyleIds.length > 0
		? ( { $$type: 'classes', value: appliedStyleIds } as unknown as AnyTransformable )
		: null;

	return { element, elementType, settings };
};

// ---------------------------------------------------------------------------
// Document-level tab bar
// Style tab is handled by v4 panel, Content tab routes to v3 panel.
// ---------------------------------------------------------------------------

const { useMenuItems } = controlActionsMenu;

const DocumentTabBar = () => {
	return (
		<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
			<Tabs value="style" variant="fullWidth" size="small" sx={ { mt: 0.5 } }>
				<Tab
					label={ __( 'Content', 'elementor' ) }
					value="content"
					onClick={ () => openRoute( 'panel/page-settings/settings' ) }
				/>
				<Tab
					label={ __( 'Style', 'elementor' ) }
					value="style"
				/>
			</Tabs>
			<Divider />
		</Box>
	);
};

// ---------------------------------------------------------------------------
// Panel content — provides reactive element context to both tabs
// ---------------------------------------------------------------------------

const AtomicDocumentContent = () => {
	const [ ctx, setCtx ] = useState< DocumentElementContext | null >( () => {
		const config = getDocumentConfig();
		const container = getDocumentContainer();
		if ( container && config?.panel?.atomic_styles ) {
			container.model?.set?.( 'styles', config.panel.atomic_styles );
		}
		return buildDocumentElementContext();
	} );

	const controlReplacements = getControlReplacements();
	const menuItems = useMenuItems().default;

	useEffect( () => {
		const rebuild = () => {
			const container = getDocumentContainer();
			if ( container ) {
				const styles = container.model?.get?.( 'styles' ) ?? {};
				container.settings?.set?.( 'atomic_styles', styles, { silent: true } );
			}
			setCtx( buildDocumentElementContext() );
		};

		return listenTo( [ windowEvent( ELEMENT_STYLE_CHANGE_EVENT ) ], rebuild );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	if ( ! ctx ) {
		return null;
	}

	return (
		<>
			<DocumentTabBar />
			<PanelBody>
				<ControlActionsProvider items={ menuItems }>
					<ControlReplacementsProvider replacements={ controlReplacements }>
						<ElementProvider
							element={ ctx.element }
							elementType={ ctx.elementType }
							settings={ ctx.settings }
						>
							<ScrollProvider>
								<StyleTab />
							</ScrollProvider>
						</ElementProvider>
					</ControlReplacementsProvider>
				</ControlActionsProvider>
			</PanelBody>
		</>
	);
};

// ---------------------------------------------------------------------------
// Exported panel component (registered via createPanel)
// ---------------------------------------------------------------------------

export const AtomicDocumentPanel = () => {
	const config = getDocumentConfig();
	const title = config?.panel?.title ?? __( 'Document Settings', 'elementor' );

	return (
		<ErrorBoundary fallback={ <Box p={ 2 }>{ __( 'An error occurred loading document settings.', 'elementor' ) }</Box> }>
			<ThemeProvider>
				<SessionStorageProvider prefix="atomic-document">
					<Panel>
						<PanelHeader>
							<PanelHeaderTitle>{ title }</PanelHeaderTitle>
						</PanelHeader>
						<AtomicDocumentContent />
					</Panel>
				</SessionStorageProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
};
