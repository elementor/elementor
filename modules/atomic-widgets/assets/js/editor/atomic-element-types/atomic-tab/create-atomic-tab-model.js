const createAtomicTabModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabModel extends AtomicElementBaseModel {
		updateSettings( element ) {
			const position = this.attributes.editor_settings?.position;

			return {
				...element.settings,
				paragraph: {
					$$type: 'string',
					value: `Tab ${ position }`,
				},
			};
		}
	};
};

export default createAtomicTabModel;
