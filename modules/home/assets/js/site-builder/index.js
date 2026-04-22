import PropTypes from 'prop-types';
import { useState } from 'react';
import AiLoaderIcon from '../icons/ai-loader-icon';
import SiteTypeLayoutToggle from './components/site-type-layout-toggle';
import SuggestionChips from './components/suggestion-chips';
import { getStepAction, StepLoader } from './components/step-actions';
import useSiteBuilderState from './hooks/use-site-builder-state';
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

const getStepConfig = ( step, stepConfigs, plannerSteps ) => {
	const normalizedStep = Number( step );
	const configs = stepConfigs ?? {};
	const initStep = plannerSteps?.INIT ?? 0;
	const fallback = configs[ initStep ] ?? {};
	return configs[ Number.isFinite( normalizedStep ) ? normalizedStep : initStep ] ?? fallback;
};

const SiteBuilder = ( { siteBuilderData } ) => {
	const { sessionStep, pageSuggestions, siteTypeSuggestions, isLoading } = useSiteBuilderState( siteBuilderData );
	const plannerSteps = siteBuilderData?.plannerSteps ?? {};
	const stepConfig = getStepConfig( sessionStep, siteBuilderData?.stepConfig, plannerSteps );
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isOnePage, setIsOnePage ] = useState( false );

	const isInitStep = ( plannerSteps.INIT ?? 0 ) === Number( sessionStep );
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
			const paramName = sessionStep >= ( plannerSteps.WIREFRAMES ?? 3 ) ? 'page_title' : 'site_type';
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
				{ isLoading ? <StepLoader /> : (
					<>
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
									plannerSteps,
								} }
								onChipSelect={ setInputValue }
							/>
						) }
					</>
				) }
			</PlannerContent>
		</PlannerRoot>
	);
};

SiteBuilder.propTypes = {
	siteBuilderData: PropTypes.object,
};

export default SiteBuilder;
