import { Box, Paper, Stack, TextField, Chip } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_HOSTING: 5,
};

const SUGGESTION_CHIPS = [
	__( 'Jewelry store', 'elementor' ),
	__( 'Travel guide blog', 'elementor' ),
	__( 'Real estate agency', 'elementor' ),
];

const SitePlanner = ( { sitePlannerData } ) => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ sessionState, setSessionState ] = useState( 'loading' );
	const [ sessionStep, setSessionStep ] = useState( null );

	useEffect( () => {
		if ( ! sitePlannerData?.connectAuth || ! sitePlannerData?.apiOrigin ) {
			setSessionState( 'no-usage' );
			return;
		}

		const fetchSessionStatus = async () => {
			try {
				const { connectAuth, apiOrigin } = sitePlannerData;
				const response = await fetch( `${ apiOrigin }/website-planner/session/resolve-by-site`, {
					method: 'GET',
					headers: {
						'x-elementor-signature': connectAuth.signature,
						'access-token': connectAuth.accessToken,
						'client-id': connectAuth.clientId,
						'home-url': connectAuth.homeUrl,
						'site-key': connectAuth.siteKey,
					},
				} );

				if ( ! response.ok ) {
					throw new Error( 'Failed to fetch session status' );
				}

				const data = await response.json();

				if ( ! data.sessionId ) {
					setSessionState( 'no-usage' );
				} else {
					setSessionState( 'has-session' );
					setSessionStep( data.step );
				}
			} catch ( error ) {
				setSessionState( 'no-usage' );
			}
		};

		fetchSessionStatus();
	}, [ sitePlannerData ] );

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const handleChipClick = ( value ) => {
		setInputValue( value );
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

	if ( 'loading' === sessionState ) {
		return null;
	}

	if ( 'has-session' === sessionState ) {
		return (
			<Paper
				elevation={ 0 }
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					py: 3,
					px: { xs: 3, md: 4 },
					gap: 2,
					borderRadius: 1,
					border: '1px solid rgba(0, 0, 0, 0.12)',
				} }
			>
				<Typography variant="h6">
					{ __( 'Site Planner', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="secondary">
					{ getStepLabel( sessionStep ) }
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper
			elevation={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				py: 3,
				px: { xs: 3, md: 4 },
				gap: 2,
				backgroundImage: 'linear-gradient(90deg, rgba(105, 97, 153, 0.1) 0%, rgba(201, 69, 201, 0.1) 100%)',
				borderRadius: 1,
				border: '1px solid rgba(0, 0, 0, 0.12)',
			} }
		>
			<Stack gap={ 1 }>
				<Typography
					variant="h4"
					sx={ {
						background: 'linear-gradient(77deg, #212121 25%, #696199 46%, #C945C9 61%, #212121 82%)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					} }
				>
					{ __( 'From idea to website in minutes', 'elementor' ) }
				</Typography>
			</Stack>
			<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: 'flex-start' } }>
				<TextField
					fullWidth
					placeholder={ __( 'Site name or title', 'elementor' ) }
					variant="outlined"
					size="small"
					sx={ { flex: 1, maxWidth: '400px' } }
					value={ inputValue }
					onChange={ handleInputChange }
					onKeyDown={ handleKeyDown }
				/>
				<Button
					variant="contained"
					size="medium"
					color="primary"
					onClick={ handleCreateClick }
				>
					{ __( 'Create my site', 'elementor' ) }
				</Button>
			</Box>
			<Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap' } }>
				{ SUGGESTION_CHIPS.map( ( suggestion ) => (
					<Chip
						key={ suggestion }
						label={ suggestion }
						onClick={ () => handleChipClick( suggestion ) }
						size="small"
						sx={ { cursor: 'pointer' } }
					/>
				) ) }
			</Box>
		</Paper>
	);
};

SitePlanner.propTypes = {
	sitePlannerData: PropTypes.object,
};

export default SitePlanner;
