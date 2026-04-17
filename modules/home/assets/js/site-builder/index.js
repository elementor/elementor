import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import AiLoaderIcon from '../icons/ai-loader-icon';
import SuggestionChips from './components/suggestion-chips';
import { STEP_TYPES, getStepAction } from './components/step-actions';
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

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
};

const getPlannerStepConfig = () => ( {
	[ PLANNER_STEPS.INIT ]: {
		title: __( 'From idea to website in minutes', 'elementor' ),
		type: STEP_TYPES.WITH_INPUT,
		placeholder: __( 'Describe the type of website.', 'elementor' ),
		buttonLabel: __( 'Create my site', 'elementor' ),
	},
	[ PLANNER_STEPS.CHAT ]: {
		title: __( 'Your site brief is ready, let\'s build your site', 'elementor' ),
		type: STEP_TYPES.WITHOUT_INPUT,
		text: __( 'Turn your brief into a full site design and continue editing in Elementor.', 'elementor' ),
		buttonLabel: __( 'Continue building', 'elementor' ),
	},
	[ PLANNER_STEPS.SITEMAP ]: {
		title: __( 'Your site is ready, let\'s design your site', 'elementor' ),
		type: STEP_TYPES.WITHOUT_INPUT,
		text: __( 'Turn your sitemap into a full site design and continue editing in Elementor.', 'elementor' ),
		buttonLabel: __( 'Generate design', 'elementor' ),
	},
	[ PLANNER_STEPS.WIREFRAMES ]: {
		title: __( 'Your site design is ready to go live', 'elementor' ),
		type: STEP_TYPES.WITHOUT_INPUT,
		text: __( 'Review and publish your site to continue editing in Elementor.', 'elementor' ),
		buttonLabel: __( 'Review & publish', 'elementor' ),
	},
	[ PLANNER_STEPS.DEPLOYING ]: {
		title: __( 'Your site design is ready to go live', 'elementor' ),
		type: STEP_TYPES.WITHOUT_INPUT,
		text: __( 'Review and publish your site to continue editing in Elementor.', 'elementor' ),
		buttonLabel: __( 'Review & publish', 'elementor' ),
	},
	[ PLANNER_STEPS.DEPLOYED_TO_HOSTING ]: {
		title: __( 'Expand your site with AI', 'elementor' ),
		type: STEP_TYPES.WITH_INPUT,
		placeholder: __( 'Page name', 'elementor' ),
		buttonLabel: __( 'Create page', 'elementor' ),
	},
} );

const getStepConfig = ( step ) => {
	const normalizedStep = Number( step );
	const config = getPlannerStepConfig();
	const fallback = config[ PLANNER_STEPS.INIT ];
	return config[ Number.isFinite( normalizedStep ) ? normalizedStep : PLANNER_STEPS.INIT ] || fallback;
};

const SiteBuilder = ( { siteBuilderData } ) => {
	const { sessionStep, pageSuggestions, siteTypeSuggestions } = useSiteBuilderState( siteBuilderData );
	const stepConfig = getStepConfig( sessionStep );
	const [ inputValue, setInputValue ] = useState( '' );

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const handleCreateClick = ( nextInputValue ) => {
		if ( ! siteBuilderData?.siteBuilderUrl ) {
			return;
		}

		const url = new URL( siteBuilderData.siteBuilderUrl, window.location.origin );
		const prompt = nextInputValue || inputValue;

		if ( prompt ) {
			url.searchParams.append( 'prompt', prompt );
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
		<PlannerRoot elevation={ 0 }>
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

				<SuggestionChips
					siteBuilderState={ {
						sessionStep,
						pageSuggestions,
						siteTypeSuggestions,
					} }
					onChipSelect={ setInputValue }
				/>
			</PlannerContent>
		</PlannerRoot>
	);
};

SiteBuilder.propTypes = {
	siteBuilderData: PropTypes.object,
};

export default SiteBuilder;
