<?php
namespace Elementor\Core\Editor\Templates;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$wrapper_attributes = [
	'id' => 'elementor-editor-wrapper-v2',
];

if ( ! empty( $app_env ) ) {
	$wrapper_attributes['data-e-app-env'] = wp_json_encode( $app_env );
}

$wrapper_attributes = Utils::render_html_attributes( $wrapper_attributes );

?>

<div <?php Utils::print_unescaped_internal_string( $wrapper_attributes ); ?>></div>

<?php include __DIR__ . '/editor-body-v1.view.php'; ?>
