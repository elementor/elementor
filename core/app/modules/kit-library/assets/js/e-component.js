export default class EComponent extends $e.modules.ComponentBase {

	/**
	 * @return {string} the namespace of the component
	 */
	getNamespace() {
		return 'kit-library';
	}

	/**
	 * @return {*} All the commands of the components
	 */
	defaultCommands() {
		const trackingCommands = [
			'check',
			'uncheck',
			'choose-file',
			'choose-site-parts-to-import',
			'kit-import',
			'logo',
			'modal-close',
			'modal-open',
			'refetch',
			'seek-more-info',
		].reduce( ( allCommands, command ) => ( {
			...allCommands,
			[ command ]: () => {
            console.log( command ) // TODO: Delete when task is done
			},
		} ), {} );

		return {
			...trackingCommands,
		};
	}
}
