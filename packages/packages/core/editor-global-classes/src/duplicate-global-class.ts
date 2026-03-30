import { __getState as getState } from '@elementor/store';

import { globalClassesStylesProvider } from './global-classes-styles-provider';
import { selectGlobalClasses } from './store';
import { trackGlobalClasses } from './utils/tracking';

function getUniqueDuplicateLabel( originalLabel: string, existingLabels: string[] ): string {
	let newLabel = `copy-of-${ originalLabel }`;
	let counter = 2;
	while ( existingLabels.includes( newLabel ) ) {
		newLabel = `copy-of-${ originalLabel }-${ counter }`;
		counter++;
	}
	return newLabel;
}

export function duplicateGlobalClass( id: string ): void {
	const styleDef = globalClassesStylesProvider.actions.get?.( id );
	if ( ! styleDef ) {
		return;
	}

	const classes = selectGlobalClasses( getState() );
	const existingLabels = Object.values( classes ).map( ( style ) => style.label );
	const newLabel = getUniqueDuplicateLabel( styleDef.label, existingLabels );
	const newId = globalClassesStylesProvider.actions.create?.( newLabel, styleDef.variants );

	if ( ! newId ) {
		return;
	}

	trackGlobalClasses( {
		event: 'classCreated',
		classId: newId,
		source: 'created',
		classTitle: newLabel,
	} );
}
