import UiMenu from 'elementor-app/ui/menu/menu';
import { Context as TemplateTypesContext } from '../context/template-types';
import Button from 'elementor-app/ui/molecules/button';
import AddNewButton from 'elementor-app/ui/molecules/add-new-button';
import useLicense from '../../../../../hooks/use-license';

import './menu.scss';

export default function Menu( props ) {
	const { isLocked } = useLicense();

	const { templateTypes } = React.useContext( TemplateTypesContext );

	const actionButton = ( itemProps ) => {
			const className = 'eps-menu-item__action-button';

			if ( props.promotion || isLocked.locked ) {
				return <Button text={ __( 'Upgrade Now', 'elementor' ) } hideText icon="eicon-lock" className={ className } />;
			}

			const goToCreate = () => {
				location.href = itemProps.urls.create;
			};

			return (
				null === isLocked.locked
					? <></>
					: <span className={ className }>
						<AddNewButton hideText={ true } size="sm" onClick={ () => goToCreate() } />
					</span>
			);
		};

	return (
		<UiMenu menuItems={ templateTypes } actionButton={ actionButton } promotion={ props.promotion }>
			{ props.allPartsButton }
			<div className="eps-menu__title">
				{ __( 'Site Parts', 'elementor' ) }
			</div>
		</UiMenu>
	);
}

Menu.propTypes = {
	allPartsButton: PropTypes.element.isRequired,
	promotion: PropTypes.bool,
};
