import useTaxonomies from '../../hooks/use-taxonomies';
import { useMemo } from 'react';
import { Badge } from '@elementor/app-ui';
import { Link } from '@reach/router';

export default function OverviewTaxonomyBadge( props ) {
	const { data } = useTaxonomies();

	const taxonomyText = props.children;

	const type = useMemo(
		() => {
			if ( ! data ) {
				return null;
			}

			return data.find( ( item ) => item.text === taxonomyText )?.type;
		},
		[ data, taxonomyText ]
	);

	if ( ! type ) {
		return '';
	}

	return (
		<Link to={ `/kit-library?taxonomies[${ type }][]=${ taxonomyText }` }>
			<Badge>
				{ props.children }
			</Badge>
		</Link>
	);
}

OverviewTaxonomyBadge.propTypes = {
	children: PropTypes.string,
};
