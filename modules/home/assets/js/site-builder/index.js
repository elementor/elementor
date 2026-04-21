import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
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

const getPlannerStepConfig = () => ( {
	[ PLANNER_STEPS.INIT ]: {
		hasInput: true,
		title: __( 'From idea to website in minutes', 'elementor' ),
		placeholder: __( 'What site do you want to build?', 'elementor' ),
		buttonLabel: __( 'Create my site', 'elementor' ),
	},
	[ PLANNER_STEPS.CHAT ]: {
		hasInput: false,
		title: __( 'From idea to website in minutes', 'elementor' ),
		text: __( 'Review your brief and generate your website', 'elementor' ),
		buttonLabel: __( 'Create site', 'elementor' ),
	},
	[ PLANNER_STEPS.SITEMAP ]: {
		hasInput: false,
		title: __( 'Let\’s turn your sitemap into a design', 'elementor' ),
		text: __( 'Your sitemap is waiting for you to continue.', 'elementor' ),
		buttonLabel: __( 'Visit sitemap', 'elementor' ),
	},
	[ PLANNER_STEPS.WIREFRAMES ]: {
		hasInput: false,
		title: __( 'Your site design is waiting', 'elementor' ),
		text: __( 'Jump back in to review, edit, and add to Elementor.', 'elementor' ),
		buttonLabel: __( 'Review design', 'elementor' ),
	},
	[ PLANNER_STEPS.DEPLOYING ]: {
		hasInput: false,
		title: __( 'Your site design is ready to go live', 'elementor' ),
		text: __( 'Review and publish your site to continue editing in Elementor.', 'elementor' ),
		buttonLabel: __( 'Review & publish', 'elementor' ),
	},
	[ PLANNER_STEPS.DEPLOYED_TO_HOSTING ]: {
		hasInput: true,
		title: __( 'Expand your site with Elementor AI', 'elementor' ),
		placeholder: __( 'Which page do you want to create?', 'elementor' ),
		buttonLabel: __( 'Create page', 'elementor' ),
	},
	[ PLANNER_STEPS.DEPLOYED_TO_PLUGIN ]: {
		hasInput: true,
		title: __( 'Expand your site with Elementor AI', 'elementor' ),
		placeholder: __( 'Which page do you want to create?', 'elementor' ),
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
