import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { type ElementID } from '../types';

type ElementPropValue = {
	id: string;
};

export type ElementChildren = Record< string, ElementPropValue[] >;

export function useElementChildren< T extends ElementChildren >(
	elementId: ElementID,
	childrenTypes: ( keyof T & string )[]
): ElementChildren {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/select' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/update' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const container = getContainer( elementId );

			const children = container?.children || [];

			return childrenTypes.reduce( ( acc, type ) => {
				const childElements = children
					.filter( ( child ) => child.model?.get( 'widgetType' ) === type )
					.map( ( child ) => ( {
						id: child.id,
					} ) );

				if ( childElements ) {
					acc[ type ] = childElements;
				}

				return acc;
			}, {} as ElementChildren );
		},
		[ elementId ]
	);
}

// const tabsLink = {
// 	settings: {
// 		'tab-link': {
// 			id: {
// 				$$type: 'string',
// 				value: 'tab-pane',
// 			},
// 		},
// 	},
// };
// import {
// 	elementPropTypeUtils,
// 	type ElementPropValue,
// 	stringPropTypeUtil,
// 	type StringPropValue,
// } from '@elementor/editor-props';
// import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

// import { getContainer } from '../sync/get-container';
// import { type ElementID } from '../types';

// export type ElementChildren = {
// 	$$type: 'children';
// 	value: ElementPropValue[];
// };

// export function useElementChildren( elementId: ElementID, childrenType: string ): ElementChildren {
// 	return useListenTo(
// 		[
// 			v1ReadyEvent(),
// 			commandEndEvent( 'document/elements/select' ),
// 			commandEndEvent( 'document/elements/create' ),
// 			commandEndEvent( 'document/elements/delete' ),
// 			commandEndEvent( 'document/elements/update' ),
// 			commandEndEvent( 'document/elements/set-settings' ),
// 		],
// 		() => {
// 			const container = getContainer( elementId );

// 			const children = container?.children
// 				?.filter( ( child ) => child.model?.get( 'widgetType' ) === childrenType )
// 				.map( ( child ) =>
// 					elementPropTypeUtils.create( {
// 						id: stringPropTypeUtil.create( child.id ),
// 						title: child.settings.get( 'title' ) as StringPropValue,
// 					} )
// 				);

// 			return {
// 				$$type: 'children',
// 				value: children || [],
// 			};
// 		},
// 		[ elementId ]
// 	);
// }

// const tabsLink = {
// 	settings: {
// 		'tab-link': {
// 			id: {
// 				$$type: 'string',
// 				value: 'tab-pane',
// 			},
// 		},
// 	},
// };
