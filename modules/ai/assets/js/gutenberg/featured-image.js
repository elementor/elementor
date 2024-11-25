import { RequestIdsProvider } from '../editor/context/requests-ids';
import { __ } from '@wordpress/i18n';
import { AIMediaGenerateApp } from '../media-library/components';
import { useGutenbergPostText } from './post-text-utils';
import { AiLink, Icon } from './styles';
import { useState } from '@wordpress/element';
import useFeaturedImagePrompt from '../editor/hooks/use-featured-image-prompt';

const { useDispatch } = wp.data;

const GenerateFeaturedImageWithAI = () => {
	const FEATURED_IMAGE_RATIO = '4:3';
	const { editPost } = useDispatch( 'core/editor' );

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
					setControlValue={ ( value ) => {
						editPost( { featured_media: value?.id } );
					} }
					initialSettings={ { aspectRatio: FEATURED_IMAGE_RATIO } }
				/> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateFeaturedImageWithAI;
