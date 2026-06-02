import {
	ElementorAccessibilityIcon,
	FilterIcon,
	HeartHandShakeIcon,
	ShieldHalfFilledIcon,
	Settings2Icon,
} from '@elementor/icons';

import type { AuditCategory } from '../types';

export const CATEGORY_ICONS: Record< AuditCategory, typeof Settings2Icon > = {
	health: Settings2Icon,
	seo: FilterIcon,
	accessibility: ElementorAccessibilityIcon,
	performance: ShieldHalfFilledIcon,
	compliance: HeartHandShakeIcon,
};
