import useTaxonomies from '../../hooks/use-taxonomies';
import { useMemo } from 'react';
import { Badge } from '@elementor/app-ui';
import { Link } from '@reach/router';

export default function OverviewTaxonomyBadge( props ) {
	const { data } = useTaxonomies();

	const type = useMemo(
		() => {
			if ( ! data ) {
				return null;
			}

			return data.find( ( item ) => item.text === props.children )?.type;
		},
		[ data, props.children ]
	);

	if ( ! type ) {
		return '';
	}

	return (
		<Link to={ `/kit-library?taxonomies[${ type }][]=${ props.children }` }>
			<Badge>
				{ props.children }
			</Badge>
		</Link>
	);
}

OverviewTaxonomyBadge.propTypes = {
	children: PropTypes.string,
};
