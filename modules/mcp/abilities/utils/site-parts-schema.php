<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Parts_Schema {

	const ACTION_CREATE = 'create';
	const ACTION_UPDATE = 'update';
	const ACTION_DELETE = 'delete';

	const ACTIONS = [ self::ACTION_CREATE, self::ACTION_UPDATE, self::ACTION_DELETE ];

	const TYPES = [ 'header', 'footer', 'single', 'single-post', 'single-page', 'archive', 'search-results', 'error-404' ];

	const MIN_BATCH_SIZE = 1;
	const MAX_BATCH_SIZE = 50;

	const SITE_WIDE_CONDITION = 'include/general';

	public static function manage_input(): array {
		return [
			'type' => 'object',
			'required' => [ 'operations' ],
			'properties' => [
				'operations' => [
					'type' => 'array',
					'description' => sprintf(
						'Bulk operations (%d-%d). Each item requires action; create needs type (optional title, optional conditions); update needs post_id plus at least one mutable field (currently only conditions); delete needs post_id.',
						self::MIN_BATCH_SIZE,
						self::MAX_BATCH_SIZE
					),
					'items' => self::operation_schema(),
				],
			],
		];
	}

	public static function list_input(): array {
		return [
			'type' => 'object',
			'properties' => [
				'active' => [
					'type' => 'boolean',
					'description' => 'When true, return only site parts that are currently rendered on the front end (published and matching a Theme Builder location).',
				],
			],
		];
	}

	private static function operation_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'action' ],
			'properties' => [
				'action' => [
					'type' => 'string',
					'enum' => self::ACTIONS,
				],
				'type' => [
					'type' => 'string',
					'enum' => self::TYPES,
					'description' => 'Site part type slug (create only).',
				],
				'title' => [ 'type' => 'string' ],
				'post_id' => [ 'type' => 'integer' ],
				'conditions' => self::conditions_schema(),
			],
		];
	}

	private static function conditions_schema(): array {
		return [
			'type' => 'array',
			'items' => [ 'type' => 'string' ],
			'description' => sprintf(
				'Slash-separated condition strings. On create: defaults to [ "%s" ] (site-wide) when the key is present with an empty array; omit the key entirely to leave the new site part unassigned. On update: only replaces conditions when the key is present; omit the key to leave existing conditions untouched.',
				self::SITE_WIDE_CONDITION
			),
		];
	}
}
