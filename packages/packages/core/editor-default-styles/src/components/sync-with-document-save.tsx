import * as React from 'react';
import { useEffect } from 'react';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { saveDefaultStyles } from '../save-default-styles';

export function SyncWithDocumentSave() {
	useEffect( () => {
		registerDataHook( 'dependency', 'document/save/save', ( args ) => {
			const context = args.status === 'publish' ? 'frontend' : 'preview';
			void saveDefaultStyles( context );

			return true;
		} );
	}, [] );

	return null;
}
