const createAtomicTabModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabModel extends AtomicElementBaseModel {
		modifyDefaultChildren( elements ) {
			const [ paragraph ] = elements;
			const position = this.attributes.editor_settings?.initial_position;

			paragraph.settings.paragraph = {
				$$type: 'string',
				value: `Tab ${ position }`,
			};

			return elements;
		}
	};
};

export default createAtomicTabModel;
