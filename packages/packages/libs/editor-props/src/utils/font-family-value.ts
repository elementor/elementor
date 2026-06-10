export const normalizeFontFamilyValue = ( storedValue: string ): string | null => {
	const normalized = storedValue.trim();

	return normalized || null;
};

export const formatFontFamilyForCss = normalizeFontFamilyValue;

export const getEnqueueFontFamily = normalizeFontFamilyValue;
