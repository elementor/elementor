<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Elements_Remover {

	private Xml_Parser $xml_parser;

	public function __construct( Xml_Parser $xml_parser ) {
		$this->xml_parser = $xml_parser;
	}

	/**
	 * @return \WP_Error[] One error per distinct Pro message, in document order.
	 */
	public function remove_and_collect_errors( \DOMDocument $dom ): array {
		$pro_features_discovery = [];

		foreach ( $this->xml_parser->iterate_all_descendants( $dom ) as $node ) {
			$type = $this->xml_parser->get_tag_name( $node );

			if ( Pro_Features_Discovery_Registry::requires_pro( $type ) ) {
				$error = Pro_Features_Discovery_Registry::for_widget( $type );
				$pro_features_discovery[ $error->get_error_message() ] = $error;
				$this->xml_parser->remove_element( $node );
			}
		}

		return array_values( $pro_features_discovery );
	}
}
