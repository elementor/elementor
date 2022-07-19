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
			'apply-kit',
			'approve-import',
			'approve-selection',
			'back-to-library',
			'change-sort-direction',
			'change-sort-type',
			'check',
			'check-item',
			'check-out-kit',
			'checking-a-checkbox',
			'check-kits-on-theme-forest',
			'checkbox-filtration',
			'collapse',
			'choose-file',
			'choose-site-parts-to-import',
			'clear-filter',
			'clicking-on-a-tag',
			'close',
			'enable',
			'expand',
			'file-upload',
			'filter',
			'filter-selection',
			'modal-error',
			'favorite-icon',
			'go-back',
			'go-back-to-view-kits',
			'kit-free-search',
			'kit-is-live-load',
			'kit-import',
			'kit-part-view-demo',
			'logo',
			'mark-as-favorite',
			'modal-close',
			'modal-open',
			'refetch',
			'responsive-controls',
			'see-it-live',
			'seek-more-info',
			'skip',
			'select-organizing-category',
			'uncheck',
			'unchecking-a-checkbox',
			'unfiltered-file-modal-load',
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
