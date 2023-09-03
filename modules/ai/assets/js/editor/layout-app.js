import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import LayoutContent from './layout-content';

const LayoutApp = ( {
	isRTL,
	colorScheme,
	onClose,
	onConnect,
	onData,
	onInsert,
	onSelect,
	onGenerate,
} ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LayoutContent
					onClose={ onClose }
					onConnect={ onConnect }
					onData={ onData }
					onInsert={ onInsert }
					onSelect={ onSelect }
					onGenerate={ onGenerate }
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
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
};

export default LayoutApp;
