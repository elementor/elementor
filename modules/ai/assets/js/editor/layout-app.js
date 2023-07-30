import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import LayoutContent from './layout-content';

const LayoutApp = ( { isRTL, colorScheme, onClose, onConnect, onGenerated, onInsert } ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LayoutContent
					onClose={ onClose }
					onConnect={ onConnect }
					onGenerated={ onGenerated }
					onInsert={ onInsert }
				/>
			</ThemeProvider>
		</DirectionProvider>
	);
};

LayoutApp.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onGenerated: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
};

export default LayoutApp;
