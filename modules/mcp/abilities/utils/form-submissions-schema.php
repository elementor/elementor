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

	const MIN_IDS = 1;
	const MIN_PER_PAGE = 1;
	const MAX_PER_PAGE = 25;
	const DEFAULT_PER_PAGE = 10;
	const FIRST_PAGE = 1;

	const STATUS_ALL = 'all';
	const STATUSES = [ self::STATUS_ALL, 'unread', 'read', 'trash' ];

	const ORDER_DESC = 'desc';
	const ORDERS = [ 'asc', self::ORDER_DESC ];

	const ORDER_BY_CREATED_AT = 'created_at';
	const ORDER_BYS = [ self::ORDER_BY_CREATED_AT, 'id' ];

	public static function list_input(): array {
		return [
			'type' => 'object',
			'properties' => [
				'ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'integer' ],
					'minItems' => self::MIN_IDS,
					'maxItems' => self::MAX_PER_PAGE,
					'description' => 'Return only these submission ids. Trashed submissions are included unless "status" is set.',
				],
				'include_values' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'Add every submitted field to each row. Best combined with "ids".',
				],
				'include_actions_log' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'Add the form actions log (action, status, log message when one was recorded) to each row.',
				],
				'include_forms' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'Add "forms": every form that has submissions, with the value to pass as the "form" filter.',
				],
				'status' => [
					'type' => 'string',
					'enum' => self::STATUSES,
					'default' => self::STATUS_ALL,
					'description' => 'all excludes trash.',
				],
				'form' => [
					'type' => 'string',
					'description' => 'Limit to one form. Format {post_id}_{element_id}, for example 10_476d0ce. Get values with include_forms: true.',
				],
				'search' => [
					'type' => 'string',
					'description' => 'Keyword matched against submitted field values and submission ids.',
				],
				'referer' => [
					'type' => 'string',
					'description' => 'Limit to submissions sent from this page URL.',
				],
				'after' => [
					'type' => 'string',
					'description' => 'Only submissions sent on or after this date (YYYY-MM-DD).',
				],
				'before' => [
					'type' => 'string',
					'description' => 'Only submissions sent on or before this date (YYYY-MM-DD).',
				],
				'order' => [
					'type' => 'string',
					'enum' => self::ORDERS,
					'default' => self::ORDER_DESC,
				],
				'order_by' => [
					'type' => 'string',
					'enum' => self::ORDER_BYS,
					'default' => self::ORDER_BY_CREATED_AT,
				],
				'page' => [
					'type' => 'integer',
					'minimum' => self::FIRST_PAGE,
					'default' => self::FIRST_PAGE,
				],
				'per_page' => [
					'type' => 'integer',
					'minimum' => self::MIN_PER_PAGE,
					'maximum' => self::MAX_PER_PAGE,
					'default' => self::DEFAULT_PER_PAGE,
				],
			],
		];
	}

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
					'description' => 'update_values only. Map of field_id to new text value, for example { "<field_id>": "new value" }. Use the field_id values from list-form-submissions with include_values: true.',
				],
			],
		];
	}
}
