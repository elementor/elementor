import PropTypes from 'prop-types';
import { useState } from 'react';
import { PlannerChipsRow, SuggestionChip } from './styled-components';

const DEFAULT_SITE_BUILDER_STATE = {
	sessionStep: null,
	pageSuggestions: [],
	siteTypeSuggestions: [],
	plannerSteps: {},
};

const shouldShowPageNameSuggestions = ( sessionStep, pageSuggestions, plannerSteps ) => {
	const sessionStepValue = Number( sessionStep );

	if ( ! Number.isFinite( sessionStepValue ) ) {
		return false;
	}

	if ( sessionStepValue < ( plannerSteps?.WIREFRAMES ?? 3 ) ) {
		return false;
	}

	return pageSuggestions.length > 0;
};

const shouldShowSiteTypeSuggestions = ( sessionStep, siteTypeSuggestions, plannerSteps ) => {
	if ( null !== sessionStep && ( plannerSteps?.INIT ?? 0 ) !== sessionStep ) {
		return false;
	}

	return siteTypeSuggestions.length > 0;
};

const getDisplayChips = ( sessionStep, pageSuggestions, siteTypeSuggestions, plannerSteps ) => {
	if ( shouldShowSiteTypeSuggestions( sessionStep, siteTypeSuggestions, plannerSteps ) ) {
		return siteTypeSuggestions;
	}

	if ( shouldShowPageNameSuggestions( sessionStep, pageSuggestions, plannerSteps ) ) {
		return pageSuggestions;
	}

	return [];
};

const SuggestionChips = ( { onChipSelect, siteBuilderState = DEFAULT_SITE_BUILDER_STATE } ) => {
	const [ selectedChip, setSelectedChip ] = useState( null );
	const { sessionStep, pageSuggestions, siteTypeSuggestions, plannerSteps } = siteBuilderState;

	const displayChips = getDisplayChips( sessionStep, pageSuggestions, siteTypeSuggestions, plannerSteps );

	if ( 0 === displayChips.length ) {
		return null;
	}

	const handleChipClick = ( value ) => {
		setSelectedChip( value );
		onChipSelect( value );
	};
	return (
		<PlannerChipsRow>
			{ displayChips.map( ( suggestion ) => (
				<SuggestionChip
					key={ suggestion }
					label={ suggestion }
					onClick={ () => handleChipClick( suggestion ) }
					size="small"
					variant="outlined"
					selected={ selectedChip === suggestion }
				/>
			) ) }
		</PlannerChipsRow>
	);
};

SuggestionChips.propTypes = {
	siteBuilderState: PropTypes.object,
	onChipSelect: PropTypes.func.isRequired,
};

export default SuggestionChips;
