import {
	ElementorAccessibilityIcon,
	FilterIcon,
	HeartHandShakeIcon,
	Settings2Icon,
	ShieldHalfFilledIcon,
} from '@elementor/icons';

import type { AuditCategory } from '../types';

export const CATEGORY_ICONS: Record< AuditCategory, typeof Settings2Icon > = {
	'best-practices': Settings2Icon,
	seo: FilterIcon,
	accessibility: ElementorAccessibilityIcon,
	performance: ShieldHalfFilledIcon,
	compliance: HeartHandShakeIcon,
};
