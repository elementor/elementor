<?php
namespace Elementor\Modules\System_Info\Reporters;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base_Plugin extends Base {
	public static $required_plugins_properties = [
		'Name',
		'Version',
		'URL',
		'Author',
	];

	public function print_html() {
		foreach ( $this->get_report( 'html' ) as $field ) {
			foreach ( $field['value'] as $plugin_info ) :
				?>
				<tr>
					<td><?php
					if ( $plugin_info['PluginURI'] ) :
						$plugin_name = "<a href='{$plugin_info['PluginURI']}'>{$plugin_info['Name']}</a>";
						else :
							$plugin_name = $plugin_info['Name'];
						endif;

						if ( $plugin_info['Version'] ) :
							$plugin_name .= ' - ' . $plugin_info['Version'];
						endif;

						Utils::print_unescaped_internal_string( $plugin_name );
						?></td>
					<td><?php
					if ( $plugin_info['Author'] ) :
						if ( $plugin_info['AuthorURI'] ) :
							$author = "<a href='{$plugin_info['AuthorURI']}'>{$plugin_info['Author']}</a>";
							else :
								$author = $plugin_info['Author'];
							endif;

							Utils::print_unescaped_internal_string( "By $author" );
						endif;
					?></td>
					<td></td>
				</tr>
				<?php
			endforeach;
		}
	}

	public function print_raw( $tabs_count ) {
		echo PHP_EOL;

		$required_plugins_properties = array_flip( self::$required_plugins_properties );

		unset( $required_plugins_properties['Name'] );

		foreach ( $this->get_report( 'raw' ) as $field_name => $field ) :
			$sub_indent = str_repeat( "\t", $tabs_count );

			echo "== {$field['label']} ==" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

			foreach ( $field['value'] as $plugin_info ) :
				$plugin_properties = array_intersect_key( $plugin_info, $required_plugins_properties );

				echo esc_html( $sub_indent . $plugin_info['Name'] );

				foreach ( $plugin_properties as $property_name => $property ) :
					echo PHP_EOL . "{$sub_indent}\t{$property_name}: {$property}"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				endforeach;

				echo PHP_EOL . PHP_EOL;
			endforeach;
		endforeach;
	}
}
