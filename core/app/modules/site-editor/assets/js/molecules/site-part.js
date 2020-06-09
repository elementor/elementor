import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import CardOverlay from 'elementor-app/ui/card/card-overlay';

import './site-part.scss';

export default function SitePart( props ) {
	return (
		<Card className="site-part">
			<CardHeader>
				<h1 className="card__headline">{ props.title }</h1>
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.title } src={ props.urls.thumbnail }>
					<CardOverlay>{ props.children }</CardOverlay>
				</CardImage>
			</CardBody>
		</Card>
	);
}

SitePart.propTypes = {
	type: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	urls: PropTypes.object.isRequired,
	children: PropTypes.object.isRequired,
};

SitePart.defaultProps = {
	className: '',
};
