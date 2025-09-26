export interface Experiments {
	[key: string]: string;
}

export interface TestInfo {
	title: string;
	file: string;
	line: number;
	column: number;
	workerIndex: number;
	repeatEachIndex: number;
	retry: number;
	expectedStatus: 'passed' | 'failed' | 'skipped';
	timeout: number;
	annotations: Array<{ type: string; description?: string }>;
	attachments: Array<{ name: string; contentType: string; path?: string; body?: Buffer }>;
}
