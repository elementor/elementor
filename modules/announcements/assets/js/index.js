import { Announcements, Overlay } from './components';
import AnnouncementCommands from './e-component';

export default class AnnouncementIndex {
	constructor() {
		this.container = document.getElementById( 'e-announcements-root' );
		if ( window.elementorAnnouncementsConfig.announcements && this.container ) {
			this.showAnnouncement = true;
			$e.components.register( new AnnouncementCommands() );
		}
	}

	initAnnouncement() {
		if ( this.showAnnouncement ) {
			ReactDOM.render(
				<>
					<Overlay />
					<Announcements announcements={ window.elementorAnnouncementsConfig.announcements } />
				</>,
				this.container,
			);
		}
	}
}

const announcementIndex = new AnnouncementIndex();
announcementIndex.initAnnouncement();
