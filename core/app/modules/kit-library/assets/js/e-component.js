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
			'kit-import',
			'logo',
			'modal-close',
			'modal-open',
			'refetch',
			'seek-more-info',
		].reduce( ( allCommands, command ) => ( {
			...allCommands,
			[ command ]: () => {
            console.log( command ) // Delete when task is done
			},
		} ), {} );

		return {
			...trackingCommands,
		};
	}
}
