import {
	type CreateElementParams,
	createElements,
	type ElementID,
	generateElementId,
	getContainer,
	getWidgetsCache,
	removeElements,
	type V1ElementData,
} from '@elementor/editor-elements';
import {
	__privateRunCommand as runCommand,
	__privateUseListenTo as useListenTo,
	commandEndEvent,
} from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

export const MENU_ENTRY_TYPE = 'e-menu-entry';
export const MENU_SUBMENU_TYPE = 'e-menu-submenu';
export const MENU_SUBMENU_TRIGGER_TYPE = 'e-menu-submenu-trigger';

export type SubmenuPromotion = {
	title: string;
	content: string;
	ctaUrl: string;
};

type SubmenuEntitlement = {
	locked: boolean;
	promotion: SubmenuPromotion;
};

type SubmenuState = {
	submenuId: ElementID | null;
	locked: boolean;
	promotion: SubmenuPromotion | null;
};

const getEntitlement = (): SubmenuEntitlement | null =>
	( getWidgetsCache()?.[ MENU_ENTRY_TYPE ]?.meta?.submenu_entitlement as SubmenuEntitlement | undefined ) ?? null;

export const useSubmenu = ( entryId: ElementID | null ): SubmenuState =>
	useListenTo(
		[
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/history/undo' ),
			commandEndEvent( 'document/history/redo' ),
		],
		() => {
			const submenu = entryId
				? getContainer( entryId )?.children?.find(
						( child ) => child.model.get( 'elType' ) === MENU_SUBMENU_TYPE
				  )
				: null;
			const entitlement = getEntitlement();

			return {
				submenuId: submenu?.id ?? null,
				locked: entitlement?.locked ?? true,
				promotion: entitlement?.promotion ?? null,
			};
		},
		[ entryId ]
	);

export const getParentEntryId = ( elementId: ElementID ): ElementID | null => {
	const parent = getContainer( elementId )?.parent;

	return parent?.model.get( 'elType' ) === MENU_ENTRY_TYPE ? parent.id : null;
};

const buildSubmenuModels = (): V1ElementData[] => [
	{ elType: MENU_SUBMENU_TRIGGER_TYPE, id: generateElementId(), settings: {}, elements: [] },
	{ elType: MENU_SUBMENU_TYPE, id: generateElementId(), settings: {}, elements: [] },
];

export const enableSubmenu = ( entryId: ElementID ) => {
	const entry = getContainer( entryId );

	if ( ! entry ) {
		throw new Error( 'Menu entry not found' );
	}

	createElements( {
		title: __( 'Enable Submenu', 'elementor' ),
		elements: buildSubmenuModels().map( ( model ) => ( {
			container: entry,
			model: model as CreateElementParams[ 'model' ],
		} ) ),
	} );
};

export const disableSubmenu = ( entryId: ElementID ) => {
	const ids = ( getContainer( entryId )?.children ?? [] )
		.filter( ( child ) =>
			[ MENU_SUBMENU_TYPE, MENU_SUBMENU_TRIGGER_TYPE ].includes( child.model.get( 'elType' ) as string )
		)
		.map( ( child ) => child.id );

	if ( ids.length === 0 ) {
		return;
	}

	removeElements( { title: __( 'Disable Submenu', 'elementor' ), elementIds: ids } );
};

export const selectSubmenu = ( submenuId: ElementID ) => {
	const container = getContainer( submenuId );

	if ( container ) {
		runCommand( 'document/elements/select', { container } );
	}
};
