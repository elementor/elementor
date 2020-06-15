import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';

export default function Menu() {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<UiMenu menuItems={ templateTypes }/>
	);
}
