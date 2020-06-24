import TabsModule from './base-tabs';

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( TabsModule, {
		$element: $scope,
		showTabFn: 'slideDown',
		hideTabFn: 'slideUp',
		hidePrevious: false,
		autoExpand: 'editor',
	} );
};
