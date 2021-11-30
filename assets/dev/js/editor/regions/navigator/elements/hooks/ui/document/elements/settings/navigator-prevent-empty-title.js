import Base from '../../../base/base';

/**
 * Hook responsible for prevent empty title in navigator.
 * If empty title provided the hook will change it back to `model.getTitle()`.
 */
export class NavigatorPreventEmptyTitle extends Base {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'navigator-prevent-empty-title';
	}

	getConditions( args ) {
		return super.getConditions( args ) && 0 === args.settings._title?.length;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const view = this.component.elements.getElementView( container.id ),
				model = view.model;

			view.ui.title.text( model.getTitle() );
		} );
	}
}

export default NavigatorPreventEmptyTitle;
