import * as React from 'react';
import { useEffect } from 'react';
import { isHandlingTemplateStyles, useLoadedTemplates } from '@elementor/editor-templates';

import { loadComponentsAssets } from '../store/actions/load-components-assets';

export const LoadTemplateComponents = () => {
	if ( isHandlingTemplateStyles() ) {
		return <LoadTemplateComponentsInternal />;
	}

	return null;
};

function LoadTemplateComponentsInternal() {
	const templates = useLoadedTemplates();

	useEffect( () => {
		loadComponentsAssets( templates.flatMap( ( elements ) => elements ?? [] ) );
	}, [ templates ] );

	return null;
}
