import {
	shouldUseAtomicRepeaters,
	widgetNodes,
} from 'elementor/modules/nested-elements/assets/js/editor/utils';

export class Insert extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const containers = historyItem.get( 'containers' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/repeater/insert', {
				containers,
				model: data.model,
				name: data.name,
				options: { at: data.index },
				isRestored: true,
			} );
		} else {
			$e.run( 'document/repeater/remove', {
				containers,
				name: data.name,
				index: data.index,
				isRestored: true,
			} );
		}
	}

	initialize( args ) {
		super.initialize( args );

		if ( ! args.model._id ) {
			args.model._id = elementorCommon.helpers.getUniqueId();
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'model', 'object', args );

		this.requireArgumentConstructor( 'name', String, args );
	}

	getHistory( args ) {
		const { model, name, options = { at: null }, containers = [ args.container ] } = args;

		return {
			containers,
			type: 'add',
			subTitle: __( 'Item', 'elementor' ),
			data: {
				model,
				name,
				index: options.at,
			},
			restore: this.constructor.restore,
		};
	}

	apply( args ) {
		const { model, name, options = { at: null }, containers = [ args.container ], renderAfterInsert = true, isRestored = false } = args,
			result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			const collection = container.settings.get( name );

			options.at = null === options.at ? collection.length : options.at;

			// On `collection.push` the renderer needs a container, the container needs a settingsModel.
			const rowSettingsModel = collection._prepareModel( model ),
				repeaterContainer = container.addRepeaterItem( name, rowSettingsModel, options.at );

			result.push( collection.push( rowSettingsModel, options ) );

			if ( renderAfterInsert ) {
				const widgetType = container.settings.get( 'widgetType' );

				if ( shouldUseAtomicRepeaters( widgetType ) && ! isRestored ) {
					const domConfig = widgetNodes( widgetType ),
						containerNode = container.view.$el[ 0 ],
						targetContainer = containerNode.querySelector( domConfig.targetContainer ),
						html = Marionette.Renderer.render( `#tmpl-elementor-${ widgetType }-content-single`, { data: model, view: repeaterContainer.view } ),
						node = document.createElement( 'div' );

					node.innerHTML = html;

					const nodeToInsert = node.querySelector( domConfig.node ),
						targetNode = targetContainer.children[ options.at ] || null;

					targetContainer.insertBefore( nodeToInsert, targetNode );
				} else {
					// Trigger render on widget but with the settings of the control.
					repeaterContainer.render();
				}
			}
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Insert;
