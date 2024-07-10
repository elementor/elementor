import useUserInfo from './hooks/use-user-info';
import useExcerptPrompt from './hooks/use-excerpt-prompt';
import React, { useRef, useState } from 'react';
import { useCallback, useEffect } from '@wordpress/element';
import App from './app';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useRequestIds } from './context/requests-ids';

const AIExcerpt = ( { onClose, currExcerpt, updateExcerpt, postTextualContent } ) => {
	const {
		isLoading: isLoadingUserInfo,
		isConnected,
		isGetStarted,
		connectUrl,
		fetchData,
		hasSubscription,
		credits,
		usagePercentage: initialUsagePercentage,
	} = useUserInfo( true );
	const { data: newExcerpt, error, send } = useExcerptPrompt( {
		result: currExcerpt,
		credits,
	} );
	const { updateUsagePercentage, usagePercentage } = useRequestIds();
	const [ isInitUsageDone, setIsInitUsageDone ] = useState( false );

	useEffect( () => {
		if ( ! isInitUsageDone && ( initialUsagePercentage || 0 === initialUsagePercentage ) ) {
			updateUsagePercentage( initialUsagePercentage );
			setIsInitUsageDone( true );
		}
	}, [ initialUsagePercentage, isInitUsageDone, updateUsagePercentage ] );

	const generateExcerptOnce = useRef( false );
	const [ isLoadingCombined, setIsLoadingCombined ] = useState( true );
	const initHook = () => ( {
		isLoading: isLoadingCombined,
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
			await send( { content: postTextualContent } ).finally( () => {
				setIsLoadingCombined( false );
			} );
		}
	}, [ postTextualContent, send ] );
	useEffect( () => {
		if ( ! generateExcerptOnce.current && isConnected && isGetStarted ) {
			fetchAiExcerpt();
		}
	}, [ fetchAiExcerpt, isConnected, isGetStarted ] );
	useEffect( () => {
		if ( ! isLoadingUserInfo && ( ! isConnected || ! isGetStarted ) ) {
			setIsLoadingCombined( false );
		}
	}, [ isConnected, isGetStarted, isLoadingUserInfo ] );
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
