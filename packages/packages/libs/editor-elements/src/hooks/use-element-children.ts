import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { type ElementOrModel, findChildRecursive, getElementChildren } from '../sync/get-element-or-model';
import { type V1Element, type V1ElementEditorSettingsProps } from '../sync/types';
import { type ElementID } from '../types';

export type ElementModel = {
	id: string;
	editorSettings: V1ElementEditorSettingsProps;
	container: V1Element | null;
};

export type ElementChildren = Record< string, ElementModel[] >;

function toElementModel( { container, model }: ElementOrModel ): ElementModel {
	return {
		id: model.get( 'id' ) as string,
		editorSettings: model.get( 'editor_settings' ) ?? {},
		container,
	};
}

export function useElementChildren< T extends ElementChildren >(
	elementId: ElementID,
	childrenTypes: Record< string, string >
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
				const parent = findChildRecursive( container, model, ( m ) => m.get( 'elType' ) === parentType );

				if ( ! parent ) {
					acc[ childType ] = [];
					return acc;
				}

				const children = getElementChildren(
					parent.container,
					parent.model,
					( m ) => m.get( 'elType' ) === childType
				);

				acc[ childType ] = children.map( toElementModel );

				return acc;
			}, {} as ElementChildren );

			return elementChildren;
		},
		[ elementId ]
	) as T;
}
