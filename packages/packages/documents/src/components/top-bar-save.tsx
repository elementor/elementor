import { useActiveDocument } from '../hooks';

export function TopBarIndicator() {
	const document = useActiveDocument();

	if ( ! document ) {
		return null;
	}

	return (
		<div style={ { position: 'absolute', top: 'calc( ( 48px - 1em ) / 2 )', left: '50%', transform: 'translateX( -50% )' } }>
			{ document.isDirty && '[*] ' }
			{ document.title }
			{ document.isSaving && ' [Saving...] ' }
			{ document.isSavingDraft && ' [Saving Draft...] ' } ({ document.status })
		</div>
	);
}
