import { useCallback, useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { fetchLlmsFile, saveAgentReadySettings, saveLlmsContent } from '../api';
import { LLMS_SETTINGS_KEY } from '../constants';

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

export const useLlmsSettings = ( initialState ) => {
	const { fileUrl, hasPhysicalFile } = initialState;

	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ isManuallyEdited, setIsManuallyEdited ] = useState( initialState.isManuallyEdited );
	const [ postTypes, setPostTypes ] = useState( initialState.postTypes );
	const [ content, setContent ] = useState( '' );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const refreshContent = useCallback( () => {
		if ( hasPhysicalFile ) {
			return;
		}

		fetchLlmsFile( fileUrl )
			.then( setContent )
			.catch( () => setContent( '' ) );
	}, [ fileUrl, hasPhysicalFile ] );

	useEffect( () => {
		refreshContent();
	}, [ refreshContent ] );

	const saveSettings = ( nextIsEnabled, nextPostTypes ) => {
		const previousIsEnabled = isEnabled;
		const previousPostTypes = postTypes;

		setSaveError( '' );
		setIsSaving( true );
		setIsEnabled( nextIsEnabled );
		setPostTypes( nextPostTypes );

		return saveAgentReadySettings( {
			[ LLMS_SETTINGS_KEY ]: {
				enabled: nextIsEnabled,
				post_types: getIncludedPostTypeNames( nextPostTypes ),
			},
		} )
			.then( refreshContent )
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

	const saveContent = ( nextContent ) => saveLlmsContent( nextContent ).then( () => {
		setIsManuallyEdited( true );
		refreshContent();
	} );

	return {
		content,
		hasPhysicalFile,
		isEnabled: isEnabled && ! hasPhysicalFile,
		isManuallyEdited,
		isSaving,
		saveError,
		postTypes,
		saveContent,
		toggleEnabled,
		togglePostType,
	};
};
