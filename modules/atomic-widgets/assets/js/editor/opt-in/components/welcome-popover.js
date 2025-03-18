import { __ } from '@wordpress/i18n';
import {
	ClickAwayListener,
	Image,
	Box,
	Chip,
	Typography,
	Button,
	CloseButton,
	Stack,
	List,
	ListItem,
	Popover,
} from '@elementor/ui';
import { useEffect, useState } from 'react';

const WelcomePopover = ( { doClose } ) => {
	const [ anchorEl, setAnchorEl ] = useState( null );

	useEffect( () => {
		setAnchorEl( document.body );
	}, [] );

	const redirectHandler = () => {
		window.open( ctaUrl, '_blank' );
		return doClose();
	};

	return (
		<Popover
			open={ Boolean( anchorEl ) }
			onClose={ doClose }
			anchorOrigin={ { vertical: 'center', horizontal: 'center' } }
			transformOrigin={ { vertical: 'center', horizontal: 'center' } }
		>
			<Stack direction="row" alignItems="center" py={ 1 } px={ 2 } sx={ { width: 600 } }>
				<Typography variant="subtitle2">Title</Typography>
				<Chip label={ __( 'PRO', 'elementor' ) } size="small" variant="outlined" color="promotion" sx={ { ml: 1 } } />
				<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
					icon: {
						fontSize: 'small',
					},
				} } onClick={ doClose } />
			</Stack>
			<Image src="https://elementor.com/cdn-cgi/image/f=auto,w=1370/https://elementor.com/wp-content/uploads/2024/06/drag-and-drop.webp" alt="imgAlt" sx={ { height: 300, width: '100%', objectFit: 'cover', objectPosition: 'center' } } />
			<Stack px={ 2 }>
				<List sx={ { pl: 2 } }>
					<ListItem key="1" sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
						<Typography variant="body2" color="secondary">Text</Typography>
					</ListItem>
				</List>
			</Stack>
			<Stack pt={ 1 } pb={ 1.5 } px={ 2 }>
				<Button
					variant="contained"
					size="small"
					color="promotion"
					onClick={ redirectHandler }
					sx={ { ml: 'auto' } }
				>CtaText</Button>
			</Stack>
		</Popover>
	);
};

WelcomePopover.propTypes = {
	doClose: PropTypes.func,
};

export default WelcomePopover;
