import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import LayoutContent from './layout-content';

const LayoutApp = ( {
	isRTL,
	colorScheme,
	onClose,
	onConnect,
	onGeneration,
	onInsert,
	onSelect,
} ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LayoutContent
					onClose={ onClose }
					onConnect={ onConnect }
					onGeneration={ onGeneration }
					onInsert={ onInsert }
					onSelect={ onSelect }
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
	onGeneration: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default LayoutApp;
