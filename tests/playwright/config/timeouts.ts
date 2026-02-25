export const timeouts = {
	singleTest: 90_000,
	global: 15 * 60_000,
	veryShort: 120,
	short: 500,
	expect: 5_000,
	action: 5_000,
	longAction: 10_000,
	heavyAction: 30_000, // Change to longAction after ED-22878 is fixed.
	navigation: 10_000,
};
