import { htmlPropTypeUtil } from '@elementor/editor-props';

import { type BackboneModel, type ElementModel } from './types';

export type ModelExtensions = Record< string, unknown >;

export const tabModelExtensions: ModelExtensions = {
	modifyDefaultChildren( this: BackboneModel< ElementModel >, elements: unknown[] ): unknown[] {
		if ( ! Array.isArray( elements ) || elements.length === 0 ) {
			return elements;
		}

		const [ paragraph ] = elements;
		const position = this.get( 'editor_settings' )?.initial_position;

		if ( ! position || ! paragraph || typeof paragraph !== 'object' ) {
			return elements;
		}

		const paragraphElement = paragraph as { settings?: { paragraph?: unknown } };

		const updatedParagraph = {
			...paragraphElement,
			settings: {
				...paragraphElement.settings,
				paragraph: htmlPropTypeUtil.create( `Tab ${ position }` ),
			},
		};

		return [ updatedParagraph, ...elements.slice( 1 ) ];
	},
};

export function getTabsModelExtensions( type: string ): ModelExtensions | undefined {
	const extensionsMap: Record< string, ModelExtensions > = {
		'e-tab': tabModelExtensions,
	};

	return extensionsMap[ type ];
}
