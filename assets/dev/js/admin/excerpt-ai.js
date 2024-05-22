import React, { useEffect, useRef } from 'react';
import App from '../../../../modules/ai/assets/js/editor/app';
import PropTypes from 'prop-types';
import useUserInfo from '../../../../modules/ai/assets/js/editor/hooks/use-user-info';
import useTextPrompt from '../../../../modules/ai/assets/js/editor/hooks/use-text-prompt';

const { useSelect, useDispatch } = wp.data;
// TODO: validate requestId, error, and subscription
const GenerateExcerptWithAI = ( { onClose } ) => {
	const { editPost } = useDispatch( 'core/editor' );
	const currExcerpt = useSelect(
		( select ) => select( 'core/editor' ).getEditedPostAttribute( 'excerpt' ),
		[],
	);
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
	const { data: newExcerpt, isLoading: isLoadingExcerpt, error, setResult, reset, send, sendUsageData } = useTextPrompt( {
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
	useEffect( () => {
		if ( ! generateExcerptOnce.current && send ) {
			generateExcerptOnce.current = true;
			send( { prompt: currExcerpt } );
		}
	}, [ currExcerpt, send ] );

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
					initRetry: () => send( { prompt: currExcerpt } ),
				} }
			/>
		</>
	);
};

GenerateExcerptWithAI.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default GenerateExcerptWithAI;
