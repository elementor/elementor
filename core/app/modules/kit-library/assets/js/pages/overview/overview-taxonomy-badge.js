import Badge from '../../components/badge';
import useTaxonomies from '../../hooks/use-taxonomies';
import { Link } from '@reach/router';
import { useMemo } from 'react';

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
		[ data, taxonomyText ],
	);

	if ( ! type ) {
		return '';
	}

	return (
		<Link
			onClick={ () => {
				elementorCommon.events.eventTracking(
					'kit-library/clicking-on-a-tag',
					{
						placement: 'kit library',
						event: 'overview sidebar tag select',
					},
					{
						source: 'overview',
						kit_name: props.kitName,
						tag: taxonomyText,
					},
				);
			} }
			to={ `/kit-library?taxonomies[${ type }][]=${ taxonomyText }` }
		>
			<Badge>
				{ props.children }
			</Badge>
		</Link>
	);
}

OverviewTaxonomyBadge.propTypes = {
	children: PropTypes.string,
};
