import { useCallback, useEffect, useState } from 'react';

import { FEATURE_LLMS_TXT } from '../analytics/agent-ready-events';
import { trackFeatureToggled, trackPostTypeToggled } from '../analytics/track-agent-ready-event';
import { fetchLlmsFile, revertLlmsContent, saveAgentReadySettings, saveLlmsContent, takeOverLlmsFile } from '../api';
import { LLMS_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

const PHYSICAL_FILE_REASON_CODE = 'physical_file';

const getIncludedPostTypeNames = ( postTypes ) => postTypes
	.filter( ( postType ) => postType.included )
	.map( ( postType ) => postType.name );

export const useLlmsSettings = ( initialState ) => {
	const { fileUrl } = initialState;

	const [ hasPhysicalFile, setHasPhysicalFile ] = useState( initialState.hasPhysicalFile );
	const [ unavailableReason, setUnavailableReason ] = useState( initialState.unavailableReason ?? null );
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

	const toggleEnabled = () => {
		trackFeatureToggled( { featureName: FEATURE_LLMS_TXT, isEnabled: ! isEnabled, hasConflict: hasPhysicalFile } );

		return saveSettings( ! isEnabled, postTypes );
	};

	const togglePostType = ( name ) => {
		const nextPostTypes = postTypes.map( ( postType ) => (
			postType.name === name ? { ...postType, included: ! postType.included } : postType
		) );

		trackPostTypeToggled( {
			featureName: FEATURE_LLMS_TXT,
			postType: name,
			isIncluded: nextPostTypes.find( ( postType ) => postType.name === name )?.included,
		} );

		return saveSettings( isEnabled, nextPostTypes );
	};

	const saveContent = ( nextContent ) => saveLlmsContent( nextContent ).then( () => {
		setIsManuallyEdited( true );
		refreshContent();
	} );

	const revertContent = () => revertLlmsContent().then( () => {
		setIsManuallyEdited( false );
		refreshContent();
	} );

	const takeOverFile = () => takeOverLlmsFile().then( () => {
		setHasPhysicalFile( false );
		setIsManuallyEdited( false );
		setIsEnabled( true );
		setUnavailableReason( ( reason ) => ( PHYSICAL_FILE_REASON_CODE === reason?.code ? null : reason ) );
	} );

	return {
		content,
		hasPhysicalFile,
		isEnabled: isEnabled && ! unavailableReason,
		isManuallyEdited,
		isSaving,
		saveError,
		postTypes,
		revertContent,
		saveContent,
		setIsEnabled,
		takeOverFile,
		toggleEnabled,
		togglePostType,
		unavailableReason,
	};
};
