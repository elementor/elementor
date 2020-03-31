import ComponentBase from 'elementor-api/modules/component-base';
import * as commandsData from './commands/';
import * as hooks from './hooks/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'globals';
	}

	registerAPI() {
		super.registerAPI();

		setTimeout( () => {
			$e.data.get( 'globals/colors', {}, { cache: true } );
			$e.data.get( 'globals/typography', {}, { cache: true } );

			// Add global cache.
			const document = elementor.documents.getCurrent(),
				sections = document.config.elements,
				columns = sections.map( ( section ) => section.elements.flat() ).flat(),
				widgets = columns.map( ( column ) => column.elements.flat() ).flat(),
				allFlatElements = [
					...sections,
					...columns,
					...widgets,
				];

			// TODO: Remove: Temp cache add.
			allFlatElements.forEach( ( element ) =>
				// Add cache.
				$e.utils.data.cache(
					'document/elements',
					{
						document_id: document.id,
						element_id: element.id,
					},
					element
				)
			);
		} );
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
