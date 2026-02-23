import { useEffect } from 'react';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';

import { addTemplateStyles } from './templates-styles-provider';
import { useLoadedTemplates } from './use-loaded-templates';

export const RenderTemplateStyles = () => {
	const templates = useLoadedTemplates();

	useEffect( () => {
		const styles = templates.flatMap( extractStylesFromDocument );

		addTemplateStyles( styles );
	}, [ templates ] );

	return null;
};

function extractStylesFromDocument( elements: V1ElementData[] ): StyleDefinition[] {
	if ( ! elements.length ) {
		return [];
	}

	return elements.flatMap( extractStylesFromElement );
}

function extractStylesFromElement( element: V1ElementData ): StyleDefinition[] {
	return [
		...Object.values( element.styles ?? {} ),
		...( element.elements ?? [] ).flatMap( extractStylesFromElement ),
	];
}
