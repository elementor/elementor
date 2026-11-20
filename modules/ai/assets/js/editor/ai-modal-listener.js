import ReactUtils from 'elementor-utils/react';
import React from 'react';
import App from './app';
import { AI_EVENTS, IMAGE_PROMPT_CATEGORIES, LOCATIONS } from './pages/form-media/constants';
import { getUiConfig } from './utils/editor-integration';

const handleAIModalEvent = ( event ) => {
	const { modalType, location, imageId, imageUrl, context, ...additionalParams } = event.detail || {};
	const targetLocation = location || modalType;
	const { colorScheme, isRTL } = getUiConfig();
	const rootElement = document.createElement( 'div' );

	document.body.append( rootElement );

	let unmountApp = () => {};

	const closeRoot = () => {
		unmountApp();
		rootElement.remove();
	};

	( { unmount: unmountApp } = ReactUtils.render(
		<App
			type="media"
			controlType="media"
			colorScheme={ colorScheme }
			isRTL={ isRTL }
			onClose={ () => {
				window.dispatchEvent( new CustomEvent( AI_EVENTS.MODAL_CLOSED, {
					detail: {
						success: false,
						error: 'User closed the modal manually without selecting an image',
					},
				} ) );
				closeRoot();
			} }
			getControlValue={ () => {
				if ( imageId || imageUrl ) {
					return {
						id: imageId ? parseInt( imageId, 10 ) : '',
						url: imageUrl || '',
						source: imageId ? 'id' : 'url',
					};
				}
			} }
			setControlValue={ ( image ) => {
				window.dispatchEvent( new CustomEvent( AI_EVENTS.MODAL_CLOSED, {
					detail: {
						modalType,
						location: targetLocation,
						context,
						success: true,
						...image,
					},
				} ) );
				closeRoot();
			} }
			additionalOptions={ {
				defaultImageType: Object.keys( IMAGE_PROMPT_CATEGORIES )[ 1 ],
				location: LOCATIONS[ targetLocation?.toUpperCase()?.replace( '-', '_' ) ] || targetLocation,
				isExternalTrigger: true,
				hideBackButton: true,
				withoutHistory: true,
				hideAiBetaLogo: true,
				...additionalParams,
			} }
		/>,
		rootElement,
	) );
};

window.addEventListener( AI_EVENTS.SHOW_MODAL, handleAIModalEvent );
