import { Box, Paper, Stack, TextField, Chip, SvgIcon, InputAdornment } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import ArrowRightIcon from '../icons/arrow-right-icon';

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

const AiStarsIcon = ( props ) => (
	<SvgIcon viewBox="0 0 10 10" sx={ { width: 10, height: 10 } } { ...props }>
		<path
			d="M4.8 0C4.8 2.2 3 4 0.8 4C3 4 4.8 5.8 4.8 8C4.8 5.8 6.6 4 8.8 4C6.6 4 4.8 2.2 4.8 0Z"
			fill="currentColor"
		/>
		<path
			d="M8 5.6C8 6.8 7 7.8 5.8 7.8C7 7.8 8 8.8 8 10C8 8.8 9 7.8 10.2 7.8C9 7.8 8 6.8 8 5.6Z"
			fill="currentColor"
			opacity="0.6"
		/>
	</SvgIcon>
);

const AiLoaderIcon = () => (
	<Box sx={ { position: 'relative', width: 40, height: 40 } }>
		<Box
			sx={ {
				position: 'relative',
				width: 40,
				height: 40,
				borderRadius: '50%',
				background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F1FA 100%)',
				boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.28)',
			} }
		/>
		<Box
			sx={ {
				position: 'absolute',
				top: 8,
				left: 8,
				width: 24,
				height: 24,
				pointerEvents: 'none',
				'@keyframes loaderRotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				animation: 'loaderRotate 2s linear infinite',
			} }
		>
			<SvgIcon
				viewBox="0 0 24 24"
				sx={ { width: 24, height: 24 } }
			>
				<defs>
					<linearGradient id="sitePlannerLoaderGradient" x1="2.25" y1="12" x2="21.75" y2="12" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#696199" />
						<stop offset="1" stopColor="#C945C9" />
					</linearGradient>
				</defs>
				<path
					d="M12 2.25 A 9.75 9.75 0 1 1 2.25 12"
					fill="none"
					stroke="url(#sitePlannerLoaderGradient)"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</SvgIcon>
		</Box>
		<AiStarsIcon
			sx={ {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: 9.6,
				height: 9.6,
				color: '#171719',
			} }
		/>
	</Box>
);

const GenerateSiteIcon = () => (
	<SvgIcon viewBox="0 0 24 24" sx={ { width: 16, height: 16 } }>
		<path d="M7 14L12 9L17 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</SvgIcon>
);

