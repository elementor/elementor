import { findElementById, type V1ElementData } from '@elementor/editor-elements';

import { type OverridableProps } from '../types';

export function applyOverridablesToElements(
	elements: V1ElementData[],
	overridableProps: OverridableProps
): void {
	Object.values( overridableProps.props ).forEach( ( prop ) => {
		const element = findElementById( elements, prop.elementId );

		if ( ! element?.settings ) {
			return;
		}

		element.settings[ prop.propKey ] = {
			$$type: 'overridable',
			value: {
				override_key: prop.overrideKey,
				origin_value: element.settings[ prop.propKey ],
			},
		};
	} );
}
