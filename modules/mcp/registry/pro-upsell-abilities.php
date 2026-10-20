<?php

namespace Elementor\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Pro_Upsell_Ability;
use Elementor\Modules\Mcp\Module as Mcp_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Upsell_Abilities {

	const SITE_PARTS_UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-site-parts/';

	const SITE_PART_TYPES = 'header, footer, single, single-post, single-page, archive, search-results, error-404';

	/** @return Pro_Upsell_Ability[] */
	public static function create( bool $has_pro ): array {
		if ( $has_pro ) {
			return [];
		}

		return array_map(
			fn( array $row ) => new Pro_Upsell_Ability(
				$row['id'],
				$row['label'],
				$row['description'],
				$row['feature_name'],
				Mcp_Module::get_promotion_upgrade_url( $row['upgrade_url'] ),
				$row['input_schema']
			),
			self::definitions()
		);
	}

	private static function definitions(): array {
		return [
			[
				'id' => 'elementor/manage-site-parts',
				'label' => __( 'Manage Elementor Site Parts', 'elementor' ),
				'description' => sprintf(
					/* translators: %s: comma-separated list of site part type slugs. */
					__( 'Manage Elementor site parts (Theme Builder documents: %s). Bulk operations (1-50) with three actions: "create" makes a new site part as a draft (optionally assigning display conditions in the same call), "update" mutates an existing site part (currently the only mutable field is "conditions"; body/settings edits go via manage-elements / build-composition / update-page-settings), and "delete" removes a site part. Conditions are slash-separated strings like "include/general" (site-wide), "include/singular/post", "exclude/singular/post/42". Site parts are NOT published by this tool — they stay drafts and must be published separately (matches the editor UX). For repeating-layout patterns (one single template driven by dynamic data instead of N duplicated pages, include-all + exclude-exceptions condition scoping, Post Content placement), read the elementor://wordpress/best-practices resource before creating singles.', 'elementor' ),
					self::SITE_PART_TYPES
				),
				'feature_name' => __( 'Managing site parts', 'elementor' ),
				'upgrade_url' => self::SITE_PARTS_UPGRADE_URL,
				'input_schema' => self::manage_site_parts_input_schema(),
			],
			[
				'id' => 'elementor/list-site-parts',
				'label' => __( 'List Site Parts', 'elementor' ),
				'description' => __( 'Lists Theme Builder site parts like header, footer, 404 page and more. Each row includes type, title, assignment, publish state, and whether it is rendered. is_active means the site part is published and matches a Theme Builder location on the front end. has_conditions means display conditions are saved on the document regardless of publish state. post_status is the raw WordPress status (draft, publish, private). A draft row with has_conditions true and is_active false means assignment succeeded but the site part will not render until published. Pass active: true to return only site parts that are currently rendered.', 'elementor' ),
				'feature_name' => __( 'Listing site parts', 'elementor' ),
				'upgrade_url' => self::SITE_PARTS_UPGRADE_URL,
				'input_schema' => self::list_site_parts_input_schema(),
			],
		];
	}

	private static function manage_site_parts_input_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'operations' ],
			'properties' => [
				'operations' => [
					'type' => 'array',
					'description' => 'Bulk operations (1-50). Each item requires action; create needs type (optional title, optional conditions); update needs post_id plus at least one mutable field (currently only conditions); delete needs post_id.',
					'items' => [
						'type' => 'object',
						'required' => [ 'action' ],
						'properties' => [
							'action' => [
								'type' => 'string',
								'enum' => [ 'create', 'update', 'delete' ],
							],
							'type' => [
								'type' => 'string',
								'description' => 'Site part type slug (create only). For example: ' . self::SITE_PART_TYPES . '.',
							],
							'title' => [ 'type' => 'string' ],
							'post_id' => [ 'type' => 'integer' ],
							'conditions' => [
								'type' => 'array',
								'items' => [ 'type' => 'string' ],
								'description' => 'Slash-separated condition strings. On create: defaults to [ "include/general" ] (site-wide) when the key is present with an empty array; omit the key entirely to leave the new site part unassigned. On update: only replaces conditions when the key is present; omit the key to leave existing conditions untouched.',
							],
						],
					],
				],
			],
		];
	}

	private static function list_site_parts_input_schema(): array {
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
}
