import HookDataDependency from 'elementor-api/modules/hooks/data/dependency';

/**
 * TODO: Create view for the tab-title, Temporary solution for avoid of full re-render when changing tab titles.
 */
export class NestedElementsRenderTabTitle extends HookDataDependency {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'nested-elements-render-tab-title';
	}

	getContainerType() {
		return 'repeater';
	}

	getConditions( args = {}, result ) {
		const { settings } = args;

		return !! settings.tab_title;
	}

	apply( args ) {
		const { containers = [ args.container ], settings } = args;

		containers.forEach( ( /* Container */ container ) => {
			const index = container.parent.children.indexOf( container ),
				$tabsWrapper = container.view.$el.find( '.elementor-tabs-wrapper:eq(0)' ),
				$tabsContentWrapper = container.view.$el.find( '.elementor-tabs-content-wrapper:eq(0)' ),
				$tabsTitle = $tabsWrapper.children( `.elementor-tab-title:eq(${ index })` ),
				$tabsMobileTitle = $tabsContentWrapper.children( `.elementor-tab-mobile-title:eq(${ index })` );

			$tabsTitle.html( settings.tab_title );
			$tabsMobileTitle.html( settings.tab_title );
		} );

		$e.internal( 'document/elements/set-settings', {
			options: {
				render: false,
			},
			settings,
			containers,
		} );

		return false; // Hook break.
	}
}
