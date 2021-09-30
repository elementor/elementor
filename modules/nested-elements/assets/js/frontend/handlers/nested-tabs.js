import BaseTabs from 'elementor-frontend/handlers/base-tabs';

export default class NestedTabs extends BaseTabs {
	getDefaultSettings() {
		const defaultSettings = { ... super.getDefaultSettings() };

		defaultSettings.toggleSelf = false;
		defaultSettings.selectors.tabContent = '.e-container';

		return defaultSettings;
	}

	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-container` should have 'elementor-tab-mobile-title'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	onInit( ...args ) {
		if ( elementorFrontend.isEditMode() ) {
			const $widget = this.$element;
			let index = 1;

			// TODO: Find better solution, Manually adding 'elementor-tab-mobile-title' for each container.
			this.findElement( '.e-container' ).each( function() {
				const $current = jQuery( this ),
					$desktopTabTitle = $widget.find( `.elementor-tabs-wrapper > *:nth-child(${ index })` ),
					mobileTitleHTML = `<div class="elementor-tab-title elementor-tab-mobile-title" data-tab="${ index }" role="tab">${ $desktopTabTitle.html() }</div>`;

					$current.before( mobileTitleHTML );

				++index;
			} );
		}

		super.onInit( ...args );
	}
}
