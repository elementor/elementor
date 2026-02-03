import * as React from 'react';
import { Box, Typography, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import type { PageProps } from '../components/app';

const PageContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	textAlign: 'center',
	flex: 1,
	padding: theme.spacing( 4 ),
	gap: theme.spacing( 3 ),
} ) );

const Title = styled( Typography )( ( { theme } ) => ( {
	fontSize: 28,
	fontWeight: 600,
	color: theme.palette.text.primary,
	marginBottom: theme.spacing( 1 ),
} ) );

const Subtitle = styled( Typography )( ( { theme } ) => ( {
	fontSize: 16,
	color: theme.palette.text.secondary,
	maxWidth: 500,
	lineHeight: 1.6,
} ) );

const StepIndicator = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 64,
	height: 64,
	borderRadius: '50%',
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	fontSize: 24,
	fontWeight: 700,
	marginBottom: theme.spacing( 2 ),
} ) );

const PlaceholderCard = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing( 4 ),
	backgroundColor: theme.palette.grey[ 50 ],
	borderRadius: theme.shape.borderRadius,
	border: `2px dashed ${ theme.palette.grey[ 300 ] }`,
	minWidth: 300,
	minHeight: 150,
} ) );

const PlaceholderText = styled( Typography )( ( { theme } ) => ( {
	color: theme.palette.text.disabled,
	fontSize: 14,
} ) );

const STEP_TITLES: Record<number, string> = {
	0: __( "Let's get to work.", 'elementor' ),
	1: __( "Let's get to work.", 'elementor' ),
	2: __( 'Who are you building for?', 'elementor' ),
	3: __( 'Who are you building for?', 'elementor' ),
	4: __( 'What is your site about?', 'elementor' ),
	5: __( 'What is your site about?', 'elementor' ),
	6: __( 'How familiar are you with Elementor?', 'elementor' ),
	7: __( 'How familiar are you with Elementor?', 'elementor' ),
	8: __( 'What are your goals?', 'elementor' ),
	9: __( 'What features do you need?', 'elementor' ),
	10: __( 'Design preferences', 'elementor' ),
	11: __( 'Choose a template', 'elementor' ),
	12: __( 'Almost there!', 'elementor' ),
	13: __( "You're all set!", 'elementor' ),
};

const STEP_SUBTITLES: Record<number, string> = {
	0: __( 'Sign in to your Elementor account to get started.', 'elementor' ),
	1: __( 'Connect your account for the best experience.', 'elementor' ),
	2: __( 'This helps us personalize your experience.', 'elementor' ),
	3: __( 'Select the option that best describes your situation.', 'elementor' ),
	4: __( "Nice :) let's keep it simple", 'elementor' ),
	5: __( 'Choose the category that best fits your site.', 'elementor' ),
	6: __( 'This helps us tailor the experience to your skill level.', 'elementor' ),
	7: __( 'Select your experience level with Elementor.', 'elementor' ),
	8: __( 'Tell us what you want to achieve.', 'elementor' ),
	9: __( 'Select the features that matter most to you.', 'elementor' ),
	10: __( 'Choose your preferred design style.', 'elementor' ),
	11: __( 'Pick a template to get started quickly.', 'elementor' ),
	12: __( "We're setting up your site.", 'elementor' ),
	13: __( 'Your site is ready to customize!', 'elementor' ),
};

export function BlankPage( { stepIndex, totalSteps }: PageProps ) {
	const title = STEP_TITLES[ stepIndex ] || __( 'Step', 'elementor' ) + ` ${ stepIndex + 1 }`;
	const subtitle = STEP_SUBTITLES[ stepIndex ] || __( 'This is a placeholder for onboarding step content.', 'elementor' );

	const displayStep = Math.floor( stepIndex / 2 ) + 1;
	const totalDisplaySteps = Math.ceil( totalSteps / 2 );

	return (
		<PageContainer>
			<StepIndicator>{ displayStep }</StepIndicator>

			<Title variant="h1">{ title }</Title>

			<Subtitle>{ subtitle }</Subtitle>

			<PlaceholderCard>
				<PlaceholderText>
					{ __( 'Step content will be implemented here based on Figma designs.', 'elementor' ) }
				</PlaceholderText>
				<PlaceholderText sx={ { marginTop: 1 } }>
					{ `${ __( 'Step', 'elementor' ) } ${ displayStep } ${ __( 'of', 'elementor' ) } ${ totalDisplaySteps }` }
				</PlaceholderText>
			</PlaceholderCard>
		</PageContainer>
	);
}

export default BlankPage;
