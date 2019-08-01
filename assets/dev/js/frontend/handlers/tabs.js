import TabsModule from './base-tabs';

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( TabsModule, {
		$element: $scope,
		toggleSelf: false,
	} );
};
