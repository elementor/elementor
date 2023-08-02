import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import LayoutContent from './layout-content';

const LayoutApp = ( {
	isRTL,
	colorScheme,
	onClose,
	onConnect,
	onGenerationStart,
	onGenerationEnd,
	onInsert,
	onSelect,
} ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LayoutContent
					onClose={ onClose }
					onConnect={ onConnect }
					onGenerationStart={ onGenerationStart }
					onGenerationEnd={ onGenerationEnd }
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
	onGenerationStart: PropTypes.func.isRequired,
	onGenerationEnd: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default LayoutApp;
