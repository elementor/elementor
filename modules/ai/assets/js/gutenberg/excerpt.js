import React from 'react';
import { useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import { __ } from '@wordpress/i18n';
import { AiLink, Icon } from './styles';
import AIExcerpt from '../editor/ai-excerpt';
import { useGutenbergPostText } from './post-text-utils';

const { useSelect, useDispatch } = wp.data;

const GenerateExcerptWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const currExcerpt = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostAttribute( 'excerpt' ),
		[],
	);
	const { editPost } = useDispatch( 'core/editor' );
	const postTextualContent = useGutenbergPostText();

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
				{ isOpen && <AIExcerpt onClose={ handleClose } currExcerpt={ currExcerpt }
					updateExcerpt={ ( res ) => editPost( { excerpt: res } ) } postTextualContent={ postTextualContent } /> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateExcerptWithAI;