const SitePlanner = ( { sitePlannerData } ) => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ sessionState, setSessionState ] = useState( 'loading' );
	const [ sessionStep, setSessionStep ] = useState( null );

	console.log( 'sitePlannerData', sitePlannerData );

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
						'x-elementor-signature': connectAuth.signature || '',
						'access-token': connectAuth.accessToken || '',
						'client-id': connectAuth.clientId || '',
						'home-url': connectAuth.homeUrl || '',
						'site-key': connectAuth.siteKey || '',
					},
				} );

				if ( ! response.ok ) {
					throw new Error( 'Failed to fetch session status' );
				}

				const data = await response.json();

				if ( ! data?.sessionId ) {
					setSessionState( 'no-usage' );
				} else {
					setSessionState( 'has-session' );
					setSessionStep( data.step );
				}
			} catch {
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
					border: '1px solid',
					borderColor: 'divider',
				} }
			>
				<Typography variant="h6">
					{ __( 'Site Planner', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ getStepLabel( sessionStep ) }
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper
			elevation={ 0 }
			sx={ {
				position: 'relative',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				overflow: 'hidden',
				borderRadius: '8px',
				border: '1px solid',
				borderColor: 'divider',
				minHeight: '214px',
			} }
		>
			<Box
				sx={ {
					position: 'absolute',
					inset: 0,
					backgroundImage: sitePlannerData?.bgImage
						? `url(${ sitePlannerData.bgImage })`
						: 'linear-gradient(90deg, rgba(105, 97, 153, 0.08) 0%, rgba(201, 69, 201, 0.12) 100%)',
					backgroundPosition: '0px -105.625px',
					backgroundSize: sitePlannerData?.bgImage ? '100% 257.593%' : 'auto',
					backgroundRepeat: 'no-repeat',
					zIndex: 0,
				} }
			/>

			<Box
				sx={ {
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
					backgroundSize: '40px 40px',
					zIndex: 0,
				} }
			/>

			<Box
				sx={ {
					position: 'relative',
					zIndex: 1,
					display: { xs: 'none', md: 'flex' },
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
					width: '252px',
					height: '100%',
					ml: -8,
				} }
			>
				<Box sx={ { position: 'relative', width: '252px', height: '148px' } }>
					<Box
						sx={ {
							position: 'absolute',
							inset: 0,
							border: '1px dashed',
							borderColor: '#696199',
							borderRadius: '14px',
							overflow: 'hidden',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '3.7px',
							p: '8.5px',
						} }
					>
						{ sitePlannerData?.previewImage && (
							<Box
								component="img"
								src={ sitePlannerData.previewImage }
								alt=""
								sx={ {
									height: '120px',
									width: '151px',
									objectFit: 'cover',
									borderRadius: '4px',
									flexShrink: 0,
								} }
							/>
						) }
					</Box>
					<Box
						sx={ {
							position: 'absolute',
							top: '-12px',
							right: '-12px',
						} }
					>
						<AiLoaderIcon />
					</Box>
				</Box>
			</Box>

			<Stack
				gap={ 1 }
				sx={ {
					position: 'relative',
					zIndex: 1,
					flex: 1,
					py: 3,
					px: { xs: 3, md: 4 },
				} }
			>
				<Typography
					variant="h4"
					sx={ {
						fontFamily: '"Poppins", sans-serif',
						fontWeight: 400,
						fontSize: '24px',
						lineHeight: '48px',
						letterSpacing: '0.15px',
						background: 'linear-gradient(77deg, #212121 25.85%, #696199 46.02%, #C945C9 60.81%, #212121 82.38%)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					} }
				>
					{ __( 'From idea to website in minutes', 'elementor' ) }
				</Typography>

				<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: { xs: 'stretch', sm: 'center' } } }>
					<TextField
						placeholder={ __( 'Site name or title', 'elementor' ) }
						variant="outlined"
						size="small"
						sx={ {
							width: { xs: '100%', sm: '400px' },
							'& .MuiOutlinedInput-root': {
								backgroundColor: 'common.white',
								borderRadius: '8px',
								height: '40px',
								boxShadow: '0px 3px 14px 0px rgba(0, 0, 0, 0.06)',
								'& fieldset': {
									borderColor: '#212121',
								},
							},
						} }
						value={ inputValue }
						onChange={ handleInputChange }
						onKeyDown={ handleKeyDown }
						InputProps={ {
							endAdornment: (
								<InputAdornment position="end">
									<Button
										variant="contained"
										size="small"
										startIcon={ <GenerateSiteIcon /> }
										onClick={ handleCreateClick }
										sx={ {
											backgroundColor: 'text.primary',
											color: 'common.white',
											borderRadius: '6px',
											textTransform: 'none',
											fontWeight: 500,
											fontSize: '13px',
											whiteSpace: 'nowrap',
											minWidth: 'auto',
											py: 0.25,
											px: 1.5,
											'&:hover': {
												backgroundColor: 'text.secondary',
											},
										} }
									>
										{ __( 'Generate site', 'elementor' ) }
									</Button>
								</InputAdornment>
							),
						} }
					/>
					<Button
						variant="contained"
						size="medium"
						endIcon={ <ArrowRightIcon /> }
						onClick={ handleCreateClick }
						sx={ {
							backgroundColor: 'text.primary',
							color: 'common.white',
							borderRadius: '8px',
							textTransform: 'none',
							fontWeight: 500,
							whiteSpace: 'nowrap',
							'&:hover': {
								backgroundColor: 'text.secondary',
							},
						} }
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
							variant="outlined"
							sx={ {
								cursor: 'pointer',
								backgroundColor: 'common.white',
								borderColor: 'divider',
								color: 'text.secondary',
								fontSize: '13px',
							} }
						/>
					) ) }
				</Box>
			</Stack>
		</Paper>
	);
};

SitePlanner.propTypes = {
	sitePlannerData: PropTypes.object,
};

export default SitePlanner;
