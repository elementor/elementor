import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { CssConverterHelper } from '../helper';

test.describe('Duplicate Detection Integration @duplicate-detection', () => {
	let cssHelper: CssConverterHelper;

	test.beforeAll(async () => {
		cssHelper = new CssConverterHelper();
	});

	test.beforeEach(async () => {
		await new Promise(resolve => setTimeout(resolve, 7000));
	});

	test.describe('Classes and Variables Together', () => {
		test.skip('should handle classes and variables in same workflow', async ({ request }) => {
			const cssClasses = '.integrated { background-color: var(--primary); }';
			const cssVars = ':root { --primary: #ff0000; }';

			const varsResult = await cssHelper.convertCssVariables(request, cssVars);
			expect(varsResult.success).toBe(true);
			expect(varsResult.stored_variables.created).toBeGreaterThanOrEqual(1);

			const classResult = await cssHelper.convertCssToClasses(request, cssClasses);
			expect(classResult.success).toBe(true);
			expect(classResult.data.stats.classes_converted).toBeGreaterThanOrEqual(1);
		});
	});
}); 