import * as React from 'react';
import { useEffect } from 'react';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { loadDefaultStyles } from '../load-default-styles';

export function PopulateStore() {
	useEffect( () => {
		void loadDefaultStyles();

		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			await loadDefaultStyles();
		} );
	}, [] );

	return null;
}
