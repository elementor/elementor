import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import Infotip from '@elementor/ui/Infotip';
import ClickAwayListener from '@elementor/ui/ClickAwayListener';
import PromotionCard from './components/promotion-card';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<ClickAwayListener disableReactTree={ true } mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ props.onClose }>
						<Infotip
							content={ <PromotionCard onClose={ props.onClose } promotionsData={ props.promotionsData } /> }
							placement="right-start"
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
						/>
					</ClickAwayListener>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	promotionsData: PropTypes.object,
	onClose: PropTypes.func.isRequired,
};

export default App;
