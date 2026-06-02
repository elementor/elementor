<?php
namespace Elementor\Modules\DesignMd;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DesignMd\Render\Markdown_Emitter;
use Elementor\Modules\DesignMd\Render\Yaml_Emitter;
use Elementor\Modules\DesignMd\TokenBuilder\Token_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Design_Md_Renderer {

	public function render( Kit $kit ): string {
		$settings = $kit->get_settings();
		$tokens   = ( new Token_Builder() )->build( $settings );

		return ( new Yaml_Emitter() )->emit( $tokens ) . "\n" . ( new Markdown_Emitter() )->emit( $tokens );
	}
}
