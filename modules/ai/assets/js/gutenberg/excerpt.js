import React, { useRef } from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';
import useUserInfo from '../editor/hooks/use-user-info';
import useExcerptPrompt from '../editor/hooks/use-excerpt-prompt';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import { __ } from '@wordpress/i18n';
import { useGutenbergPostText } from './post-text-utils';
import { AiLink, Icon } from './styles';

const { useSelect, useDispatch } = wp.data;

const AIExcerpt = ( { onClose } ) => {
	const { editPost } = useDispatch( 'core/editor' );
	const currExcerpt = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostAttribute( 'excerpt' ),
		[],
	);
	const postTextualContent = useGutenbergPostText();
	const {
		isLoading: isLoadingUserInfo,
		isConnected,
		isGetStarted,
		connectUrl,
		fetchData,
		hasSubscription,
		credits,
		usagePercentage,
	} = useUserInfo( true );
	const { data: newExcerpt, isLoading: isLoadingExcerpt, error, send } = useExcerptPrompt( {
		result: currExcerpt,
		credits,
	} );
	const isLoading = isLoadingExcerpt || isLoadingUserInfo;
	const initHook = () => ( {
		isLoading,
		isConnected,
		isGetStarted,
		connectUrl,
		fetchData,
		hasSubscription,
		credits,
		usagePercentage,
	} );
	const generateExcerptOnce = useRef( false );
	const fetchAiExcerpt = useCallback( async () => {
		if ( send && postTextualContent ) {
			generateExcerptOnce.current = true;
			send( { content: postTextualContent } );
		}
	}, [ postTextualContent, send ] );
	useEffect( () => {
		if ( ! generateExcerptOnce.current && isConnected ) {
			fetchAiExcerpt();
		}
	}, [ fetchAiExcerpt, isConnected ] );
	const isRTL = elementorCommon.config.isRTL;

	return (
		<>
			<App
				type={ 'text' }
				getControlValue={ () => newExcerpt.result ? newExcerpt : currExcerpt }
				setControlValue={ ( value ) => {
					editPost( { excerpt: value } );
				} }
				onClose={ onClose }
				isRTL={ isRTL }
				additionalOptions={ {
					loadingTitle: __( 'Analyzing your post to craft an excerpt...', 'elementor' ),
					useCustomInit: initHook,
					initError: error,
					initRetry: fetchAiExcerpt,
				} }
			/>
		</>
	);
};

AIExcerpt.propTypes = {
	onClose: PropTypes.func.isRequired,
};

const GenerateExcerptWithAI = () => {
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
				{ isOpen && <AIExcerpt onClose={ handleClose } /> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateExcerptWithAI;

