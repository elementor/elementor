import * as path from 'path';

export const SAMPLE_CLASSES_ZIP = path.join( __dirname, 'import-sample-classes.zip' );

export const SAMPLE_CLASSES_LABELS = [ 'TestHeader', 'TestButton' ] as const;

export const CONFLICT_SAME_LABEL_ZIP = path.join( __dirname, 'import-conflict-same-label.zip' );

export const CONFLICT_FIXTURE = {
	classLabel: 'ConflictClass',
	importedColorRgb: 'rgb(0, 0, 255)',
} as const;
