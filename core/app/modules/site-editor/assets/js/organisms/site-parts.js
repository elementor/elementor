import SitePart from '../molecules/site-part';
import Button from 'elementor-app/ui/molecules/button';
import { Context as TemplateTypesContext } from '../context/template-types';
import './site-parts.scss';

export default function SiteParts( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext ),
		ActionButton = <Button text="Info" hideText={ true } icon="eicon-info-circle info-toggle" />;

	return (
		<section className="site-editor__site-parts u-grid">
			{ (
				templateTypes.map( ( item ) => (
					<SitePart className="site-part" actionButton={ ActionButton } thumbnail={ item.urls.thumbnail } key={ item.type } { ...item }>
						{ React.createElement( props.hoverElement, item ) }
					</SitePart>
				) )
			) }
		</section>
	);
}

SiteParts.propTypes = {
	hoverElement: PropTypes.func.isRequired,
};
