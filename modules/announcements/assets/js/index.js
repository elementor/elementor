import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
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

		await $e.components.register( new AnnouncementCommands() );

		this.render( (
			<>
				<Overlay />
				<Announcements
					announcements={ announcements }
					unMount={ () => {
						Root.unmount();
						container.remove();
					} }
				/>
			</>
		), container );
	}

	// Support conditional rendering based on the React version.
	// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
	render( app, domElement ) {
		let renderFn;

		try {
			this.root = createRoot( domElement );

			renderFn = () => {
				this.root.render( app );
			};
		} catch ( e ) {
			renderFn = () => {
				// eslint-disable-next-line react/no-deprecated
				ReactDOM.render( app, domElement );
			};
		}

		renderFn();
	}
}

new AnnouncementIndex();
