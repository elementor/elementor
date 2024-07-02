import { useEffect, useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import { AiLink, Icon } from './styles';
import { __ } from '@wordpress/i18n';
import React from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';

import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

const AiText = ( { onClose } ) => {
	// Const { replaceBlocks, insertBlocks } = useDispatch( 'core/block-editor' )//
	const insertTextIntoParagraph = ( text ) => {
		if ( paragraphBlock ) {
			// Update the paragraph block with new content
			const updatedBlock = {
				...paragraphBlock,
				attributes: {
					...paragraphBlock.attributes,
					content: text,
				},
			};
			// Replace the block with the updated block
			replaceBlocks( paragraphBlock.clientId, updatedBlock );
		} else {
			// If no paragraph block is found, create a new one
			const newBlock = createBlock( 'core/paragraph', { content: text } );
			insertBlocks( newBlock );
		}
	};

	const isRTL = elementorCommon.config.isRTL;

	const { paragraphBlock } = useSelect( ( ) => {
		const currentBlocks = wp.data.select( 'core/block-editor' )?.getBlocks();
		const foundParagraphBlock = currentBlocks.find( ( block ) => 'core/paragraph' === block.name );
		return {
			blocks: currentBlocks,
			paragraphBlock: foundParagraphBlock,
		};
	}, [] );

	return (
		<>
			<App
				type={ 'text' }
				getControlValue={ () => {} }
				setControlValue={ ( value ) => {
					insertTextIntoParagraph( value );
				} }
				onClose={ onClose }
				isRTL={ isRTL }
				additionalOptions={ { requestType: 'get-text-gutenberg' } }
			/>
		</>
	);
};

AiText.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export const GenerateTextWithAi = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		setIsOpen( false );
	};

	return (
		<div style={ { paddingBottom: '0.6em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<AiLink onClick={ handleButtonClick }>{ __( 'Generate with Elementor AI', 'elementor' ) }</AiLink>
				{ isOpen && <AiText onClose={ handleClose } /> }
			</RequestIdsProvider>
		</div> );
};
