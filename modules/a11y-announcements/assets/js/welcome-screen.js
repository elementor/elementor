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
	<i className="eicon-elementor-square" aria-hidden="true" />
);

const i18n = {
	title: __( "What's New?", 'elementor' ),
	bodyTitle: __( 'Make your website more accessible with Ally', 'elementor' ),
	description: __( "We're excited to introduce our new web accessibility plugin, designed to enhance usability and make your website more inclusive.", 'elementor' ),
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

	const handleCtaClick = () => {
		if ( data.ctaUrl ) {
			window.location.href = data.ctaUrl;
		}
	};

	return (
		<Dialog
			open={ Boolean( anchorElRef.current ) }
			onClose={ doClose }
			maxWidth="sm"
			className="e-a11y-announcement"
		>
			<DialogHeader onClose={ doClose } logo={ <ElementorLogo /> }>
				<DialogTitle className="e-a11y-announcement__title">{ i18n.title }</DialogTitle>
			</DialogHeader>

			<DialogContent dividers>
				<Box className="e-a11y-announcement__video-wrapper">
					<iframe
						className="e-a11y-announcement__iframe"
						src={ data.videoUrl || 'https://www.youtube.com/embed/uj9TDcpC91I?start=1&loop=1&playlist=uj9TDcpC91I' }
						title={ i18n.title }
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</Box>
				<Box className="e-a11y-announcement__content-wrapper">
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
					variant="contained"
					onClick={ handleCtaClick }
					className="e-a11y-announcement__cta-button"
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

