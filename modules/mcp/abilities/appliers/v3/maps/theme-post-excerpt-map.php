<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';

$excerpt = Style_Target::make( 'excerpt' )
	->label( 'Excerpt text' )
	->description( 'The excerpt of the current post.' )
	->selector( '' )
	->with( Typography_Group::from_prefix( 'typography' ) )
	->bind( 'color', V3_Control::bind_to( 'title_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() );

$links = Style_Target::make( 'links' )
	->label( 'Links in the excerpt' )
	->description( 'Links inside the excerpt, such as a Read More link the excerpt includes. The hover state also applies while a link has keyboard focus.' )
	->selector( 'a' )
	->states( $hover )
	->bind( 'color', V3_Control::bind_to( 'link_color' ) )
	->bind( 'color', V3_Control::bind_to( 'link_hover_color' ), $hover );

return V3_Widget_Map::make( 'theme-post-excerpt' )
	->description( 'Excerpt of the current post, for single post and loop templates. excerpt holds the Post Excerpt dynamic tag by default; a static excerpt replaces it on every post. Prefer `e-heading` or `e-paragraph` with a `post-excerpt` dynamic tag.' )
	->settings( [
		'excerpt' => V3_Setting::bind_to( 'excerpt' )->string()->dynamic(),
	] )
	->default_target( $excerpt )
	->targets( $links );
