import * as React from 'react';
import { List } from '@elementor/ui';

import { CompositeWidgetItem } from './composite-widget-item';
import { useInsertableCompositeWidgets } from './use-insertable-composite-widgets';

export function CompositeWidgetsList() {
	const definitions = useInsertableCompositeWidgets();

	if ( ! definitions.length ) {
		return null;
	}

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
			{ definitions.map( ( definition ) => (
				<CompositeWidgetItem key={ definition.id } definition={ definition } />
			) ) }
		</List>
	);
}
