import BaseNestedTabs from 'elementor-frontend/handlers/base-tabs-v2';

export default class NestedTabs extends BaseNestedTabs {
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con` should have 'e-collapse'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	onInit( ...args ) {
		// TODO: Find better solution, Manually adding 'e-collapse' for each container.
		if ( elementorFrontend.isEditMode() ) {
			const $widget = this.$element,
				$removed = this.findElement( '.e-collapse' ).remove();

			let index = 1;

			this.findElement( '.e-con' ).each( function() {
				const $current = jQuery( this ),
					$desktopTabTitle = $widget.find( `.e-n-tabs-heading > *:nth-child(${ index })` ),
					mobileTitleHTML = `<div class="e-n-tab-title e-collapse" data-tab="${ index }" role="tab">${ $desktopTabTitle.html() }</div>`;

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
