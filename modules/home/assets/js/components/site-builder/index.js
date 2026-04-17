import { InputAdornment } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import ArrowRightIcon from '../../icons/arrow-right-icon';
import AiLoaderIcon from '../../icons/ai-loader-icon';
import GenerateSiteIcon from '../../icons/generate-site-icon';
import SuggestionChips from './components/suggestion-chips';
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
	GenerateSiteButton,
	CreateSiteButton,
} from './styled-components';

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
};

const SiteBuilder = ( { siteBuilderData } ) => {
	const [ inputValue, setInputValue ] = useState( '' );

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const handleCreateClick = () => {
		if ( ! siteBuilderData?.siteBuilderUrl ) {
			return;
		}

		const url = new URL( siteBuilderData.siteBuilderUrl, window.location.origin );
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

				<SuggestionChips
					siteBuilderData={ siteBuilderData }
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
