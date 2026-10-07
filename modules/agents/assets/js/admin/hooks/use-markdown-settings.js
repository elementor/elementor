import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import { saveAgentReadySettings } from '../api';
import { MARKDOWN_SETTINGS_KEY } from '../constants';

const getIncludedPostTypeNames = ( postTypes ) => postTypes
	.filter( ( postType ) => postType.included )
	.map( ( postType ) => postType.name );

const getSaveErrorMessage = ( reason ) => {
	if ( reason && 'string' === typeof reason.message && reason.message ) {
		return reason.message;
	}

	if ( 'string' === typeof reason && reason ) {
		return reason;
	}

	return __( 'Something went wrong. Please try again.', 'elementor' );
};

export const useMarkdownSettings = ( initialState ) => {
	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ postTypes, setPostTypes ] = useState( initialState.postTypes );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const saveSettings = ( nextIsEnabled, nextPostTypes ) => {
		const previousIsEnabled = isEnabled;
		const previousPostTypes = postTypes;

		setSaveError( '' );
		setIsSaving( true );
		setIsEnabled( nextIsEnabled );
		setPostTypes( nextPostTypes );

		return saveAgentReadySettings( {
			[ MARKDOWN_SETTINGS_KEY ]: {
				enabled: nextIsEnabled,
				post_types: getIncludedPostTypeNames( nextPostTypes ),
			},
		} )
			.catch( ( reason ) => {
				setIsEnabled( previousIsEnabled );
				setPostTypes( previousPostTypes );
				setSaveError( getSaveErrorMessage( reason ) );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const toggleEnabled = () => saveSettings( ! isEnabled, postTypes );

	const togglePostType = ( name ) => saveSettings(
		isEnabled,
		postTypes.map( ( postType ) => (
			postType.name === name ? { ...postType, included: ! postType.included } : postType
		) ),
	);

	return {
		isEnabled,
		isSaving,
		postTypes,
		saveError,
		toggleEnabled,
		togglePostType,
	};
};
