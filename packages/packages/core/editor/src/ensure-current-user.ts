import { ensureUser } from '@elementor/editor-current-user';
import { registerDataHook } from '@elementor/editor-v1-adapters';

export async function ensureCurrentUser() {
	return registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		try {
			await ensureUser();
		} catch {}
	} );
}
