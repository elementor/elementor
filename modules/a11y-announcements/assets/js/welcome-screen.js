import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
} from '@elementor/ui';
import { useEffect, useRef, useState } from 'react';

const ElementorLogo = () => (
	<i className="eicon-elementor-square e-a11y-announcement__header-logo" aria-hidden="true" />
);

const i18n = {
	title: __( "What's New?", 'elementor' ),
	bodyTitle: __( 'Is your website accessible?', 'elementor' ),
	description: __( 'Use Ally to scan, detect, and fix accessibility issues with AI by your side.', 'elementor' ),
};

export const WelcomeDialog = ( { doClose } ) => {
	const anchorElRef = useRef( null );
	const [ isMounted, setIsMounted ] = useState( false );
	const data = window.elementorA11yAnnouncement || {};

	useEffect( () => {
		anchorElRef.current = document.body;
		setIsMounted( true );
	}, [] );

	if ( ! isMounted || ! anchorElRef.current ) {
		return null;
	}

	const handleLearnMoreClick = () => {
		if ( data.learnMoreUrl ) {
			window.open( data.learnMoreUrl, '_blank' );
		}
	};

	const handleCtaClick = () => {
		if ( data.ctaUrl ) {
			window.open( data.ctaUrl, '_blank' );
		}
	};

	return (
		<Dialog
			open={ Boolean( anchorElRef.current ) }
			onClose={ doClose }
			maxWidth="sm"
			className="e-a11y-announcement"
		>
			<DialogHeader className="e-a11y-announcement__header" onClose={ doClose } logo={ <ElementorLogo /> }>
				<DialogTitle className="e-a11y-announcement__header-title">{ i18n.title }</DialogTitle>
			</DialogHeader>

			<DialogContent className="e-a11y-announcement__content">
				<Box className="e-a11y-announcement__content-video">
					<iframe
						className="e-a11y-announcement__content-video-iframe"
						src={ data.videoUrl || 'https://www.youtube.com/embed/uj9TDcpC91I?start=1&loop=1&playlist=uj9TDcpC91I' }
						title={ i18n.title }
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</Box>
				<Box className="e-a11y-announcement__content-text">
					<Typography variant="h6" color="text.primary">
						{ i18n.bodyTitle }
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{ i18n.description }
					</Typography>
				</Box>
			</DialogContent>

			<DialogActions>
				<Button
					variant="text"
					onClick={ handleLearnMoreClick }
					className="e-a11y-announcement__buttons-learn-more"
				>
					{ data.learnMoreText || __( 'Learn more', 'elementor' ) }
				</Button>
				<Button
					variant="contained"
					onClick={ handleCtaClick }
					className="e-a11y-announcement__buttons-cta"
				>
					{ data.ctaText || __( 'Install Plugin', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

WelcomeDialog.propTypes = {
	doClose: PropTypes.func,
};

