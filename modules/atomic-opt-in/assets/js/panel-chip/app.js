import {
	DirectionProvider,
	Infotip,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PopoverCard from './components/popover-card';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme } palette="unstable">
					<Infotip
						content={ <PopoverCard doClose={ props.onClose } /> }
						placement="right"
						arrow={ true }
						open={ true }
						disableHoverListener={ true }
						PopperProps={ {
							modifiers: [
								{
									name: 'offset',
									options:
										{ offset: [ -24, 8 ] },
								},
							],
						} }
					><span /></Infotip>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
};

export default App;
