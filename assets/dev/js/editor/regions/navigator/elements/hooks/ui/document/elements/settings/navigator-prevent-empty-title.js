import Base from '../../../base/base';

export class NavigatorPreventEmptyTitle extends Base {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'navigator-prevent-empty-title';
	}

	getConditions( args ) {
		return super.getConditions() && 0 === args.settings._title?.length;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const { view, model } = container.navigator;

			view.ui.title.text( model.getTitle() );
		} );
	}
}

export default NavigatorPreventEmptyTitle;
