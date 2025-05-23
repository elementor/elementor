import { Slot } from '@elementor/locations';
import { LOCATION_PRIMARY_ACTION } from '../../locations';

export default function PrimaryActionLocation() {
	return (
		<Slot location={ LOCATION_PRIMARY_ACTION } />
	);
}
