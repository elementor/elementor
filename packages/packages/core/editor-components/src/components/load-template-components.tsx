import { useEffect } from 'react';
import { useLoadedTemplates } from '@elementor/editor-templates';

import { loadComponentsAssets } from '../store/actions/load-components-assets';

export const LoadTemplateComponents = () => {
	const templates = useLoadedTemplates();

	useEffect( () => {
		loadComponentsAssets( templates.flatMap( ( elements ) => elements ?? [] ) );
	}, [ templates ] );

	return null;
};
