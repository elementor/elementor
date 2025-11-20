const createAtomicTabModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabModel extends AtomicElementBaseModel {
		modifyDefaultChildren( element ) {
			const position = this.attributes.editor_settings?.initial_position;

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
