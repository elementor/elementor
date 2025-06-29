import {
	ClickAwayListener,
	Image,
	Box,
	Typography,
	Button,
	CloseButton,
	Stack,
	List,
	ListItem,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const popoverData = {
	image: 'https://assets.elementor.com/v4-promotion/v1/images/v4_chip.png',
	image_alt: __( 'Elementor V4', 'elementor' ),
	title: __( 'Elementor V4', 'elementor' ),
	description: [
		__( 'You’ve got powerful new tools with Editor V4. But, keep in mind that this is an early release, so don’t use it on live sites yet.', 'elementor' ),
	],
	upgrade_text: __( 'Learn more', 'elementor' ),
	upgrade_url: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
};

const PopoverCard = ( { doClose } ) => {
	const title = popoverData?.title,
		description = popoverData?.description,
		imgSrc = popoverData?.image,
		imgAlt = popoverData?.image_alt,
		ctaText = popoverData?.upgrade_text,
		ctaUrl = popoverData?.upgrade_url;

	const redirectHandler = () => {
		window.open( ctaUrl, '_blank' );
		return doClose();
	};

	return (
		<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ doClose }>
			<Box sx={ { width: 296 } } data-testid="e-popover-card">
				<Stack direction="row" alignItems="center" py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ title }</Typography>
					<CloseButton edge="end" sx={ { ml: 'auto' } } slotProps={ {
						icon: {
							fontSize: 'small',
						},
					} } onClick={ doClose } />
				</Stack>
				<Image src={ imgSrc } alt={ imgAlt } sx={ { height: 150, width: '100%' } } />
				<Stack px={ 2 }>
					{ 1 === description.length ? <Typography variant="body2" color="secondary" sx={ { pt: 1.5, pb: 1 } }>{ description[ 0 ] }</Typography> : <List sx={ { pl: 2 } }>
						{ description.map( ( text, index ) => {
							return (
								<ListItem key={ index } sx={ { listStyle: 'disc', display: 'list-item', color: 'text.secondary', p: 0 } }>
									<Typography variant="body2" color="secondary">{ text }</Typography>
								</ListItem>
							);
						} ) }
					</List> }
				</Stack>
				<Stack pt={ 1 } pb={ 1.5 } px={ 2 }>
					<Button
						variant="contained"
						size="small"
						color="accent"
						onClick={ redirectHandler }
						sx={ { ml: 'auto' } }
					>{ ctaText }</Button>
				</Stack>
			</Box>
		</ClickAwayListener>
	);
};

PopoverCard.propTypes = {
	doClose: PropTypes.func,
};

export default PopoverCard;
