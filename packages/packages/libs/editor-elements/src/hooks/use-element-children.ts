import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { findChildRecursive, getElementChildren, type ModelResult } from '../sync/model-utils';
import { type V1ElementEditorSettingsProps } from '../sync/types';
import { type ElementID } from '../types';

export type ElementModel = {
	id: string;
	editorSettings: V1ElementEditorSettingsProps;
};

export type ElementChildren = Record< string, ElementModel[] >;

function toElementModel( { model }: ModelResult ): ElementModel {
	return {
		id: model.get( 'id' ) as string,
		editorSettings: model.get( 'editor_settings' ) ?? {},
	};
}

export type UseElementChildrenOptions = {
	/**
	 * Let the element itself match a requested parent type. Off by default, because
	 * `findChildRecursive` only inspects descendants and existing callers rely on that: an element
	 * whose repeater items are its own direct children (e.g. `e-accordion` -> `e-accordion-item`)
	 * has no intermediate wrapper to look for, while one that keeps them in a sub-container
	 * (e.g. `e-tabs` -> `e-tabs-menu` -> `e-tab`) must not match itself.
	 */
	includeSelfAsParent?: boolean;
};

export function useElementChildren< T extends ElementChildren >(
	elementId: ElementID,
	childrenTypes: Record< string, string >,
	{ includeSelfAsParent = false }: UseElementChildrenOptions = {}
): T {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/update' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const container = getContainer( elementId );
			const model = container?.model;

			if ( ! model ) {
				return {} as ElementChildren;
			}

			const elementChildren = Object.entries( childrenTypes ).reduce( ( acc, [ parentType, childType ] ) => {
				const parent =
					includeSelfAsParent && model.get( 'elType' ) === parentType
						? { model }
						: findChildRecursive( model, ( m ) => m.get( 'elType' ) === parentType );

				if ( ! parent ) {
					acc[ childType ] = [];
					return acc;
				}

				const children = getElementChildren( parent.model, ( m ) => m.get( 'elType' ) === childType );

				acc[ childType ] = children.map( toElementModel );

				return acc;
			}, {} as ElementChildren );

			return elementChildren;
		},
		[ elementId ]
	) as T;
}
