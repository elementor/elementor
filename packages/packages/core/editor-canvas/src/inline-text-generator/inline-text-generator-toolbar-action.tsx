import * as React from 'react';
import { type InlineEditorToolbarActionContext } from '@elementor/editor-controls';
import { isAngieAvailable } from '@elementor/editor-mcp';
import { AngieIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { snapshotActiveInlineTarget } from './active-inline-target';
import { openInlineTextGeneratorWithPrompt } from './boot-inline-text-generator-sdk';

const GENERATE_WITH_ANGIE_LABEL = __( 'Generate with Angie', 'elementor' );

export const InlineTextGeneratorToolbarAction = ( context: InlineEditorToolbarActionContext ) => {
	if ( ! isAngieAvailable() ) {
		return null;
	}

	const handleClick = () => {
		snapshotActiveInlineTarget( context );
		void openInlineTextGeneratorWithPrompt().catch( () => undefined );
	};

	return (
		<Tooltip title={ GENERATE_WITH_ANGIE_LABEL } placement="top">
			<IconButton aria-label={ GENERATE_WITH_ANGIE_LABEL } onClick={ handleClick } size="tiny">
				<AngieIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
