import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import CardOverlay from 'elementor-app/ui/card/card-overlay';
import Typography from 'elementor-app/ui/atoms/typography';
import Button from 'elementor-app/ui/molecules/button';

import './site-part.scss';

export default function SitePart( props ) {
	return (
		<Card className="site-part">
			<CardHeader>
				<Typography tagName="h1" className="card__headline">{ props.title }</Typography>
				<Button text="Info" hideText={ true } Icon="eicons-info" />
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
