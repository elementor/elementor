import * as React from 'react';
import { type ControlHeaderProps } from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const BACKGROUND_PROP_KEY = 'background';

type PromptSource = Pick< ControlHeaderProps, 'controlType' | 'bind' | 'path' > & { elementId: string };

export const getAngieControlHeaderPrompt = ( { elementId, controlType, bind, path }: PromptSource ) => {
	if ( 'inline-editing' === controlType ) {
		return `At element ${ elementId } I want: `;
	}

	if ( 'image' === controlType && path.includes( BACKGROUND_PROP_KEY ) ) {
		return `At element ${ elementId }, background image, I want: `;
	}

	if ( 'image' === controlType ) {
		if ( 'image' === bind ) {
			return `At element ${ elementId }, image, I want: `;
		}

		return `At element ${ elementId }, image "${ bind }", I want: `;
	}

	return null;
};

export const AngieControlHeaderAction = ( { elementId, controlType, bind, path }: ControlHeaderProps ) => {
	const { element: selectedElement } = useSelectedElement();
	const targetElementId = elementId ?? selectedElement?.id;
	const label = __( 'Generate with Angie', 'elementor' );

	if ( ! targetElementId ) {
		return null;
	}

	const prompt = getAngieControlHeaderPrompt( { elementId: targetElementId, controlType, bind, path } );

	if ( ! prompt ) {
		return null;
	}

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
