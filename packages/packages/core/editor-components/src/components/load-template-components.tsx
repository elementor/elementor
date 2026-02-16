import { useMemo } from 'react';
import { useLoadedTemplates } from '@elementor/editor-templates';

import { loadComponentsAssets } from '../store/actions/load-components-assets';

export const LoadTemplateComponents = () => {
	const templates = useLoadedTemplates();

	useMemo( () => {
		loadComponentsAssets( templates.flatMap( ( doc ) => doc.elements ?? [] ) );
	}, [ templates ] );

	return null;
};
