import BackgroundSlideshow from './background-slideshow';

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( BackgroundSlideshow, { $element: $scope } );
};
