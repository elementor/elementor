export default class EComponent extends $e.modules.ComponentBase {
	/**
	 * @return {string} The namespace of the component
	 */
	getNamespace() {
		return 'announcement';
	}

	defaultCommands() {
		return [
			'close',
			'cta',
			'impression',
		].reduce( ( allCommands, command ) => ( {
			...allCommands,
			[ command ]: () => {
			},
		} ), {} );
	}
}
