import MenuItem from 'elementor-app/ui/menu/menu-item';
import { Match } from '@reach/router';

export default function AllPartsButton( props ) {
	const activePathname = '/site-editor/templates';

	return (
		<Match path={ activePathname }>
			{ ( { match } ) => {
				const className = match || props.promotion ? 'eps-menu-item--active' : '';

				return (
					<div className={ className }>
						<MenuItem
							className="eps-menu-item__link"
							text={__( 'All Parts', 'elementor' )}
							icon="eicon-filter" url={ props.url } />
					</div>
					);
				}
			}
		</Match>
	);
}

AllPartsButton.propTypes = {
	url: PropTypes.string,
	promotion: PropTypes.bool,
};
