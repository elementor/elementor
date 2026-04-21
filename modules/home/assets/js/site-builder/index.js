import PropTypes from 'prop-types';
import { useState } from 'react';
import AiLoaderIcon from '../icons/ai-loader-icon';
import SiteTypeLayoutToggle from './components/site-type-layout-toggle';
import SuggestionChips from './components/suggestion-chips';
import { getStepAction } from './components/step-actions';
import useSiteBuilderState from './hooks/use-site-builder-state';
import { PLANNER_STEPS } from './constants';
import {
	PlannerRoot,
	PlannerBackground,
	PlannerGrid,
	PlannerPreviewContainer,
	PlannerPreviewInner,
	PlannerPreviewFrame,
	PlannerPreviewImage1,
	PlannerPreviewImage2,
	PlannerLoaderBadge,
	PlannerContent,
	PlannerHeading,
} from './components/styled-components';

const getStepConfig = ( step, stepConfigs ) => {
	const normalizedStep = Number( step );
	const configs = stepConfigs ?? {};
	const fallback = configs[ PLANNER_STEPS.INIT ] ?? {};
	return configs[ Number.isFinite( normalizedStep ) ? normalizedStep : PLANNER_STEPS.INIT ] ?? fallback;
};

const SiteBuilder = ( { siteBuilderData } ) => {
	const { sessionStep, pageSuggestions, siteTypeSuggestions } = useSiteBuilderState( siteBuilderData );
	const stepConfig = getStepConfig( sessionStep, siteBuilderData?.stepConfig );
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isOnePage, setIsOnePage ] = useState( false );

	const isInitStep = PLANNER_STEPS.INIT === Number( sessionStep );
	const showLayoutToggle = isInitStep && Boolean( inputValue.trim() );

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const handleCreateClick = ( nextInputValue ) => {
		if ( ! siteBuilderData?.siteBuilderUrl ) {
			return;
		}

		const prompt = nextInputValue || inputValue;
		const requiresInput = stepConfig.hasInput;

		if ( requiresInput && ! prompt.trim() ) {
			return;
		}

		const url = new URL( siteBuilderData.siteBuilderUrl, window.location.origin );

		if ( prompt ) {
			const paramName = sessionStep >= PLANNER_STEPS.WIREFRAMES ? 'page_title' : 'site_type';
			url.searchParams.append( paramName, prompt );
		}

		if ( isInitStep ) {
			url.searchParams.append( 'is_one_page', isOnePage ? 'true' : 'false' );
		}

		window.open( url.toString(), '_blank' );
	};

	const handleKeyDown = ( event ) => {
		if ( 'Enter' === event.key ) {
			event.preventDefault();
			handleCreateClick();
		}
	};

	return (
		<PlannerRoot elevation={ 0 } data-testid="e-site-builder">
			<PlannerBackground bgimage={ siteBuilderData?.bgImage } />

			<PlannerGrid />

			<PlannerPreviewContainer>
				<PlannerPreviewInner>
					<PlannerPreviewFrame>
						{ siteBuilderData?.previewImage1 && (
							<PlannerPreviewImage1
								component="img"
								src={ siteBuilderData.previewImage1 }
								alt=""
							/>
						) }
						{ siteBuilderData?.previewImage2 && (
							<PlannerPreviewImage2
								component="img"
								src={ siteBuilderData.previewImage2 }
								alt=""
							/>
						) }
					</PlannerPreviewFrame>
					<PlannerLoaderBadge>
						<AiLoaderIcon />
					</PlannerLoaderBadge>
				</PlannerPreviewInner>
			</PlannerPreviewContainer>

			<PlannerContent>
				<PlannerHeading>{ stepConfig.title }</PlannerHeading>
				{ getStepAction(
					stepConfig,
					{
						inputValue,
						onInputChange: handleInputChange,
						onKeyDown: handleKeyDown,
						onSubmit: handleCreateClick,
					},
				) }

				{ showLayoutToggle ? (
					<SiteTypeLayoutToggle
						isOnePage={ isOnePage }
						onIsOnePageChange={ setIsOnePage }
					/>
				) : (
					<SuggestionChips
						siteBuilderState={ {
							sessionStep,
							pageSuggestions,
							siteTypeSuggestions,
						} }
						onChipSelect={ setInputValue }
					/>
				) }
			</PlannerContent>
		</PlannerRoot>
	);
};

SiteBuilder.propTypes = {
	siteBuilderData: PropTypes.object,
};

export default SiteBuilder;
