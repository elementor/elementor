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
	PlannerPreviewImage,
	PlannerLoaderBadge,
	PlannerContent,
	PlannerHeading,
} from './components/styled-components';

const SITE_BUILDER_READY_TIMEOUT_MS = 30_000;

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
	const stepImage = siteBuilderData?.stepImages?.[ sessionStep ];

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

		const newWindow = window.open( siteBuilderData.siteBuilderUrl, '_blank' );

		if ( ! newWindow ) {
			return;
		}

		const payload = {};

		if ( prompt ) {
			const paramName = sessionStep >= ( plannerSteps.WIREFRAMES ?? 3 ) ? 'pageTitle' : 'siteType';
			payload[ paramName ] = prompt;
		}

		if ( isInitStep ) {
			payload.isOnePage = isOnePage;
		}

		let timeoutId;
		const onReady = ( event ) => {
			if ( event.source !== newWindow ) {
				return;
			}
			if ( event.origin !== window.location.origin ) {
				return;
			}
			if ( event.data?.type !== 'site-builder/ready' ) {
				return;
			}
			clearTimeout( timeoutId );
			window.removeEventListener( 'message', onReady );
			newWindow.postMessage( { type: 'site-builder/init', payload }, window.location.origin );
		};

		window.addEventListener( 'message', onReady );
		timeoutId = setTimeout( () => window.removeEventListener( 'message', onReady ), SITE_BUILDER_READY_TIMEOUT_MS );
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
						{ stepImage && (
							<PlannerPreviewImage
								component="img"
								src={ stepImage }
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
