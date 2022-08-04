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
			'browse',
			'change-sort-direction',
			'change-sort-type',
			'change-sort-value',
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
			'close',
			'drop',
			'enable',
			'expand',
			'file-upload',
			'filter',
			'filter-selection',
			'favorite-icon',
			'go-back',
			'go-back-to-view-kits',
			'kit-free-search',
			'kit-is-live-load',
			'kit-import',
			'logo',
			'mark-as-favorite',
			'modal-close',
			'modal-load',
			'modal-open',
			'modal-error',
			'open-site-area',
			'refetch',
			'responsive-controls',
			'see-it-live',
			'seek-more-info',
			'sidebar-tag-filter',
			'skip',
			'select-organizing-category',
			'top-bar-change-view',
			'uncheck',
			'unchecking-a-checkbox',
			'view-demo-page',
			'view-demo-part',
			'view-overview-page',
		].reduce( ( allCommands, command ) => ( {
			...allCommands,
			[ command ]: () => {
			},
		} ), {} );

		return {
			...trackingCommands,
		};
	}
}
