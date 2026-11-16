import * as React from 'react';
import { type ControlHeaderProps } from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

export const AngieControlHeaderAction = ( { elementId, controlType, bind, path }: ControlHeaderProps ) => {
	const { element: selectedElement } = useSelectedElement();
	const targetElementId = elementId ?? selectedElement?.id;

	if ( ! targetElementId ) {
		return null;
	}

	const prompt = ANGIE_PROMPTS.controlHeader( {
		elementId: targetElementId,
		controlType,
		bind,
		path,
	} );

	if ( ! prompt ) {
		return null;
	}

	return <AngieGenerateButton prompt={ prompt } />;
};
