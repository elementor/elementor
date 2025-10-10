import { AppsEventTracking } from '../../../../assets/js/event-track/apps-event-tracking';

class Admin {
	constructor() {
		const urlParams = new URLSearchParams( window.location.search );

		if ( 'elementor-tools' === urlParams.get( 'page' ) ) {
			this.sendPageToolsViewedEvent();

			elementorAdmin.elements.$settingsTabs.on( 'focus', () => {
				const location = window.location.hash.slice( 1 );

				this.maybeSendImportExportLocationEvent( location );
			} );

			this.maybeSendImportExportLocationEvent( window.location.hash.slice( 1 ) );
		}

		this.revertButton = document.getElementById( 'elementor-import-export__revert_kit' );
		this.importFroLibraryButton = document.getElementById( 'elementor-import-export__import_from_library' );
		this.importButton = document.getElementById( 'elementor-import-export__import' );
		this.exportButton = document.getElementById( 'elementor-import-export__export' );

		if ( this.revertButton ) {
			this.revertButton.addEventListener( 'click', this.onRevertButtonClick.bind( this ) );
		}

		if ( this.importFroLibraryButton ) {
			this.importFroLibraryButton.addEventListener( 'click', this.onImportFromLibraryButtonClick.bind( this ) );
		}

		if ( this.importButton ) {
			this.importButton.addEventListener( 'click', this.onImportButtonClick.bind( this ) );
		}

		if ( this.exportButton ) {
			this.exportButton.addEventListener( 'click', this.onExportButtonClick.bind( this ) );
		}
	}

	sendPageToolsViewedEvent() {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.admin.pluginToolsTab );
	}

	maybeSendImportExportLocationEvent( location ) {
		if ( 'tab-import-export-kit' === location ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.admin.pluginWebsiteTemplatesTab );
		}
	}

	onRevertButtonClick() {
		AppsEventTracking.sendImportExportAdminAction( 'Revert' );
	}

	onExportButtonClick() {
		AppsEventTracking.sendImportExportAdminAction( 'Export' );
	}

	onImportButtonClick() {
		AppsEventTracking.sendImportExportAdminAction( 'Import' );
	}

	onImportFromLibraryButtonClick() {
		AppsEventTracking.sendImportExportAdminAction( 'Import from Library' );
	}
}

window.addEventListener( 'load', () => {
	new Admin();
} );
