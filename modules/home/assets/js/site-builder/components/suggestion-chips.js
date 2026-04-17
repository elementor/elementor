import PropTypes from 'prop-types';
import { useState } from 'react';
import { PlannerChipsRow, SuggestionChip } from './styled-components';
const DEFAULT_SITE_BUILDER_STATE = {
	sessionStep: null,
	pageSuggestions: [],
	siteTypeSuggestions: [],
};

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
};

const shouldShowPageNameSuggestions = ( sessionStep, pageSuggestions ) => {
	const sessionStepValue = Number( sessionStep );

	if ( ! Number.isFinite( sessionStepValue ) ) {
		return false;
	}

	if ( sessionStepValue < PLANNER_STEPS.WIREFRAMES ) {
		return false;
	}

	return pageSuggestions.length > 0;
};

const shouldShowSiteTypeSuggestions = ( sessionStep, siteTypeSuggestions ) => {
	if ( null !== sessionStep && PLANNER_STEPS.INIT !== sessionStep ) {
		return false;
	}

	return siteTypeSuggestions.length > 0;
};

const getDisplayChips = ( sessionStep, pageSuggestions, siteTypeSuggestions ) => {
	if ( shouldShowSiteTypeSuggestions( sessionStep, siteTypeSuggestions ) ) {
		return siteTypeSuggestions;
	}

	if ( shouldShowPageNameSuggestions( sessionStep, pageSuggestions ) ) {
		return pageSuggestions;
	}

	return [];
};

const SuggestionChips = ( { onChipSelect, siteBuilderState = DEFAULT_SITE_BUILDER_STATE } ) => {
	const [ selectedChip, setSelectedChip ] = useState( null );
	const { sessionStep, pageSuggestions, siteTypeSuggestions } = siteBuilderState;

	const displayChips = getDisplayChips( sessionStep, pageSuggestions, siteTypeSuggestions );

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
