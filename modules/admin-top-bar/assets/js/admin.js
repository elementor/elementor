import { createRoot } from 'react-dom';
import AdminTopBar from './admin-top-bar';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;
const adminTopBarElement = createRoot( document.getElementById( 'e-admin-top-bar-root' ) );

adminTopBarElement.render(
	<AppWrapper>
		<AdminTopBar />
	</AppWrapper>
);
