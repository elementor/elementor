import { useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import { AiLink, Icon } from './styles';
import { __ } from '@wordpress/i18n';
import React from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';

const { useDispatch, useSelect } = wp.data;
const { createBlock } = wp.blocks;

const AiText = ( { onClose, blockName } ) => {
	const { replaceBlocks, insertBlocks } = useDispatch( 'core/block-editor' );
	const insertTextIntoParagraph = ( text ) => {
		if ( paragraphBlock ) {
			const updatedBlock = {
				...paragraphBlock,
				attributes: {
					...paragraphBlock.attributes,
					content: text,
				},
			};
			replaceBlocks( paragraphBlock.clientId, updatedBlock );
		} else {
			const newBlock = createBlock( blockName, { content: text } );
			insertBlocks( newBlock );
		}
	};

	const isRTL = elementorCommon.config.isRTL;

	const { paragraphBlock } = useSelect( ( ) => {
		const currentBlocks = wp.data.select( 'core/block-editor' )?.getBlocks();
		const foundParagraphBlock = currentBlocks.find( ( block ) => blockName === block.name );
		return {
			blocks: currentBlocks,
			paragraphBlock: foundParagraphBlock,
		};
	}, [] );

	const appType = 'core/paragraph' === blockName ? 'textarea' : 'text';

	return (
		<>
			<App
				type={ appType }
				getControlValue={ () => {} }
				setControlValue={ ( value ) => {
					insertTextIntoParagraph( value );
				} }
				onClose={ onClose }
				isRTL={ isRTL }
				additionalOptions={ { hideAiContext: true } }
			/>
		</>
	);
};

AiText.propTypes = {
	onClose: PropTypes.func.isRequired,
	blockName: PropTypes.string.isRequired,
};

export const GenerateTextWithAi = ( { blockName } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		setIsOpen( false );
	};

	return (
		<div style={ { paddingTop: '0.6em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<AiLink onClick={ handleButtonClick }>{ __( 'Generate with Elementor AI', 'elementor' ) }</AiLink>
				{ isOpen && <AiText onClose={ handleClose } blockName={ blockName } /> }
			</RequestIdsProvider>
		</div> );
};

GenerateTextWithAi.propTypes = {
	blockName: PropTypes.string.isRequired,
};
