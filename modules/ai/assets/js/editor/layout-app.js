import PropTypes from 'prop-types';
import LayoutContent from './layout-content';
import { AttachmentPropType, AttachmentsTypesPropType } from './types/attachment';
import { ConfigProvider, LAYOUT_APP_MODES } from './pages/form-layout/context/config';
import { RemoteConfigProvider } from './pages/form-layout/context/remote-config';
import { RequestIdsProvider } from './context/requests-ids';

const LayoutApp = ( props ) => {
	return (
		<RemoteConfigProvider
			onError={ props.onClose }>
			<RequestIdsProvider>
				<ConfigProvider
					mode={ props.mode }
					attachmentsTypes={ props.attachmentsTypes }
					onClose={ props.onClose }
					onConnect={ props.onConnect }
					onData={ props.onData }
					onInsert={ props.onInsert }
					onSelect={ props.onSelect }
					onGenerate={ props.onGenerate }
					currentContext={ props.currentContext }
					hasPro={ props.hasPro }>
					<LayoutContent attachments={ props.attachments } />
				</ConfigProvider>
			</RequestIdsProvider>
		</RemoteConfigProvider>
	);
};

LayoutApp.propTypes = {
	mode: PropTypes.oneOf( LAYOUT_APP_MODES ).isRequired,
	attachmentsTypes: AttachmentsTypesPropType,
	attachments: PropTypes.arrayOf( AttachmentPropType ),
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
	currentContext: PropTypes.object,
	hasPro: PropTypes.bool,
};

export default LayoutApp;
