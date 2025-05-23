type WidgetKey = string;
type ControlKey = string;

export interface ControlConfig {
	[key: ControlKey]: {
		timeoutBeforeAssertions?: number,
		timeoutAfterAssertions?: number,
		timeoutBeforeTest?: number,
		timeoutAfterTest?: number,
	}
}

export interface ControlsTestConfig {
	[key: WidgetKey]: ControlConfig;
}
