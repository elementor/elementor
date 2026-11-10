import { type ElementID, getContainer, getElementSettings, getElementType } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { MENU_ITEM_ELEMENT_TYPE } from './use-actions';

type EntryItem = {
	itemId: ElementID | null;
	settings: Record< string, AnyTransformable | null >;
};

export const useEntryItem = ( entryId: ElementID ): EntryItem => {
	return useListenTo(
		[ commandEndEvent( 'document/elements/set-settings' ), commandEndEvent( 'document/elements/settings' ) ],
		() => {
			const item = getContainer( entryId )?.children?.find(
				( child ) => child.model.get( 'elType' ) === MENU_ITEM_ELEMENT_TYPE
			);

			return {
				itemId: item?.id ?? null,
				settings: ( item?.settings?.toJSON( { remove: [ 'default' ] } ) ?? {} ) as EntryItem[ 'settings' ],
			};
		},
		[ entryId ]
	);
};

const getEntrySettings = ( itemId: ElementID ): EntryItem[ 'settings' ] => {
	const propsSchema = getElementType( MENU_ITEM_ELEMENT_TYPE )?.propsSchema ?? {};

	return getElementSettings< AnyTransformable >( itemId, Object.keys( propsSchema ) );
};
