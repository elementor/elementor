import Portal from './portal';
import PrimaryAction from './primary-action';

export default function PortalledPrimaryAction() {
	return (
		<Portal>
			<PrimaryAction />
		</Portal>
	);
}
