import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import Typography from 'elementor-app/ui/atoms/typography';
import Button from 'elementor-app/ui/molecules/button';

import './site-part.scss';

export default class SitePart extends Card {
	getHeader() {
		const Indicator = ( props ) => {
			if ( ! props.showIndicator ) {
				return '';
			}

			const active = props.active ? 'indicator-bullet--active' : '';

			return <i className={`indicator-bullet ${ active }`}/>;
		};

		Indicator.propTypes = {
			active: PropTypes.bool,
			showIndicator: PropTypes.bool,
		};

		return (
			<CardHeader>
				<>
					<Indicator active={ true }/>
					<Typography tagName="h1" className="card__headline">{ this.props.title }</Typography>
					<Button text="Info" hideText={ true } icon="eicon-info-circle info-toggle" />
				</>
			</CardHeader>
		);
	}

	getBody() {
		return (
			<CardBody>
				<CardImage alt={ this.props.partTitle } src={ this.props.partThumbnail }>
					{ this.props.children }
				</CardImage>
			</CardBody>
		);
	}
}

SitePart.propTypes = {
	partThumbnail: PropTypes.string.isRequired,
	partTitle: PropTypes.string.isRequired,
	children: PropTypes.object,
	showIndicator: PropTypes.bool,
};
