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
			'approve-import',
			'approve-selection',
			'check',
			'choose-file',
			'choose-site-parts-to-import',
			'close',
			'enable',
			'go-back',
			'kit-import',
			'logo',
			'modal-close',
			'modal-open',
			'refetch',
			'seek-more-info',
			'skip',
			'uncheck',
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
