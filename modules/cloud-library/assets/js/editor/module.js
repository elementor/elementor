import Component from './component';

export default class TemplatesModule extends elementorModules.editor.utils.Module {
	onElementorInit() {
		$e.components.register( new Component( { manager: this } ) );

		this.registerTemplateTypes();
	}

	registerTemplateTypes() {
		const templateTypesData = elementor.templates.getDefaultTemplateTypeData();

		jQuery.each( elementor?.config?.library?.doc_types, function( type, title ) {
			const safeData = jQuery.extend(
				true,
				{},
				templateTypesData,
				elementor.templates.getDefaultTemplateTypeSafeData( title ),
			);

			elementor.templates.registerTemplateType( type, safeData );
		} );
	}
}
