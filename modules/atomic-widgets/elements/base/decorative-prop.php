<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Decorative_Prop {
	const KEY = 'decorative';

	public static function make(): Boolean_Prop_Type {
		return Boolean_Prop_Type::make()
			->default( false )
			->description( 'Editor only: never rendered on the frontend. Set true on a visual-only container that will stay empty (a shape, glow, gradient or other HTML/CSS composition), so the editor does not force its empty-container placeholder min-height and min-width on it. Give it an explicit width and height in style. Leave false for containers that will get children.' )
			->meta( Overridable_Prop_Type::ignore() );
	}
}
