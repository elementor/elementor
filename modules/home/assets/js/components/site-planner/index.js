import { InputAdornment } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import ArrowRightIcon from '../../icons/arrow-right-icon';
import AiLoaderIcon from '../../icons/ai-loader-icon';
import GenerateSiteIcon from '../../icons/generate-site-icon';
import useSessionStatus from './hooks/use-session-status';
import usePageNameSuggestions from './hooks/use-page-name-suggestions';
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
	PlannerInputRow,
	PlannerTextField,
	PlannerChipsRow,
	SessionStatusCard,
	GenerateSiteButton,
	CreateSiteButton,
	SuggestionChip,
} from './styled-components';

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
};

const SitePlanner = ( { sitePlannerData } ) => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ selectedChip, setSelectedChip ] = useState( null );
	const { sessionState, sessionStep } = useSessionStatus( sitePlannerData );
	const { pageSuggestions: suggestionChips } = usePageNameSuggestions( sitePlannerData );

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const handleChipClick = ( value ) => {
		setInputValue( value );
		setSelectedChip( value );
	};

	const handleCreateClick = () => {
		if ( ! sitePlannerData?.siteBuilderUrl ) {
			return;
		}

		const url = new URL( sitePlannerData.siteBuilderUrl, window.location.origin );
		if ( inputValue ) {
			url.searchParams.append( 'prompt', inputValue );
		}

		window.open( url.toString(), '_blank' );
	};

	const inputEndAdornment = {
		endAdornment: (
			<InputAdornment position="end">
				<GenerateSiteButton
					variant="contained"
					size="small"
					startIcon={ <GenerateSiteIcon /> }
					onClick={ handleCreateClick }
				>
					{ __( 'Generate site', 'elementor' ) }
				</GenerateSiteButton>
			</InputAdornment>
		),
	};

	const handleKeyDown = ( event ) => {
		if ( 'Enter' === event.key ) {
			event.preventDefault();
			handleCreateClick();
		}
	};

	const getStepLabel = ( step ) => {
		switch ( step ) {
			case PLANNER_STEPS.INIT:
			case PLANNER_STEPS.CHAT:
				return __( 'Chat in progress', 'elementor' );
			case PLANNER_STEPS.SITEMAP:
				return __( 'Sitemap created', 'elementor' );
			case PLANNER_STEPS.WIREFRAMES:
				return __( 'Design created, not published', 'elementor' );
			case PLANNER_STEPS.DEPLOYING:
				return __( 'Deploying', 'elementor' );
			case PLANNER_STEPS.DEPLOYED_TO_HOSTING:
				return __( 'Published', 'elementor' );
			default:
				return __( 'Chat in progress', 'elementor' );
		}
	};

	if ( 'has-session' === sessionState ) {
		return (
			<SessionStatusCard elevation={ 0 }>
				<Typography variant="h6">
					{ __( 'Site Planner', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ getStepLabel( sessionStep ) }
				</Typography>
			</SessionStatusCard>
		);
	}

	return (
		<PlannerRoot elevation={ 0 }>
			<PlannerBackground bgimage={ sitePlannerData?.bgImage } />

			<PlannerGrid />

			<PlannerPreviewContainer>
				<PlannerPreviewInner>
					<PlannerPreviewFrame>
						{ sitePlannerData?.previewImage1 && (
							<PlannerPreviewImage1
								component="img"
								src={ sitePlannerData.previewImage1 }
								alt=""
							/>
						) }
						{ sitePlannerData?.previewImage2 && (
							<PlannerPreviewImage2
								component="img"
								src={ sitePlannerData.previewImage2 }
								alt=""
							/>
						) }
					</PlannerPreviewFrame>
					<PlannerLoaderBadge>
						<AiLoaderIcon />
					</PlannerLoaderBadge>
				</PlannerPreviewInner>
			</PlannerPreviewContainer>

			<PlannerContent gap={ 1 }>
				<PlannerHeading variant="h4">
					{ __( 'From idea to website in minutes', 'elementor' ) }
				</PlannerHeading>

				<PlannerInputRow>
					<PlannerTextField
						placeholder={ __( 'Site name or title', 'elementor' ) }
						variant="outlined"
						size="small"
						value={ inputValue }
						onChange={ handleInputChange }
						onKeyDown={ handleKeyDown }
						autoComplete="off"
						// InputProps={ inputEndAdornment }
					/>
					<CreateSiteButton
						variant="contained"
						size="medium"
						endIcon={ <ArrowRightIcon /> }
						onClick={ handleCreateClick }
					>
						{ __( 'Create my site', 'elementor' ) }
					</CreateSiteButton>
				</PlannerInputRow>

				{ suggestionChips.length > 0 && (
					<PlannerChipsRow>
						{ suggestionChips.map( ( suggestion ) => (
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
				) }
			</PlannerContent>
		</PlannerRoot>
	);
};

SitePlanner.propTypes = {
	sitePlannerData: PropTypes.object,
};

export default SitePlanner;
