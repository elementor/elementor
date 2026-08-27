import { type V1Element } from '@elementor/editor-elements';

import { type ElementSnapshotNode } from '../types';

export function buildSnapshotTree( elements: V1Element[] ): ElementSnapshotNode[] {
	if ( elements.length === 0 ) {
		return [];
	}

	const root = elements[ 0 ];
	const children = root.children ?? [];

	return children.map( toSnapshot );
}

function toSnapshot( element: V1Element ): ElementSnapshotNode {
	const model = element.model;
	const settings = element.settings?.toJSON?.() ?? {};

	return {
		id: element.id,
		elType: ( model.get( 'elType' ) as string ) ?? '',
		widgetType: model.get( 'widgetType' ) as string | undefined,
		settings: settings as Record< string, unknown >,
		elements: ( element.children ?? [] ).map( toSnapshot ),
	};
}
