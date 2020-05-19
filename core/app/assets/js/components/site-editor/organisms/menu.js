import MenuItem from './../molecules/menu-item';
import { TemplateTypesConsumer } from '../context/template-types';

export default class Menu extends React.Component {
	render() {
		return (
			<nav className="elementor-app__site-editor__menu">
				<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } 	icon="eicon-filter" url="/site-editor/templates" />
				<div className="elementor-app__site-editor__menu__items-title">
					{ __( 'Site Parts', 'elementor' ) }
				</div>
				<TemplateTypesConsumer>
					{ ( state ) => (
						state.templateTypes.map( ( item ) => (
							<MenuItem key={ item.type } text={ item.title } {...item } />
						) )
					) }
				</TemplateTypesConsumer>
			</nav>
		);
	}
}
