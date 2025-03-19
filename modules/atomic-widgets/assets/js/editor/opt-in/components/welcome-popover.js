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

const listItems = [
	__( 'A Unified Style Tab for consistent design control', 'elementor' ),
	__( 'CSS Classes & Pseudo-Classes for advanced styling', 'elementor' ),
	__( 'Improved Responsive Support for better adaptability', 'elementor' ),
	__( '…and much more!', 'elementor' ),
];

const WelcomePopover = ( { doClose } ) => {
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
			<Image src="https://elementor.com/cdn-cgi/image/f=auto,w=1370/https://elementor.com/wp-content/uploads/2024/06/drag-and-drop.webp" alt="imgAlt" sx={ { height: 300, width: '100%', objectFit: 'cover', objectPosition: 'center' } } />
			<Stack pt={ 3 } pb={ 1.5 } px={ 3 } gap={ 3 }>
				<Typography variant="h6" color="text.primary">Welcome to the Future of Elementor Editor V4 is Here!</Typography>
				<Box>
					<Typography variant="body1" color="text.secondary">You&#39;re now using Editor V4, a new generation of Elementor that brings powerful enhancements while keeping your workflow familiar.</Typography>
					<List sx={ { pl: 2 } }>
						{ listItems.map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body1">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List>
				</Box>
				<Stack direction="row" alignItems="center" gap={ 1.5 }>
					<Typography variant="body1" color="text.secondary">Need help getting started?</Typography>
					<Link href="https://elementor.com/help/" target="_blank" color="info.main">Introduction video</Link>
					<Link href="https://elementor.com/help/" target="_blank" color="info.main">Help center</Link>
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

export default WelcomePopover;
