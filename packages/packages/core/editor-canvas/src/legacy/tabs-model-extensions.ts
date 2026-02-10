import { htmlV2PropTypeUtil } from '@elementor/editor-props';

import { type ModelExtensions } from './create-nested-templated-element-type';
import { registerModelExtensions } from './init-legacy-views';
import { type BackboneModel, type ElementModel } from './types';

const tabModelExtensions: ModelExtensions = {
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
				paragraph: htmlV2PropTypeUtil.create( { content: `Tab ${ position }`, children: [] } ),
			},
		};

		return [ updatedParagraph, ...elements.slice( 1 ) ];
	},
};

export function initTabsModelExtensions() {
	registerModelExtensions( 'e-tab', tabModelExtensions );
}
