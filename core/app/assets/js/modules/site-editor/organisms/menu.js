import MenuItem from './../molecules/menu-item';
import { Context as TemplateTypesContext } from '../context/template-types';

export default function Menu() {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<nav className="elementor-app__site-editor__menu">
			<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } 	icon="eicon-filter" url="/site-editor/templates" />
			<div className="elementor-app__site-editor__menu__items-title">
				{ __( 'Site Parts', 'elementor' ) }
			</div>
				{ (
					templateTypes.map( ( item ) => (
						<MenuItem key={ item.type } text={ item.title } {...item } />
					) )
				) }
		</nav>
	);
}
