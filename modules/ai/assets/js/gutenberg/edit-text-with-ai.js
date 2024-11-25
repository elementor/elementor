import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { AiText } from './text-with-ai';
import { AIIcon } from '@elementor/icons';
import React from 'react';
const { ToolbarButton } = wp.components;
const { BlockControls } = wp.blockEditor;

export const EditTextWithAi = ( props ) => {
	const [ shouldRenderAiApp, setShouldRenderAiApp ] = useState( false );
	const BlockEdit = props.blockEdit;

	const supportedBlocks = [ 'core/paragraph', 'core/heading' ];

	if ( ! supportedBlocks.includes( props.name ) ) {
		return <BlockEdit { ...props } />;
	}

	if ( shouldRenderAiApp ) {
		return <AiText onClose={ () => setShouldRenderAiApp( false ) }
			blockName={ props.name }
			initialValue={ props.attributes.content ? String( props.attributes.content ) : '' }
			blockClientId={ props.clientId }
		/>;
	}

	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={ <AIIcon color="secondary" /> }
					label={ __( 'Edit with Elementor AI', 'elementor' ) }
					onClick={ () => setShouldRenderAiApp( true ) }
				/>
			</BlockControls>
			{ <BlockEdit { ...props } /> }
		</>
	);
};

EditTextWithAi.propTypes = {
	name: PropTypes.string,
	blockEdit: PropTypes.func,
	attributes: PropTypes.object,
	clientId: PropTypes.string,
};

