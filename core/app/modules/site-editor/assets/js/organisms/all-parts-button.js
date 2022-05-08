import MenuItem from 'elementor-app/ui/menu/menu-item';
import { Match } from '@reach/router';

export default function AllPartsButton( props ) {
	const activePathname = '/site-editor/templates';

	return (
		<Match path={ activePathname }>
			{ ( { match } ) => {
				const className = `eps-menu-item__link${ match || props.promotion ? ' eps-menu-item--active' : '' }`;

				return (
					<MenuItem
						text={ __( 'All Parts', 'elementor' ) }
						className={ className }
						icon="eicon-filter"
						url={ props.url }
				/> );
				}
			}
		</Match>
	);
}

AllPartsButton.propTypes = {
	url: PropTypes.string,
	promotion: PropTypes.bool,
};
