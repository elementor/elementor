/* eslint-disable jsx-a11y/iframe-has-title */
import Button from 'elementor-app/ui/molecules/button';
import CssGrid from 'elementor-app/ui/atoms/css-grid';
import ModalProvider from 'elementor-app/ui/modal/modal';
import SitePart from '../molecules/site-part';

import { Context as TemplateTypesContext } from '../context/template-types';

const InfoButton = ( props ) => {
	const toggleButtonProps = {
		text: __( 'Info', 'elementor' ),
		hideText: true,
		icon: 'eicon-info-circle e-site-part__info-toggle',
	};

	return (
		<ModalProvider toggleButtonProps={ toggleButtonProps } title={ props.title }>
			<CssGrid columns={ 2 } spacing={ 60 }>
				<section>
					<h3>{ props.type }</h3>
					<p>
						{ props.content }<br />
						<Button text={ __( 'Learn More', 'elementor' ) } color="link" target="_blank" url={ props.docs } />
					</p>
					<div className="eps-modal__tip">
						<h3>{ __( 'Tip', 'elementor' ) }</h3>
						<p>{ props.tip }</p>
					</div>
				</section>
				<section>
					<h3>{ __( 'Watch Video', 'elementor' ) }</h3>
					<div className="video-wrapper">
						<iframe id="ytplayer" src={ props.video_url } frameBorder="0" />
					</div>
				</section>
			</CssGrid>
		</ModalProvider>
	);
};

InfoButton.propTypes = {
	content: PropTypes.string.isRequired,
	docs: PropTypes.string.isRequired,
	tip: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	video_url: PropTypes.string.isRequired,
};

export default function SiteParts( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<CssGrid className="e-site-editor__site-parts" colMinWidth={ 200 } spacing={ 25 }>
			{ (
				templateTypes.map( ( item ) => (
					<SitePart className="e-site-editor__site-part" actionButton={ <InfoButton type={ item.title }{ ...item.tooltip_data } /> } thumbnail={ item.urls.thumbnail } key={ item.type } { ...item }>
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
