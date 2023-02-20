import { Announcements } from './components';
import { Overlay } from './components';

if( window.elementorAdminConfig.announcements ){
	ReactDOM.render(
		<>
			<Overlay/>
			<Announcements announcments={window.elementorAdminConfig.announcements}/>
		</>,
		document.getElementById( 'e-announcements-root' ),
	);
}