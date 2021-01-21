import Button from 'elementor-app/ui/molecules/button';

import useLink from '../../../../../../../hooks/use-link/use-link';

export default function GoProButton() {
	const { url } = useLink();

	return (
		<a
			className="kit-content-list__pro-indication"
			target="_blank"
			rel="noopener noreferrer"
			href={ url.goPro }>
				<Button
					variant="contained"
					size="sm"
					text={ __( 'Go Pro', 'elementor' ) }
					color="cta"
				/>
		</a>
	);
}
