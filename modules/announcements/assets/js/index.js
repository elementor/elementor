import { Announcements, Overlay } from './components';
import AnnouncementCommands from './e-component';

export default class AnnouncementIndex {
	constructor() {
		this.initAnnouncement();
	}

	async initAnnouncement() {
		const container = document.getElementById( 'e-announcements-root' );
		const announcements = window.elementorAnnouncementsConfig?.announcements;
		if ( ! announcements || ! container ) {
			return;
		}
		const unMount = () => {
			ReactDOM.unmountComponentAtNode( container );
			document.getElementById( 'e-announcements-root' ).remove();
		};

		await $e.components.register( new AnnouncementCommands() );

		ReactDOM.render(
			<>
				<Overlay />
				<Announcements announcements={ announcements } unMount={ unMount } />
			</>,
			container,
		);
	}
}

new AnnouncementIndex();
