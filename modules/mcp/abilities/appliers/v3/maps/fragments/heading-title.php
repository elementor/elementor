<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Heading widget controls shared by the theme title widgets (Post Title, Archive Title),
 * which extend the core Heading widget.
 */
class Heading_Title implements Style_Fragment {

	const HOVER_STATE = 'hover';

	/**
	 * @return array<string, V3_Setting>
	 */
	public static function settings(): array {
		return [
			'title' => V3_Setting::bind_to( 'title' )->string()->dynamic(),
			'link' => V3_Setting::bind_to( 'link' )->link()->dynamic(),
			'header_size' => V3_Setting::bind_to( 'header_size' )->enum_from_control(),
		];
	}

	public static function title_target( string $description ): Style_Target {
		return Style_Target::make( 'title' )
			->label( 'Title text' )
			->description( $description )
			->selector( '.elementor-heading-title' )
			->with( new self() );
	}

	public static function link_target(): Style_Target {
		return Style_Target::make( 'link' )
			->label( 'Title link' )
			->description( 'The link around the title text. Only rendered while link is set. The hover state also applies while the link has keyboard focus.' )
			->selector( '.elementor-heading-title a' )
			->states( self::HOVER_STATE )
			->bind( 'color', V3_Control::bind_to( 'title_hover_color' ), self::HOVER_STATE );
	}

	public function apply_to( Style_Target $target ): void {
		$target
			->with( Typography_Group::from_prefix( 'typography' ) )
			->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() )
			->bind( 'mix-blend-mode', V3_Control::bind_to( 'blend_mode' ) );
	}
}
