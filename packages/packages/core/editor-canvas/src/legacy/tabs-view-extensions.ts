import { type TwigRenderContext } from './twig-rendering-utils';
import { type BackboneModel, type ElementModel, type ElementView } from './types';

const TABS_MENU_ELEMENT_TYPE = 'e-tabs-menu';
const TABS_CONTENT_AREA_ELEMENT_TYPE = 'e-tabs-content-area';

export type TabsRenderContext = {
	tabsId: string;
	defaultActiveTab: number;
	getTabIndex: ( tabId: string ) => number;
	getTabContentIndex: ( contentId: string ) => number;
};

type TabsView = ElementView & {
	getTabsRenderContext?: () => TabsRenderContext;
	_findTabsContext?: () => TabsRenderContext | null;
	_buildTypeSpecificContext?: ( baseContext: TwigRenderContext ) => TwigRenderContext;
};

function getTabId( tabsId: string, index: number ): string {
	return `${ tabsId }-tab-${ index }`;
}

function getTabContentId( tabsId: string, index: number ): string {
	return `${ tabsId }-tab-content-${ index }`;
}

function findParentWithTabsContext( view: TabsView ): TabsView | null {
	let parent = view._parent as TabsView | undefined;

	while ( parent ) {
		if ( parent.getTabsRenderContext !== undefined ) {
			return parent;
		}
		parent = parent._parent as TabsView | undefined;
	}

	return null;
}

function getElementTypeFromModel( model: BackboneModel< ElementModel > ): string {
	const elType = model.get( 'elType' );
	if ( elType ) {
		return elType;
	}

	const widgetType = model.get( 'widgetType' );
	if ( widgetType ) {
		return widgetType;
	}

	return '';
}

function createTabsContextFromView( view: TabsView ): TabsRenderContext {
	const model = view.model;
	const settings = model.get( 'settings' ).toJSON();
	const elements = model.get( 'elements' )?.models ?? [];

	const tabsMenu = elements.find(
		( el: BackboneModel< ElementModel > ) => getElementTypeFromModel( el ) === TABS_MENU_ELEMENT_TYPE
	);

	const tabsContentArea = elements.find(
		( el: BackboneModel< ElementModel > ) => getElementTypeFromModel( el ) === TABS_CONTENT_AREA_ELEMENT_TYPE
	);

	const tabModels = tabsMenu?.get( 'elements' )?.models ?? [];
	const contentModels = tabsContentArea?.get( 'elements' )?.models ?? [];

	const tabIdMap = new Map< string, number >();
	tabModels.forEach( ( el: BackboneModel< ElementModel >, idx: number ) => {
		tabIdMap.set( el.get( 'id' ), idx );
	} );

	const contentIdMap = new Map< string, number >();
	contentModels.forEach( ( el: BackboneModel< ElementModel >, idx: number ) => {
		contentIdMap.set( el.get( 'id' ), idx );
	} );

	const rawDefaultActiveTab = settings[ 'default-active-tab' ] as number | { value?: number } | undefined;
	const defaultActiveTab =
		typeof rawDefaultActiveTab === 'object'
			? ( rawDefaultActiveTab as { value?: number } )?.value ?? 0
			: rawDefaultActiveTab ?? 0;

	return {
		tabsId: model.get( 'id' ),
		defaultActiveTab,
		getTabIndex: ( tabId: string ) => tabIdMap.get( tabId ) ?? -1,
		getTabContentIndex: ( contentId: string ) => contentIdMap.get( contentId ) ?? -1,
	};
}

export type ViewExtensions = Record< string, unknown >;

export const tabsExtensions: ViewExtensions = {
	getTabsRenderContext( this: TabsView ): TabsRenderContext {
		return createTabsContextFromView( this );
	},

	_buildTypeSpecificContext( this: TabsView, baseContext: TwigRenderContext ): TwigRenderContext {
		const tabsContext = this.getTabsRenderContext?.();

		if ( ! tabsContext ) {
			return baseContext;
		}

		const defaultActiveTabId = getTabId( tabsContext.tabsId, tabsContext.defaultActiveTab );

		return {
			...baseContext,
			default_active_tab_id: defaultActiveTabId,
		};
	},
};

export const tabExtensions: ViewExtensions = {
	_findTabsContext( this: TabsView ): TabsRenderContext | null {
		const parent = findParentWithTabsContext( this );
		return parent?.getTabsRenderContext?.() ?? null;
	},

	_buildTypeSpecificContext( this: TabsView, baseContext: TwigRenderContext ): TwigRenderContext {
		const tabsContext = this._findTabsContext?.();
		if ( ! tabsContext ) {
			return {
				...baseContext,
				is_active: false,
				tab_id: `orphan-${ this.model.get( 'id' ) }`,
				tab_content_id: `orphan-content-${ this.model.get( 'id' ) }`,
			};
		}

		const index = tabsContext.getTabIndex( this.model.get( 'id' ) );
		const isActive = tabsContext.defaultActiveTab === index;

		return {
			...baseContext,
			is_active: isActive,
			tab_id: getTabId( tabsContext.tabsId, index ),
			tab_content_id: getTabContentId( tabsContext.tabsId, index ),
		};
	},
};

export const tabContentExtensions: ViewExtensions = {
	_findTabsContext( this: TabsView ): TabsRenderContext | null {
		const parent = findParentWithTabsContext( this );
		return parent?.getTabsRenderContext?.() ?? null;
	},

	_buildTypeSpecificContext( this: TabsView, baseContext: TwigRenderContext ): TwigRenderContext {
		const tabsContext = this._findTabsContext?.();
		if ( ! tabsContext ) {
			return {
				...baseContext,
				is_active: false,
				tab_id: `orphan-${ this.model.get( 'id' ) }`,
				tab_content_id: `orphan-content-${ this.model.get( 'id' ) }`,
			};
		}

		const index = tabsContext.getTabContentIndex( this.model.get( 'id' ) );
		const isActive = tabsContext.defaultActiveTab === index;

		return {
			...baseContext,
			is_active: isActive,
			tab_id: getTabId( tabsContext.tabsId, index ),
			tab_content_id: getTabContentId( tabsContext.tabsId, index ),
		};
	},
};

export function getTabsViewExtensions( type: string ): ViewExtensions | undefined {
	const extensionsMap: Record< string, ViewExtensions > = {
		'e-tabs': tabsExtensions,
		'e-tab': tabExtensions,
		'e-tab-content': tabContentExtensions,
	};

	return extensionsMap[ type ];
}
