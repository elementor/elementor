import PropTypes from 'prop-types';
import LayoutContent from './layout-content';
import { AttachmentPropType, AttachmentsTypesPropType } from './types/attachment';
import { ConfigProvider, LAYOUT_APP_MODES } from './pages/form-layout/context/config';
import { RemoteConfigProvider } from './pages/form-layout/context/remote-config';

const LayoutApp = ( {
	mode,
	attachmentsTypes,
	attachments,
	onClose,
	onConnect,
	onData,
	onInsert,
	onSelect,
	onGenerate,
	currentContext,
	hasPro,
	sessionId,
} ) => {
	return (
		<RemoteConfigProvider
			onError={ onClose }
		>
			<ConfigProvider
				mode={ mode }
				attachmentsTypes={ attachmentsTypes }
				onClose={ onClose }
				onConnect={ onConnect }
				onData={ onData }
				onInsert={ onInsert }
				onSelect={ onSelect }
				onGenerate={ onGenerate }
				currentContext={ currentContext }
				hasPro={ hasPro }
				sessionId={ sessionId }
			>
				<LayoutContent
					attachments={ attachments }
				/>
			</ConfigProvider>
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
	sessionId: PropTypes.string,
};

export default LayoutApp;
