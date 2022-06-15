import BaseTabsV2 from 'elementor-frontend/handlers/base-tabs-v2';

export default class TabsV2 extends BaseTabsV2 {
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-container` should have 'elementor-tab-mobile-title'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	onInit( ...args ) {
		// TODO: Find better solution, Manually adding 'elementor-tab-mobile-title' for each container.
		if ( elementorFrontend.isEditMode() ) {
			const $widget = this.$element,
				$removed = this.findElement( '.elementor-tab-mobile-title' ).remove();

			let index = 1;

			this.findElement( '.e-container' ).each( function() {
				const $current = jQuery( this ),
					$desktopTabTitle = $widget.find( `.elementor-tabs-wrapper > *:nth-child(${ index })` ),
					mobileTitleHTML = `<div class="elementor-tab-title elementor-tab-mobile-title" data-tab="${ index }" role="tab">${ $desktopTabTitle.html() }</div>`;

					$current.before( mobileTitleHTML );

				++index;
			} );

			// On refresh since indexes are rearranged, do not call `activateDefaultTab` let editor control handle it.
			if ( $removed.length ) {
				return elementorModules.ViewModule.prototype.onInit.apply( this, args );
			}
		}

		super.onInit( ...args );
	}
}
