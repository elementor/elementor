import { useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import { AiLink, Icon } from './styles';
import { __ } from '@wordpress/i18n';
import React from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';

const { useDispatch, useSelect } = wp.data;
const { createBlock } = wp.blocks;

export const AiText = ( { onClose, blockName, initialValue = '', blockClientId = '' } ) => {
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
		const foundParagraphBlock = currentBlocks.find( ( block ) => blockName === block.name && blockClientId === block.clientId );
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
				getControlValue={ () => {
					return initialValue;
				} }
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
	initialValue: PropTypes.string,
	blockClientId: PropTypes.string,
};

export const GenerateTextWithAi = ( { blockName, blockClientId } ) => {
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
				{ isOpen && <AiText onClose={ handleClose } blockName={ blockName } blockClientId={ blockClientId } /> }
			</RequestIdsProvider>
		</div> );
};

GenerateTextWithAi.propTypes = {
	blockName: PropTypes.string.isRequired,
	blockClientId: PropTypes.string.isRequired,
};
