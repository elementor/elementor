<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Submissions_Schema {

	const MIN_BATCH_SIZE = 1;
	const MAX_BATCH_SIZE = 50;

	const ACTION_MARK_READ = 'mark_read';
	const ACTION_MARK_UNREAD = 'mark_unread';
	const ACTION_TRASH = 'trash';
	const ACTION_RESTORE = 'restore';
	const ACTION_UPDATE_VALUES = 'update_values';

	const ACTIONS = [
		self::ACTION_MARK_READ,
		self::ACTION_MARK_UNREAD,
		self::ACTION_TRASH,
		self::ACTION_RESTORE,
		self::ACTION_UPDATE_VALUES,
	];

	public static function manage_input(): array {
		return [
			'type' => 'object',
			'required' => [ 'operations' ],
			'properties' => [
				'operations' => [
					'type' => 'array',
					'minItems' => self::MIN_BATCH_SIZE,
					'maxItems' => self::MAX_BATCH_SIZE,
					'description' => sprintf(
						'Bulk operations (%d-%d). Each item requires action and submission_id; update_values also requires values.',
						self::MIN_BATCH_SIZE,
						self::MAX_BATCH_SIZE
					),
					'items' => self::operation_schema(),
				],
			],
		];
	}

	private static function operation_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'action', 'submission_id' ],
			'properties' => [
				'action' => [
					'type' => 'string',
					'enum' => self::ACTIONS,
				],
				'submission_id' => [ 'type' => 'integer' ],
				'values' => [
					'type' => 'object',
					'description' => 'update_values only. Map of field_id to new text value, for example { "<field_id>": "new value" }.',
				],
			],
		];
	}
}
