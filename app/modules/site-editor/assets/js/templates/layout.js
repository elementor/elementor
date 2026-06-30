import { useCallback, useMemo } from 'react';
import Page from 'elementor-app/layout/page';
import Menu from '../organisms/menu';
import TemplateTypesContext from '../context/template-types';
import useQueryParams from 'elementor-app/hooks/use-query-params';
import safeRedirect from '../../../../import-export/assets/js/shared/utils/redirect';

import './site-editor.scss';

export default function Layout( props ) {
	const { return_to: returnTo } = useQueryParams().getAll();

	const onClose = useCallback( () => {
		if ( returnTo && safeRedirect( returnTo ) ) {
			return;
		}
		window.top.location = elementorAppConfig.admin_url;
	}, [ returnTo ] );

	const config = useMemo( () => ( {
		title: __( 'Theme Builder', 'elementor' ),
		titleRedirectRoute: props.titleRedirectRoute ?? null,
		headerButtons: props.headerButtons,
		sidebar: <Menu allPartsButton={ props.allPartsButton } promotion={ props.promotion } />,
		content: props.children,
		onClose,
	} ), [ props.titleRedirectRoute, props.headerButtons, props.allPartsButton, props.promotion, props.children, onClose ] );

	return (
		<TemplateTypesContext>
			<Page { ...config } />
		</TemplateTypesContext>
	);
}

Layout.propTypes = {
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	allPartsButton: PropTypes.element.isRequired,
	children: PropTypes.object.isRequired,
	promotion: PropTypes.bool,
	titleRedirectRoute: PropTypes.string,
};

Layout.defaultProps = {
	headerButtons: [],
};
