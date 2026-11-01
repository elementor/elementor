<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Browse_Site_Resources_Ability extends Abstract_Ability {
	const MAX_LIMIT = 60;
	const DEFAULT_LIMIT = 30;

	const TYPE_ALL = 'all';
	const TYPE_WIDGET = 'widget';
	const TYPE_COMPONENT = 'component';
	const TYPE_TEMPLATE = 'template';
	const TYPE_LOOP_ITEM = 'loop-item';

	const ALLOWED_TYPES = [
		self::TYPE_ALL,
		self::TYPE_WIDGET,
		self::TYPE_COMPONENT,
		self::TYPE_TEMPLATE,
		self::TYPE_LOOP_ITEM,
		'section',
		'page',
		'container',
		'header',
		'footer',
		'popup',
		'single',
		'archive',
		'search-results',
		'error-404',
	];

	protected function get_ability_id(): string {
		return 'elementor/browse-site-resources';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Browse Site Resources', 'elementor' ),
			__(
				'Lists this WordPress site’s Elementor widgets, components, and saved templates, then renders an interactive gallery in the chat. Wait for the user to pick an item in the gallery before proceeding.',
				'elementor'
			),
			'elementor',
			[
				'type'       => 'object',
				'properties' => [
					'items' => [
						'type'  => 'array',
						'items' => [
							'type'       => 'object',
							'properties' => [
								'id'        => [ 'type' => [ 'string', 'integer' ] ],
								'kind'      => [ 'type' => 'string' ],
								'subtype'   => [ 'type' => 'string' ],
								'title'     => [ 'type' => 'string' ],
								'category'  => [ 'type' => 'string' ],
								'icon'      => [ 'type' => 'string' ],
								'thumbnail' => [ 'type' => 'string' ],
								'edit_url'  => [ 'type' => 'string' ],
								'access'    => [ 'type' => 'string' ],
							],
						],
					],
					'counts_by_type' => [
						'type' => 'object',
					],
				],
			],
			[
				'annotations' => [
					'readonly'    => true,
					'idempotent'  => true,
					'destructive' => false,
				],
				'mcp'         => [
					'_meta' => [
						'ui' => [
							'resourceUri' => Site_Resources_Gallery_Ui_Ability::URI,
							'displayMode' => 'inline',
						],
					],
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type'       => 'object',
				'properties' => [
					'type' => [
						'type'        => 'string',
						'enum'        => self::ALLOWED_TYPES,
						'default'     => self::TYPE_ALL,
						'description' => 'Filter results by resource kind or template subtype.',
					],
					'search' => [
						'type'        => 'string',
						'description' => 'Case-insensitive substring match on title, category, or keywords.',
					],
					'limit' => [
						'type'        => 'integer',
						'minimum'     => 1,
						'maximum'     => self::MAX_LIMIT,
						'default'     => self::DEFAULT_LIMIT,
						'description' => 'Maximum number of items returned.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$type = is_string( $input['type'] ?? null ) ? $input['type'] : self::TYPE_ALL;
		if ( ! in_array( $type, self::ALLOWED_TYPES, true ) ) {
			$type = self::TYPE_ALL;
		}

		$search = is_string( $input['search'] ?? null ) ? trim( $input['search'] ) : '';
		$limit  = isset( $input['limit'] ) ? (int) $input['limit'] : self::DEFAULT_LIMIT;
		$limit  = max( 1, min( self::MAX_LIMIT, $limit ) );

		$all_items = $this->collect_all_items();
		$counts    = $this->build_counts_by_type( $all_items );

		$filtered = $this->filter_by_type( $all_items, $type );
		$filtered = $this->filter_by_search( $filtered, $search );
		$filtered = array_slice( $filtered, 0, $limit );

		return [
			'items'            => array_values( $filtered ),
			'counts_by_type'   => $counts,
		];
	}

	private function collect_all_items(): array {
		$items = array_merge(
			$this->collect_widget_items(),
			$this->collect_component_items(),
			$this->collect_template_items()
		);

		usort(
			$items,
			fn( $a, $b ) => strcasecmp( (string) $a['title'], (string) $b['title'] )
		);

		return $items;
	}

	private function collect_widget_items(): array {
		$items = [];

		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $widget ) {
			$categories = $widget->get_categories();
			$category   = is_array( $categories ) && ! empty( $categories ) ? (string) $categories[0] : 'general';

			$items[] = [
				'id'        => $widget->get_name(),
				'kind'      => 'widget',
				'subtype'   => $widget->get_name(),
				'title'     => $widget->get_title(),
				'category'  => $category,
				'icon'      => $widget->get_icon(),
				'thumbnail' => '',
				'edit_url'  => '',
				'access'    => $widget->show_in_panel() ? 'Free' : 'Pro',
			];
		}

		return $items;
	}

	private function collect_component_items(): array {
		if ( ! class_exists( Components_Repository::class ) ) {
			return [];
		}

		$repository = new Components_Repository();
		$items      = [];

		foreach ( $repository->all() as $component ) {
			if ( $component['is_archived'] ?? false ) {
				continue;
			}

			$post_id  = (int) $component['id'];
			$document = Plugin::$instance->documents->get( $post_id );
			$edit_url = $document instanceof Document ? (string) $document->get_edit_url() : '';

			$items[] = [
				'id'        => $post_id,
				'kind'      => 'component',
				'subtype'   => 'component',
				'title'     => (string) $component['title'],
				'category'  => 'components',
				'icon'      => '',
				'thumbnail' => '',
				'edit_url'  => $edit_url,
				'access'    => 'Site',
			];
		}

		return $items;
	}

	private function collect_template_items(): array {
		$source = Plugin::$instance->templates_manager->get_source( 'local' );

		if ( ! $source instanceof Source_Local ) {
			return [];
		}

		$items = [];

		foreach ( $source->get_items() as $template ) {
			$post_id = (int) ( $template['template_id'] ?? 0 );

			if ( $post_id <= 0 ) {
				continue;
			}

			$document = Plugin::$instance->documents->get( $post_id );
			$edit_url = $document instanceof Document ? (string) $document->get_edit_url() : '';
			$subtype  = (string) ( $template['type'] ?? 'template' );
			$thumb    = is_string( $template['thumbnail'] ?? null ) ? $template['thumbnail'] : '';

			$items[] = [
				'id'        => $post_id,
				'kind'      => 'template',
				'subtype'   => $subtype,
				'title'     => (string) ( $template['title'] ?? '' ),
				'category'  => $subtype,
				'icon'      => '',
				'thumbnail' => $thumb,
				'edit_url'  => $edit_url,
				'access'    => $this->template_access_label( $subtype ),
			];
		}

		return $items;
	}

	private function template_access_label( string $subtype ): string {
		$pro_types = [ 'header', 'footer', 'single', 'archive', 'search-results', 'error-404', 'loop-item', 'popup' ];

		if ( in_array( $subtype, $pro_types, true ) && ! Utils::has_pro() ) {
			return 'Pro';
		}

		return 'Free';
	}

	private function build_counts_by_type( array $items ): array {
		$counts = [
			'widget'    => 0,
			'component' => 0,
			'template'  => 0,
			'all'       => count( $items ),
		];

		foreach ( $items as $item ) {
			$kind = $item['kind'] ?? '';

			if ( isset( $counts[ $kind ] ) ) {
				++$counts[ $kind ];
			}
		}

		return $counts;
	}

	private function filter_by_type( array $items, string $type ): array {
		if ( self::TYPE_ALL === $type ) {
			return $items;
		}

		if ( self::TYPE_WIDGET === $type ) {
			return array_values( array_filter( $items, fn( $item ) => 'widget' === $item['kind'] ) );
		}

		if ( self::TYPE_COMPONENT === $type ) {
			return array_values( array_filter( $items, fn( $item ) => 'component' === $item['kind'] ) );
		}

		if ( self::TYPE_TEMPLATE === $type ) {
			return array_values( array_filter( $items, fn( $item ) => 'template' === $item['kind'] ) );
		}

		if ( self::TYPE_LOOP_ITEM === $type ) {
			return array_values(
				array_filter(
					$items,
					fn( $item ) => 'template' === $item['kind'] && 'loop-item' === $item['subtype']
				)
			);
		}

		return array_values(
			array_filter(
				$items,
				fn( $item ) => 'template' === $item['kind'] && $type === $item['subtype']
			)
		);
	}

	private function filter_by_search( array $items, string $search ): array {
		if ( '' === $search ) {
			return $items;
		}

		$needle = strtolower( $search );

		return array_values(
			array_filter(
				$items,
				function ( $item ) use ( $needle ) {
					$haystack = strtolower(
						implode(
							' ',
							[
								(string) ( $item['title'] ?? '' ),
								(string) ( $item['category'] ?? '' ),
								(string) ( $item['subtype'] ?? '' ),
								(string) ( $item['kind'] ?? '' ),
							]
						)
					);

					return str_contains( $haystack, $needle );
				}
			)
		);
	}
}
