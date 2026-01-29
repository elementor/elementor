<?php

namespace Elementor\Modules\GlobalClasses\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes {

	public static function extract_used_class_ids_from_elements( array $elements ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::extract_used_class_ids_from_elements( $elements );
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		return Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_ids( $ids );
	}

	public static function build_snapshot_for_elements( array $elements ): ?array {
		return Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_elements( $elements );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $snapshot );
	}

	public static function rewrite_elements_classes_ids( array $elements, array $id_map ): array {
		return Template_Library_Global_Classes_Element_Transformer::rewrite_elements_classes_ids( $elements, $id_map );
	}

	public static function flatten_elements_classes( array $elements, array $global_classes, ?array $only_ids = null ): array {
		return Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes, $only_ids );
	}

	public static function create_all_as_new( array $snapshot ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::create_all_as_new( $snapshot );
	}
}
