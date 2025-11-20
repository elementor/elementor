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
	title: __( 'Is your site accessible?', 'elementor' ),
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
		>
			<DialogHeader onClose={ doClose } logo={ <ElementorLogo /> }>
				<DialogTitle>{ i18n.title }</DialogTitle>
			</DialogHeader>

			<DialogContent dividers>
				<Box
					sx={ {
						aspectRatio: '16/9',
						width: '100%',
						mb: 2,
					} }
				>
					<iframe
						width="100%"
						height="100%"
						src={ data.videoUrl || 'https://www.youtube.com/embed/uj9TDcpC91I?start=1&loop=1&playlist=uj9TDcpC91I' }
						title={ i18n.title }
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						style={ {
							borderRadius: '4px',
						} }
					/>
				</Box>
				<Typography variant="body1" color="text.secondary">
					{ i18n.description }
				</Typography>
			</DialogContent>

			<DialogActions>
				<Button
					variant="contained"
					color="accent"
					onClick={ handleCtaClick }
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

