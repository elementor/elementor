import BackgroundSlideshow from '../background-slideshow';
import BackgroundVideo from './background-video';
import HandlesPosition from './handles-position';
import StretchedSection from './stretched-section';
import Shapes from './shapes';

export default ( $scope ) => {
	if ( elementorFrontend.isEditMode() || $scope.hasClass( 'elementor-section-stretched' ) ) {
		elementorFrontend.elementsHandler.addHandler( StretchedSection, { $element: $scope } );
	}

	if ( elementorFrontend.isEditMode() ) {
		elementorFrontend.elementsHandler.addHandler( Shapes, { $element: $scope } );
		elementorFrontend.elementsHandler.addHandler( HandlesPosition, { $element: $scope } );
	}

	elementorFrontend.elementsHandler.addHandler( BackgroundVideo, { $element: $scope } );

	elementorFrontend.elementsHandler.addHandler( BackgroundSlideshow, { $element: $scope } );
};
