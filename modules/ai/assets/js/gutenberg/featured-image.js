import { RequestIdsProvider } from '../editor/context/requests-ids';
import { __ } from '@wordpress/i18n';
import { AIMediaGenerateApp } from '../media-library/componenets';
import { useGutenbergPostText } from './post-text-utils';
import { AiLink, Icon } from './styles';
import { useState } from '@wordpress/element';
import useFeaturedImagePrompt from '../editor/hooks/use-featured-image-prompt';

const GenerateFeaturedImageWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		setIsOpen( false );
	};

	const postTextualContent = useGutenbergPostText();

	return (
		<div style={ { paddingTop: '0.6em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<AiLink onClick={ handleButtonClick }>{ __( 'Generate with Elementor AI', 'elementor' ) }</AiLink>
				{ isOpen && <AIMediaGenerateApp
					onClose={ handleClose }
					predefinedPrompt={ postTextualContent }
					textToImageHook={ useFeaturedImagePrompt }
				/> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateFeaturedImageWithAI;

