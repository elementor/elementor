import * as Commands from './commands/commands';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/elements/repeater';
	}

	defaultCommands() {
		return {
			active: ( args ) => {
				const { index, containers = [ args.container ] } = args;

				containers.forEach( ( container ) => {
					// TODO: Ask mati how to do it more efficient way.
					// And even better that each active container will have his control attached to the view.
					const contentChild = elementor.getPanelView().getChildView( 'content' ).children;

					if ( ! contentChild ) {
						return;
					}

					let { _views } = contentChild,
						control = null;

					for ( const i in _views ) {
						if ( _views[ i ].options && _views[ i ].options.element.model.id === container.model.id ) {
							control = _views[ i ];
							break;
						}
					}

					if ( ! control ) {
						return;
					}

					control.getOption( 'elementEditSettings' ).set( 'activeItemIndex', index );
				} );
			},

			duplicate: ( args ) => ( new Commands.Duplicate( args ) ).run(),
			insert: ( args ) => ( new Commands.Insert( args ) ).run(),
			move: ( args ) => ( new Commands.Move( args ) ).run(),
			remove: ( args ) => ( new Commands.Remove( args ) ).run(),
			settings: ( args ) => ( new Commands.Settings( args ) ).run(),
		};
	}

	defaultShortcuts() {
		return {
		};
	}
}
