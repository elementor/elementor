<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\Styles\Style_Variants_To_Css;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://global-classes';

	protected function get_ability_id(): string {
		return 'elementor/global-classes-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Global Classes', 'elementor' ),
			__( 'Reusable CSS classes from the active kit; check FIRST before adding inline styles. Each entry exposes { label, css } where css is a raw CSS string using the same @media(--breakpoint) + &:hover/&:focus/&:active format that elementor/manage-classes accepts as input.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Global class definitions from the active kit as a map of class_id -> { label, css } (round-trippable to elementor/manage-classes in replace mode).', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$classes = Global_Classes_Repository::make( $kit )->all();
		$items = $classes->get_items()->all();
		$order = $classes->get_order()->all();

		$payload = [];

		foreach ( $order as $class_id ) {
			if ( ! isset( $items[ $class_id ] ) ) {
				continue;
			}

			$item = $items[ $class_id ];

			$payload[ $class_id ] = [
				'label' => $item['label'] ?? '',
				'css'   => Style_Variants_To_Css::to_css( $item['variants'] ?? [] ),
			];
		}

		return wp_json_encode( (object) $payload );
	}
}
