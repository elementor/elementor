<?php
namespace Elementor\Modules\Components\Documents;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component_Overridable_Props {
	/** @var array{ [string]: Component_Overridable_Prop } */
	public array $props;
	public array $groups;

	private function __construct( $overridable_props_meta ) {
		if ( is_string( $overridable_props_meta ) && ! empty( $overridable_props_meta ) ) {
			$overridable_props_meta = json_decode( $overridable_props_meta, true );
		}

		if ( empty( $overridable_props_meta ) ) {
			$this->props = [];
			$this->groups = [];

		}

		$formatted_props = array_map( function( array $overridable_prop ) {
				return Component_Overridable_Prop::make( $overridable_prop );
		}, $overridable_props_meta['props'] ?? [] );

		$this->props = $formatted_props;
		$this->groups = $overridable_props_meta['groups'] ?? [];
	}

	public static function make( array $overridable_props_meta ): self {
		return new self( $overridable_props_meta );
	}
}
