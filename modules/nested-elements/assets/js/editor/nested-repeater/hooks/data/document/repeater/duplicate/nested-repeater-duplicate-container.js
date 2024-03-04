import Base from '../../../base';
import { findChildContainerOrFail, shouldUseImprovedRepeaters, maybeSortContainerViews, sortViewsByModels } from 'elementor/modules/nested-elements/assets/js/editor/utils';
import BaseElementView from 'elementor-elements/views/base';

export class NestedRepeaterDuplicateContainer extends Base {
	getId() {
		return 'document/repeater/duplicate--nested-repeater-duplicate-container';
	}

	getCommand() {
		return 'document/repeater/duplicate';
	}

	apply( { container, index } ) {
		const result = $e.run( 'document/elements/duplicate', {
			container: findChildContainerOrFail( container, index ),
			options: {
				edit: false, // Not losing focus.
			},
		} );

		const widgetType = container.settings.get( 'widgetType' );

		if ( shouldUseImprovedRepeaters( widgetType ) ) {
			elementor.$preview[ 0 ].contentWindow.dispatchEvent(
				new CustomEvent( 'elementor/nested-container/created', {
					detail: {
						container,
						targetContainer: result,
						index,
						repeaterType: 'duplicate',
					} },
				) );

			// container.view.children._views = maybeSortContainerViews( container.view.children._views, index );
			container.view.children._views = sortViewsByModels( container.model.get( 'elements' ).models, container.view.children._views );
			// container.view.container = null;
			// container = container.view.getContainer();
			// // container = BaseElementView.prototype.getContainer.apply( container.view, [ container.args ] );
			// container = BaseElementView.prototype.render.apply( container.view, container.args );
			// const test = container;
			//
			// Marionette.CollectionView.prototype._renderChildren.call(this);


			// const showCollection = function() {
			// 	let ChildView;
			//
			// 	const models = container.model.get( 'elements' ).models;
			//
			// 	// eslint-disable-next-line no-shadow
			// 	_.each( models, function( child, index ) {
			// 		delete container.view.children._views[ index ];
			// 		ChildView = container.view.getChildView( child );
			// 		container.view.addChild( child, ChildView, index );
			// 	}, this );
			// };
			//
			// // Marionette.CompositeView.prototype.destroyChildren.apply( container.view );
			// showCollection();

			// const test = container;

			// Marionette.CompositeView.prototype.reorder.call( container );
		} else {
			container.render();
		}
	}
}

export default NestedRepeaterDuplicateContainer;
