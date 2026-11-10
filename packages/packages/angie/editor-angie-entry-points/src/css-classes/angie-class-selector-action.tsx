import * as React from 'react';
import { useElement, useStyle } from '@elementor/editor-editing-panel';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { useProviders } from '@elementor/editor-styles-repository';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const useActiveClassLabel = (): string | null => {
	const { element } = useElement();
	const { id: activeClassId } = useStyle();
	const providers = useProviders();

	if ( ! activeClassId ) {
		return null;
	}

	for ( const provider of providers ) {
		const styles = provider.actions.all( { elementId: element.id } ) ?? [];
		const match = styles.find( ( style ) => style.id === activeClassId );

		if ( match?.label ) {
			return match.label;
		}
	}

	return null;
};

export const getAngieClassSelectorPrompt = ( elementId: string, classLabel: string ) =>
	`At element ${ elementId }, class "${ classLabel }", I want: `;

export const AngieClassSelectorAction = () => {
	const { element } = useElement();
	const activeClassLabel = useActiveClassLabel();
	const label = __( 'Generate with Angie', 'elementor' );

	if ( ! activeClassLabel ) {
		return null;
	}

	const prompt = getAngieClassSelectorPrompt( element.id, activeClassLabel );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
