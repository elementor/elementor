import { __ } from '@wordpress/i18n';
import {
	Image,
	Typography,
	Button,
	Stack,
	List,
	ListItem,
	Popover, Box, Link, Divider,
} from '@elementor/ui';
import { useEffect, useRef, useState } from 'react';

const i18n = {
	heading: __( 'Welcome to the Future of Elementor Editor V4 is Here!', 'elementor' ),
	introduction: __( 'You\'re now using Editor V4, a new generation of Elementor that brings powerful enhancements while keeping your workflow familiar.', 'elementor' ),
	listItems: [
		__( 'A Unified Style Tab for consistent design control', 'elementor' ),
		__( 'CSS Classes & Pseudo-Classes for advanced styling', 'elementor' ),
		__( 'Improved Responsive Support for better adaptability', 'elementor' ),
		__( '…and much more!', 'elementor' ),
	],
	footerText: __( 'Need help getting started?', 'elementor' ),
	introductionVideo: __( 'Introduction video', 'elementor' ),
	helpCenter: __( 'Help center', 'elementor' ),
};

const contentLinks = {
	introduction: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
	helpCenter: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
};

export const WelcomePopover = ( { doClose } ) => {
	const anchorElRef = useRef( null );
	const [ isMounted, setIsMounted ] = useState( false );

	useEffect( () => {
		anchorElRef.current = document.body;
		setIsMounted( true );
	}, [] );

	if ( ! isMounted || ! anchorElRef.current ) {
		return null;
	}

	return (
		<Popover
			open={ Boolean( anchorElRef.current ) }
			onClose={ doClose }
			anchorEl={ anchorElRef.current }
			anchorOrigin={ { vertical: 'center', horizontal: 'center' } }
			transformOrigin={ { vertical: 'center', horizontal: 'center' } }
			slotProps={ {
				paper: {
					sx: { width: 600 },
				} } }
		>
			<Box sx={ { aspectRatio: '2', backgroundColor: 'primary.light' } } />
			<Stack pt={ 3 } pb={ 1.5 } px={ 3 } gap={ 3 }>
				<Typography variant="h6" color="text.primary">{ i18n.heading }</Typography>
				<Box>
					<Typography variant="body1" color="text.secondary">{ i18n.introduction }</Typography>
					<List sx={ { pl: 2 } }>
						{ i18n.listItems.map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body1">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List>
				</Box>
				<Stack direction="row" alignItems="center" gap={ 1.5 }>
					<Typography variant="body1" color="text.secondary">{ i18n.footerText }</Typography>
					<Link href={ contentLinks.introduction } target="_blank" variant="body1" color="info.main">{ i18n.introductionVideo }</Link>
					<Link href={ contentLinks.helpCenter } target="_blank" variant="body1" color="info.main">{ i18n.helpCenter }</Link>
				</Stack>
			</Stack>
			<Divider />
			<Stack py={ 2 } px={ 3 }>
				<Button
					variant="contained"
					onClick={ doClose }
					sx={ { ml: 'auto' } }
				>Let’s Go</Button>
			</Stack>
		</Popover>
	);
};

WelcomePopover.propTypes = {
	doClose: PropTypes.func,
};
