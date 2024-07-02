import useUserInfo from './hooks/use-user-info';
import useExcerptPrompt from './hooks/use-excerpt-prompt';
import React, { useRef } from 'react';
import { useCallback, useEffect } from '@wordpress/element';
import App from './app';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const AIExcerpt = ( { onClose, currExcerpt, updateExcerpt, postTextualContent } ) => {
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
	const generateExcerptOnce = useRef( false );
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
	const fetchAiExcerpt = useCallback( async () => {
		if ( send && postTextualContent ) {
			generateExcerptOnce.current = true;
			await send( { content: postTextualContent } );
		}
	}, [ postTextualContent, send ] );
	useEffect( () => {
		if ( ! generateExcerptOnce.current && isConnected && ! newExcerpt?.result ) {
			fetchAiExcerpt();
		}
	}, [ fetchAiExcerpt, isConnected, newExcerpt ] );
	const isRTL = elementorCommon.config.isRTL;

	return (
		<>
			<App
				type={ 'text' }
				getControlValue={ () => newExcerpt.result ? newExcerpt : currExcerpt }
				setControlValue={ ( value ) => updateExcerpt( value ) }
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
	updateExcerpt: PropTypes.func.isRequired,
	currExcerpt: PropTypes.string.isRequired,
	postTextualContent: PropTypes.string.isRequired,
};

export default AIExcerpt;
