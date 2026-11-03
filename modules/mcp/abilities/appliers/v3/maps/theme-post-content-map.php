<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$content = Style_Target::make( 'content' )
	->label( 'Post content text' )
	->description( 'The body of the current post, as written in its own editor. Its headings, links and other inner elements inherit these styles unless the post content styles them itself.' )
	->selector( '' )
	->with( Typography_Group::from_prefix( 'typography' ) )
	->bind( 'color', V3_Control::bind_to( 'text_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive() );

return V3_Widget_Map::make( 'theme-post-content' )
	->description( 'Single-template body slot only. Exactly one per single template, wrapped in an `e-div-block`. Do NOT place inside loop items, archives, headers, footers, or components — the loop already repeats the article body.' )
	->default_target( $content );
