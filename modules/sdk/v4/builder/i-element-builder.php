<?php

namespace Elementor\Modules\Sdk\V4\Builder;

interface I_Element_Builder extends I_Builder {

	public function set_name( string $widget_name ): void;
	public function set_render_function( callable $render_method ): void;
	public function set_assets_dir( string $dir ): void;
}
