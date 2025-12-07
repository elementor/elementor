import { DirectionProvider, Drawer, ThemeProvider } from '@elementor/ui';
import PropTypes from 'prop-types';
import WhatsNewHeader from './whats-new-header';
import WhatsNewContent from './whats-new-content';
import { DrawerContainer } from './styled-components';

const WhatsNewDrawer = ( { isOpen, setIsOpen } ) => {
	const handleClose = () => setIsOpen( false );

	return (
		<DirectionProvider rtl={ elementorCommon?.config?.isRTL }>
			<ThemeProvider colorScheme="light">
				<Drawer
					anchor="right"
					open={ isOpen }
					onClose={ handleClose }
					ModalProps={ {
						style: {
							zIndex: 999999,
						},
					} }
				>
					<DrawerContainer role="presentation">
						<WhatsNewHeader onClose={ handleClose } />
						<WhatsNewContent />
					</DrawerContainer>
				</Drawer>
			</ThemeProvider>
		</DirectionProvider>
	);
};

WhatsNewDrawer.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default WhatsNewDrawer;

