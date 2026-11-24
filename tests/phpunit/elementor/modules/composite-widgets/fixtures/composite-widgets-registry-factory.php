<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Fixtures;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\CompositeWidgets\Definitions\Definition_Migrator;
use Elementor\Modules\CompositeWidgets\Definitions\Site_Definitions_Registrar;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composite_Widgets_Registry_Factory {
	const CODE_WIDGET_ID = 'test/card';
	const REPEATER_WIDGET_ID = 'test/list';
	const SITE_WIDGET_ID = 'site/promo';
	const ARCHIVED_SITE_WIDGET_ID = 'site/old-promo';
	const WIDGET_VERSION = 1;
	const ROOT_PADDING_PX = 12;

	public static function make(): Widgets_Definitions_Registry {
		$registry = new Widgets_Definitions_Registry(
			Widget_Definition_Validator::make(),
			new Definition_Migrator( Migrations_Orchestrator::make() ),
			function ( Site_Definitions_Registrar $registrar ) {
				$registrar->register( self::definition( self::SITE_WIDGET_ID ) );
				$registrar->register( self::definition( self::ARCHIVED_SITE_WIDGET_ID ), true );
			}
		);

		$registry->register( self::definition( self::CODE_WIDGET_ID ) );
		$registry->register( self::repeater_definition() );

		foreach ( [ self::CODE_WIDGET_ID, self::REPEATER_WIDGET_ID, self::SITE_WIDGET_ID, self::ARCHIVED_SITE_WIDGET_ID ] as $id ) {
			if ( ! $registry->get( $id ) ) {
				throw new \RuntimeException( "The test composite widget \"{$id}\" did not register." );
			}
		}

		return $registry;
	}

	/**
	 * A list whose two repeater items share the `item` and `item_title` part names.
	 */
	public static function repeater_definition(): array {
		$item = [
			'elType' => 'e-flexbox',
			'part' => 'item',
			'elements' => [
				[
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'part' => 'item_title',
				],
			],
		];

		return [
			'id' => self::REPEATER_WIDGET_ID,
			'version' => self::WIDGET_VERSION,
			'title' => 'List',
			'template' => [
				'elType' => 'e-flexbox',
				'part' => 'root',
				'elements' => [
					[
						'elType' => 'e-flexbox',
						'part' => 'items',
						'elements' => [ $item, $item ],
					],
				],
			],
			'general' => [
				[
					'repeater' => 'items',
					'label' => 'Items',
					'item' => 'item',
					'container' => 'items',
					'item_fields' => [
						[
							'label' => 'Title',
							'target' => [
								'part' => 'item_title',
								'prop' => 'title',
							],
						],
					],
				],
			],
		];
	}

	/**
	 * A root with a local style, a heading part and an open slot.
	 */
	public static function definition( string $id ): array {
		return [
			'id' => $id,
			'version' => self::WIDGET_VERSION,
			'title' => 'Card',
			'template' => [
				'elType' => 'e-flexbox',
				'part' => 'root',
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value' => [ 'local-root' ],
					],
				],
				'styles' => [
					'local-root' => [
						'id' => 'local-root',
						'type' => 'class',
						'label' => 'local',
						'variants' => [
							[
								'meta' => [
									'breakpoint' => 'desktop',
									'state' => null,
								],
								'props' => [
									'padding' => [
										'$$type' => 'size',
										'value' => [
											'size' => self::ROOT_PADDING_PX,
											'unit' => 'px',
										],
									],
								],
							],
						],
					],
				],
				'elements' => [
					[
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
					],
					[
						'elType' => 'e-flexbox',
						'part' => 'content',
						'slot' => true,
						'elements' => [],
					],
				],
			],
			'general' => [
				[
					'section' => 'Content',
					'fields' => [
						[
							'label' => 'Title',
							'target' => [
								'part' => 'title',
								'prop' => 'title',
							],
						],
					],
				],
			],
		];
	}
}
