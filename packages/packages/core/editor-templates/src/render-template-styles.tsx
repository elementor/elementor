import { useEffect } from 'react';
import { type Document } from '@elementor/editor-documents';
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

function extractStylesFromDocument( document: Document ): StyleDefinition[] {
	if ( ! document.elements?.length ) {
		return [];
	}

	return document.elements.flatMap( extractStylesFromElement );
}

function extractStylesFromElement( element: V1ElementData ): StyleDefinition[] {
	return [
		...Object.values( element.styles ?? {} ),
		...( element.elements ?? [] ).flatMap( extractStylesFromElement ),
	];
}
