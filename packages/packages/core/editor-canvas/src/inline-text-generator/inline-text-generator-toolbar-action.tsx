import * as React from 'react';
import { useRef } from 'react';
import { type InlineEditorToolbarActionContext } from '@elementor/editor-controls';
import { AngieIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { snapshotActiveInlineTarget } from './active-inline-target';
import { openInlineTextGeneratorWithPrompt } from './boot-inline-text-generator-sdk';

const GENERATE_WITH_ANGIE_LABEL = __( 'Generate with Angie', 'elementor' );

export const InlineTextGeneratorToolbarAction = ( context: InlineEditorToolbarActionContext ) => {
	const anchorRef = useRef< HTMLButtonElement >( null );

	const handleClick = () => {
		snapshotActiveInlineTarget( context );
		void openInlineTextGeneratorWithPrompt( anchorRef.current ?? undefined ).catch( () => undefined );
	};

	return (
		<Tooltip title={ GENERATE_WITH_ANGIE_LABEL } placement="top">
			<IconButton
				ref={ anchorRef }
				aria-label={ GENERATE_WITH_ANGIE_LABEL }
				onClick={ handleClick }
				size="tiny"
			>
				<AngieIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
