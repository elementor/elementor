import SitePart from '../molecules/site-part';
import Grid from 'elementor-app/ui/grid/grid';
import CssGrid from 'elementor-app/ui/atoms/css-grid';
import Button from 'elementor-app/ui/molecules/button';
import ModalProvider from 'elementor-app/ui/modal/modal';

import { Context as TemplateTypesContext } from '../context/template-types';

import './site-parts.scss';

const InfoButton = ( props ) => {
	const toggleButtonProps = {
		text: __( 'Info', 'elementor' ),
		hideText: true,
		icon: 'eicon-info-circle info-toggle',
	};

	return (
		<ModalProvider toggleButtonProps={ toggleButtonProps } title={ props.title }>
			<Grid container spacing={25}>
				<Grid item sm={6}>
					<p>
						{ props.content } <Button text={ __( 'Learn More', 'elementor' ) } color="link" url={ props.docs } />
					</p>
				</Grid>
				<Grid item sm={6}>
					<div className="eps-modal__tip">
						<h3>{ __( 'Tip', 'elementor' ) }</h3>
						<p>{ props.tip }</p>
					</div>
					<section>
						<h3>{ __( 'Watch Video', 'elementor' ) }</h3>
						<div className="video-wrapper">
							<iframe id="ytplayer" src={ props.video_url } frameBorder="0"/>
						</div>
					</section>
				</Grid>
			</Grid>
		</ModalProvider>
	);
};

InfoButton.propTypes = {
	content: PropTypes.string.isRequired,
	docs: PropTypes.string.isRequired,
	tip: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	video_url: PropTypes.string.isRequired,
};

export default function SiteParts( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<CssGrid className="site-editor__site-parts">
			{ (
				templateTypes.map( ( item ) => (
					<SitePart className="site-part" actionButton={ <InfoButton { ...item.tooltip_data } /> } thumbnail={ item.urls.thumbnail } key={ item.type } { ...item }>
						{ React.createElement( props.hoverElement, item ) }
					</SitePart>
				) )
			) }
		</CssGrid>
	);
}

SiteParts.propTypes = {
	hoverElement: PropTypes.func.isRequired,
};
