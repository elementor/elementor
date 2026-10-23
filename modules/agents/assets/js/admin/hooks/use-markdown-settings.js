import { useState } from 'react';

import { FEATURE_MARKDOWN, FEATURE_MARKDOWN_CONTENT } from '../analytics/agent-ready-events';
import { trackFeatureToggled, trackPostTypeToggled } from '../analytics/track-agent-ready-event';
import { saveAgentReadySettings } from '../api';
import { MARKDOWN_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

const getIncludedPostTypeNames = ( postTypes ) => postTypes
	.filter( ( postType ) => postType.included )
	.map( ( postType ) => postType.name );

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

	const toggleEnabled = () => {
		trackFeatureToggled( { featureName: FEATURE_MARKDOWN_CONTENT, isEnabled: ! isEnabled, hasConflict: false } );

		return saveSettings( ! isEnabled, postTypes );
	};

	const togglePostType = ( name ) => {
		const nextPostTypes = postTypes.map( ( postType ) => (
			postType.name === name ? { ...postType, included: ! postType.included } : postType
		) );

		trackPostTypeToggled( {
			featureName: FEATURE_MARKDOWN,
			postType: name,
			isIncluded: nextPostTypes.find( ( postType ) => postType.name === name )?.included,
		} );

		return saveSettings( isEnabled, nextPostTypes );
	};

	return {
		isEnabled,
		isSaving,
		postTypes,
		saveError,
		setIsEnabled,
		toggleEnabled,
		togglePostType,
	};
};
