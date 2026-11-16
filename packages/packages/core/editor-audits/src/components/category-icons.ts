import { BoltIcon, ElementorAccessibilityIcon, FileSearchIcon, Settings2Icon, ShieldCheckIcon } from '@elementor/icons';

import type { AuditCategory } from '../types';

export const CATEGORY_ICONS: Record< AuditCategory, typeof Settings2Icon > = {
	'best-practices': Settings2Icon,
	seo: FileSearchIcon,
	accessibility: ElementorAccessibilityIcon,
	performance: BoltIcon,
	compliance: ShieldCheckIcon,
};
