import BackgroundSlideshow from '../background-slideshow';
import BackgroundVideo from '../background-video';
import HandlesPosition from '../handles-position';
import StretchedSection from './stretched-section';
import Shapes from './shapes';

const handlers = [
	StretchedSection, // Must run before BackgroundSlideshow to init the slideshow only after the stretch.
	BackgroundSlideshow,
	BackgroundVideo,
	Shapes,
];

if ( elementorFrontend.isEditMode() ) {
	handlers.push( HandlesPosition );
}

export default handlers;
