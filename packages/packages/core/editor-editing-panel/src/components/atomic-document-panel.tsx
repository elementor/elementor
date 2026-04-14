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
import { ErrorBoundary, Box, Divider, Stack, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import {
	__privateListenTo as listenTo,
	commandEndEvent,
	windowEvent,
} from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ElementProvider } from '../contexts/element-context';
import { ScrollProvider } from '../contexts/scroll-context';

import { SettingsTab } from './settings-tab';
import { stickyHeaderStyles, StyleTab } from './style-tab';

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

/**
 * Coerces a raw settings value into the v4 atomic prop format { $$type, value }.
 * Values already in that format pass through unchanged; raw strings (from the v3
 * Backbone model) are wrapped so v4 controls can read them via extract().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapAsAtomicProp = ( val: unknown ): AnyTransformable | null => {
	if ( val === undefined || val === null ) {
		return null;
	}
	if ( typeof val === 'object' && val !== null && '$$type' in ( val as any ) ) {
		return val as AnyTransformable;
	}
	if ( typeof val === 'string' ) {
		return { $$type: 'string', value: val } as unknown as AnyTransformable;
	}
	return val as AnyTransformable;
};

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

	// Resolve prop values using a three-tier priority:
	// 1. Live v4-wrapped value from container.settings (user edited in this session).
	// 2. Saved v4 value from config.panel.atomic_settings (persisted from a prior v4 save).
	// 3. Raw v3 string from container.settings, wrapped so v4 controls can extract it.
	// Without this, stringPropTypeUtil.isValid() rejects raw strings and controls show blank.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const savedAtomicSettings: Record< string, unknown > = config.panel?.atomic_settings ?? {};

	const settings: Record< string, AnyTransformable | null > = Object.fromEntries(
		Object.keys( propsSchema ).map( ( key ) => {
			const live = container.settings?.get?.( key );
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ( typeof live === 'object' && live !== null && '$$type' in ( live as any ) ) {
				return [ key, live as AnyTransformable ];
			}
			if ( key in savedAtomicSettings ) {
				return [ key, savedAtomicSettings[ key ] as AnyTransformable ];
			}
			return [ key, wrapAsAtomicProp( live ) ];
		} )
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
// Document-level tab bar and content
// Both Content and Style tabs are handled by v4 panel.
// ---------------------------------------------------------------------------

const { useMenuItems } = controlActionsMenu;

type TabValue = 'content' | 'style';

const DocumentTabs = ( { hasContentControls }: { hasContentControls: boolean } ) => {
	const defaultTab: TabValue = hasContentControls ? 'content' : 'style';
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs< TabValue >( defaultTab );

	if ( ! hasContentControls ) {
		return (
			<ScrollProvider>
				<StyleTab />
			</ScrollProvider>
		);
	}

	return (
		<ScrollProvider>
			<Stack direction="column" sx={ { width: '100%' } }>
				<Stack sx={ { ...stickyHeaderStyles, top: 0 } }>
					<Tabs
						variant="fullWidth"
						size="small"
						sx={ { mt: 0.5 } }
						{ ...getTabsProps() }
					>
						<Tab label={ __( 'Content', 'elementor' ) } { ...getTabProps( 'content' ) } />
						<Tab label={ __( 'Style', 'elementor' ) } { ...getTabProps( 'style' ) } />
					</Tabs>
					<Divider />
				</Stack>
				<TabPanel { ...getTabPanelProps( 'content' ) } disablePadding>
					<SettingsTab />
				</TabPanel>
				<TabPanel { ...getTabPanelProps( 'style' ) } disablePadding>
					<StyleTab />
				</TabPanel>
			</Stack>
		</ScrollProvider>
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
			const config = getDocumentConfig();
			if ( container && config ) {
				const styles = container.model?.get?.( 'styles' ) ?? {};
				container.settings?.set?.( 'atomic_styles', styles, { silent: true } );

				const propsSchema = config.panel?.atomic_props_schema ?? {};
				const atomicSettings: Record< string, unknown > = {};

				Object.keys( propsSchema ).forEach( ( key ) => {
					if ( key !== 'classes' && key !== '_cssid' ) {
						const value = container.settings?.get?.( key );
						if ( value !== undefined && value !== null ) {
							// Wrap raw strings (v3 Backbone values) into v4 prop format so
							// PHP Props_Parser::validate() receives the expected { $$type, value } shape.
							atomicSettings[ key ] = wrapAsAtomicProp( value ) ?? value;
						}
					}
				} );

				if ( Object.keys( atomicSettings ).length > 0 ) {
					container.settings?.set?.( 'atomic_settings', atomicSettings, { silent: true } );
				}
			}
			setCtx( buildDocumentElementContext() );
		};

		return listenTo(
			[
				windowEvent( ELEMENT_STYLE_CHANGE_EVENT ),
				commandEndEvent( 'document/elements/set-settings' ),
			],
			rebuild
		);
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	if ( ! ctx ) {
		return null;
	}

	const hasContentControls = ctx.elementType.controls.length > 0;

	return (
		<PanelBody>
			<ControlActionsProvider items={ menuItems }>
				<ControlReplacementsProvider replacements={ controlReplacements }>
					<ElementProvider
						element={ ctx.element }
						elementType={ ctx.elementType }
						settings={ ctx.settings }
					>
						<DocumentTabs hasContentControls={ hasContentControls } />
					</ElementProvider>
				</ControlReplacementsProvider>
			</ControlActionsProvider>
		</PanelBody>
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
