import Component from './component';

export default class TemplatesModule extends elementorModules.editor.utils.Module {
	onElementorInit() {
		$e.components.register( new Component( { manager: this } ) );

		this.registerTemplateTypes();
	}

	registerTemplateTypes() {
		elementor.templates.getDefaultTemplateTypeData().then( ( templateTypesData ) => {
			jQuery.each( elementor?.config?.library?.doc_types, function( type, title ) {
				elementor.templates.getDefaultTemplateTypeSafeData( title ).then( ( defaultData ) => {
					const safeData = jQuery.extend(
						true,
						{},
						templateTypesData,
						defaultData,
					);

					elementor.templates.registerTemplateType( type, safeData );
				} );
			} );
		} );
	}
}
