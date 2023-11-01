import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import PropTypes from 'prop-types';
import LayoutContent from './layout-content';
import { attachmentsShape } from './types/attachments';

const LayoutApp = ( {
	isRTL,
	colorScheme,
	attachmentsTypes,
	attachments,
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
					attachmentsTypes={ attachmentsTypes }
					attachments={ attachments }
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
	attachmentsTypes: PropTypes.object,
	attachments: attachmentsShape,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
};

export default LayoutApp;
