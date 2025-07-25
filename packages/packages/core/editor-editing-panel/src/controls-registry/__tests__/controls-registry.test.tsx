import {
	booleanPropTypeUtil,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	keyValuePropTypeUtil,
	linkPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';

import { type ControlType, getPropTypeUtil } from '../controls-registry';

describe( 'Controls Registry', () => {
	describe( 'Registry Integrity', () => {
		const expectedPropTypeUtils = {
			image: imagePropTypeUtil,
			'svg-media': imageSrcPropTypeUtil,
			text: stringPropTypeUtil,
			textarea: stringPropTypeUtil,
			size: sizePropTypeUtil,
			select: stringPropTypeUtil,
			link: linkPropTypeUtil,
			url: stringPropTypeUtil,
			switch: booleanPropTypeUtil,
			repeatable: undefined,
			'key-value': keyValuePropTypeUtil,
		};

		it( 'should have correct propTypeUtil for each control type', () => {
			Object.entries( expectedPropTypeUtils ).forEach( ( [ controlType, expectedPropTypeUtil ] ) => {
				expect( getPropTypeUtil( controlType as ControlType ) ).toBe( expectedPropTypeUtil );
			} );
		} );
	} );
} );
