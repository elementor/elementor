<?php

namespace Elementor;

use Elementor\Core\Breakpoints\Breakpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Use API data instead of this static array, once it is available.
$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();
$active_devices = Plugin::$instance->breakpoints->get_active_devices_list( [ 'reverse' => true ] );

$breakpoint_classes_map = array_intersect_key( Plugin::$instance->breakpoints->get_responsive_icons_classes_map(), array_flip( $active_devices ) );

/* translators: %1$s: Device Name */
$breakpoint_label = esc_html__( '%1$s <br> Settings added for the %1$s device will apply to %2$spx screens and down', 'elementor' );
?>

<script type="text/template" id="tmpl-elementor-templates-responsive-bar">
	<div id="e-responsive-bar__start">
		<div id="elementor-panel-footer-logo" class="elementor-panel-footer-tool e-logo elementor-toggle-state">
			<div class="e-responsive-bar__menu">
				<div class="e-responsive-bar__menu-logo">
					<span class="e-responsive-bar__menu-logo-fragment e-responsive-bar__menu-logo-fragment--vertical"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
				</div>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Elementor Logo', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-view-page" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern11)"/>
						<defs>
							<pattern id="pattern11" patternContentUnits="objectBoundingBox" width="1" height="1">
								<use xlink:href="#image11" transform="scale(0.0416667)"/>
							</pattern>
							<image id="image11" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAkUlEQVRIie2VQQqAIBAAx+hV0QOM/v+B7B91KCF01dTCQw1IQtvujobCTyYzsAJb4TDAFCtgKpLbscQK2KABGIX5llgBL6YLBHaAEubZuB+mOszOGzJ4jD7VQSbeCjQzsEh7ooR3QePmBsW/p6W5QWwPbtHcINbtLZPXDdwC5nyWHtXXHCKa4zyvuQt0geiX2QFcwk8UY6n2dAAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'View Page', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-theme-builder" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern11)"/>
						<defs>
						<pattern id="pattern11" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image11" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image11" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAkUlEQVRIie2VQQqAIBAAx+hV0QOM/v+B7B91KCF01dTCQw1IQtvujobCTyYzsAJb4TDAFCtgKpLbscQK2KABGIX5llgBL6YLBHaAEubZuB+mOszOGzJ4jD7VQSbeCjQzsEh7ooR3QePmBsW/p6W5QWwPbtHcINbtLZPXDdwC5nyWHtXXHCKa4zyvuQt0geiX2QFcwk8UY6n2dAAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Theme Builder', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-wp-dashboard" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern12)"/>
						<defs>
						<pattern id="pattern12" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image12" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image12" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAACUElEQVRIid3US4jIXxQH8I/HjLeFhJHXCiPFUuQxFsqG8WiksJDHhpQNZaEkzFCipMjKnwULCwvlVVhSHmUwRh7Ff6nGI/JcnPPjMsZr6Vu3373f373nnvM95x7+ddSiCcdxFy9z3E2uKff8FRbiAc5iFcahX47xWI1zaMeCPzHcHS24hxmYgL24jucZwW3sx0TMRBua8+wv0YJLGJaGP+JTF+MDDqAOl/OSn2Jhej4EF35iuByb0ReDcB+NpcFuxbwWrViJGixCB5amBDcwML3uwBKMRh+8TRsNOCRkffe9900ioWVVHMEb/I9tBX8YrzOCOQU/BuexuCLKpDTiBDahV3IPcz4MG9JbokyreQt65nxN2vhGpgr3RCneFvLIdan3kuSH433Bz0V/UWnj04FOEdThGUZiRXHprWJPpfUzUQQVemOykOhpOtAJHRggtH2LwclvSS870lAlzbIighHYI97JgNzbCZVEd/LQuuTH5vpYergx+X54ISTthsdConpdSHRNvNyLuV6e3zbcxEmRg4p/hVM4jakYJWSbgas/iqBJ9JZJotY/ZUSwPuW5nvzE5OdgGvblmfq85EuZlqgVjWsmDqah7fmvh28ralfB14ik78bsjLjmRxcQXbFNVMFFPPJVxq3FBU8KfhbO5Jl2zOvKeIVm0biGi0Y2Pfkq+dVoSH4KhuIKdvzKuPSsWTSuBiFdnaiM1yK5raJMCVnasdNvtusKjXnJedEC6sVr7S+a2VqR0DbM/xPDJWpERfwnJHqRoxVH81+XCf038BlI26d0hhBMKQAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Exit to WordPress', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-add-widgets" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Add Widgets', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M9.1 18.3332C9.1 18.7014 9.39848 18.9999 9.76667 18.9999H10.2333C10.6015 18.9999 10.9 18.7014 10.9 18.3332V10.9H18.3333C18.7015 10.9 19 10.6015 19 10.2333V9.76667C19 9.39848 18.7015 9.1 18.3333 9.1H10.9V1.66656C10.9 1.29837 10.6015 0.999889 10.2333 0.999889L9.76667 0.999889C9.39848 0.999889 9.1 1.29837 9.1 1.66656V9.1H1.66667C1.29848 9.1 1 9.39848 1 9.76667V10.2333C1 10.6015 1.29848 10.9 1.66667 10.9H9.1V18.3332Z" fill="white"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Add Widgets', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-navigator" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Navigator', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M9.50286 0.117302C9.81566 -0.0391006 10.1838 -0.0391006 10.4966 0.117302L19.3853 4.56169C19.7617 4.7499 19.9995 5.13464 19.9995 5.55549C19.9995 5.97634 19.7617 6.36107 19.3853 6.54928L10.4966 10.9937C10.1838 11.1501 9.81566 11.1501 9.50286 10.9937L0.614192 6.54928C0.237775 6.36107 0 5.97634 0 5.55549C0 5.13464 0.237775 4.7499 0.614192 4.56169L9.50286 0.117302ZM3.59554 5.55549L9.99976 8.75763L16.404 5.55549L9.99976 2.35334L3.59554 5.55549Z" fill="white"/>
				<path d="M0.117544 9.50236C0.39197 8.9535 1.05937 8.73103 1.60822 9.00546L10 13.2014L18.3918 9.00546C18.9406 8.73103 19.608 8.9535 19.8825 9.50236C20.1569 10.0512 19.9344 10.7186 19.3856 10.993L10.4969 15.4374C10.1841 15.5938 9.81591 15.5938 9.50311 15.4374L0.614436 10.993C0.0655841 10.7186 -0.156882 10.0512 0.117544 9.50236Z" fill="white"/>
				<path d="M1.60822 13.4507C1.05937 13.1763 0.391969 13.3988 0.117544 13.9476C-0.156882 14.4965 0.0655842 15.1639 0.614436 15.4383L9.50311 19.8827C9.81591 20.0391 10.1841 20.0391 10.4969 19.8827L19.3856 15.4383C19.9344 15.1639 20.1569 14.4965 19.8825 13.9476C19.608 13.3988 18.9406 13.1763 18.3918 13.4507L10 17.6467L1.60822 13.4507Z" fill="white"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Navigator', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'History', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1.41797 3.33301V7.99976H6.08472" stroke="white" stroke-width="1.8" stroke-linecap="square"/>
				<path d="M2.9392 12.8339C3.49758 14.4188 4.55592 15.7793 5.95475 16.7104C7.35358 17.6415 9.01713 18.0928 10.6947 17.9962C12.3723 17.8996 13.9731 17.2605 15.2559 16.1751C16.5387 15.0896 17.4339 13.6167 17.8068 11.9782C18.1796 10.3397 18.0099 8.62441 17.3231 7.09077C16.6364 5.55713 15.4698 4.28823 13.9992 3.47525C12.5286 2.66227 10.8335 2.34926 9.16955 2.58338C7.50556 2.81749 6.18585 3.60243 4.77351 4.77325C3.36118 5.94408 2.5 7.23585 2.5 7.23585" stroke="white" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="round"/>
				<path d="M10 6.83301V11.4163L12.0833 13.4997" stroke="white" stroke-width="1.8"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'History', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-global-styles" class="elementor-panel-footer-tool elementor-toggle-state">
			<div data-tooltip="<?php esc_attr_e( 'Global Styles', 'elementor' ); ?>" class="tooltip-target">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 19H5L18 6C18.5304 5.46957 18.8284 4.75015 18.8284 4C18.8284 3.24986 18.5304 2.53044 18 2C17.4696 1.46957 16.7501 1.17158 16 1.17158C15.2499 1.17158 14.5304 1.46957 14 2L1 15V19Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M12.5 3.50002L16.5 7.50002" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M10 6L5 1L1 5L6 10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M5 5.99998L3.5 7.49998" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M14 10L19 15L15 19L10 14" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M14 15L12.5 16.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Global Styles', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-page-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M6.34171 13.3129C6.54476 14.1251 7.22158 14.6666 8.03376 14.6666C8.84594 14.6666 9.52276 14.1251 9.65813 13.3806C9.65813 13.3806 9.72581 13.3129 9.72581 13.2453C9.86117 12.9745 10.2673 12.9069 10.538 13.0422C11.2825 13.4483 12.0947 13.3806 12.7038 12.7715C13.3129 12.1624 13.3806 11.2825 12.9745 10.6057C12.9745 10.6057 12.9069 10.538 12.9069 10.4703C12.7715 10.1319 12.9745 9.79349 13.3129 9.72581C14.1251 9.52276 14.6666 8.84594 14.6666 8.03376C14.6666 7.22158 14.1251 6.54476 13.3129 6.34171C13.3129 6.34171 13.2453 6.27403 13.1776 6.27403C13.0422 6.20635 12.9745 6.07098 12.9069 5.93562C12.8392 5.73258 12.9069 5.59721 12.9745 5.46185C13.3806 4.71735 13.3129 3.90516 12.7038 3.29603C12.0947 2.68689 11.2148 2.61921 10.538 3.0253C10.538 3.0253 10.4703 3.09298 10.4026 3.09298C10.0642 3.22835 9.72581 3.0253 9.65813 2.68689C9.45508 1.87471 8.77826 1.33325 7.96608 1.33325C7.1539 1.33325 6.47708 1.87471 6.27403 2.68689C6.27403 2.82225 6.13867 3.0253 5.93562 3.09298C5.73258 3.16066 5.52953 3.09298 5.39417 3.0253C4.71735 2.61921 3.83748 2.68689 3.29603 3.29603C2.68689 3.83748 2.61921 4.71735 3.0253 5.39417C3.0253 5.39417 3.09298 5.46185 3.09298 5.52953C3.22835 5.86794 3.0253 6.20635 2.68689 6.27403C1.87471 6.47708 1.33325 7.1539 1.33325 7.96608C1.33325 8.77826 1.87471 9.45508 2.68689 9.65813C2.68689 9.65813 2.75457 9.72581 2.82225 9.72581C3.09298 9.86117 3.22834 10.2673 3.0253 10.538C2.61921 11.2825 2.68689 12.0947 3.29603 12.7038C3.90516 13.3129 4.78503 13.3806 5.46185 12.9745C5.46185 12.9745 5.52953 12.9069 5.59721 12.9069C5.80026 12.8392 5.93562 12.9069 6.07098 12.9745C6.20635 13.0422 6.27403 13.1776 6.34171 13.3129ZM6.61244 12.027C6.34171 11.8239 6.07098 11.7563 5.73258 11.7563C5.59721 11.7563 5.46185 11.7563 5.32648 11.6886C5.2588 11.7224 5.1742 11.7563 5.0896 11.7901C5.00499 11.8239 4.92039 11.8578 4.85271 11.8916C4.44662 12.1624 4.17589 11.8916 4.10821 11.8239C4.04053 11.7563 3.83748 11.4179 4.04053 11.0794C4.5143 10.2673 4.24357 9.18435 3.43139 8.71058C3.29603 8.6429 3.16066 8.57522 2.95762 8.50753C2.48384 8.43985 2.48384 8.03376 2.48384 7.96608C2.48384 7.8984 2.48384 7.55999 2.95762 7.42462C3.83748 7.22158 4.44662 6.27403 4.24357 5.32648C4.20973 5.2588 4.17589 5.1742 4.14205 5.0896C4.10821 5.00499 4.07437 4.92039 4.04053 4.85271C3.7698 4.44662 4.04053 4.17589 4.10821 4.10821C4.17589 4.04053 4.5143 3.83748 4.85271 4.04053C5.32648 4.31126 5.86794 4.37894 6.40939 4.10821C6.95085 3.90516 7.28926 3.49907 7.49231 2.95762C7.55999 2.48384 7.8984 2.48384 8.03376 2.48384C8.10144 2.48384 8.43985 2.48384 8.57522 2.95762C8.77826 3.90516 9.72581 4.44662 10.6734 4.24357C10.741 4.20973 10.8256 4.17589 10.9102 4.14205C10.9948 4.10821 11.0794 4.07437 11.1471 4.04053C11.5532 3.7698 11.8239 4.04053 11.8916 4.10821C11.9593 4.17589 12.1624 4.5143 11.9593 4.85271C11.6886 5.19112 11.6209 5.66489 11.7563 6.13867C11.8916 6.61244 12.1624 6.95085 12.5684 7.22158C12.7038 7.28926 12.8392 7.35694 13.0422 7.42462C13.516 7.4923 13.516 7.83071 13.516 7.96608C13.516 8.10144 13.516 8.43985 13.0422 8.57522C12.5684 8.71058 12.23 9.04899 11.9593 9.3874C11.6886 9.72581 11.6209 10.1996 11.7563 10.6734C11.7901 10.741 11.8239 10.8256 11.8578 10.9102C11.8916 10.9948 11.9255 11.0794 11.9593 11.1471C12.23 11.5532 11.9593 11.8239 11.8916 11.8916C11.8239 11.9593 11.4855 12.1624 11.1471 11.9593C10.3349 11.4855 9.25203 11.7563 8.77826 12.5684C8.71058 12.7038 8.6429 12.8392 8.57522 13.0422C8.50753 13.516 8.16912 13.516 8.03376 13.516C7.8984 13.516 7.55999 13.516 7.42462 13.1099C7.28926 12.6361 7.01853 12.2977 6.61244 12.027ZM5.39417 8.03376C5.39417 9.45508 6.54476 10.6057 8.03376 10.6057C9.45508 10.6057 10.6057 9.45508 10.6057 8.03376C10.6057 6.54476 9.52276 5.39417 8.03376 5.39417C6.54476 5.39417 5.39417 6.54476 5.39417 8.03376ZM6.61244 7.96608C6.61244 7.22158 7.22158 6.54476 8.03376 6.54476C8.77826 6.54476 9.45508 7.22158 9.45508 8.03376C9.45508 8.77826 8.77826 9.3874 8.03376 9.3874C7.28926 9.3874 6.61244 8.77826 6.61244 7.96608Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Page Settings', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-site-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M7.99992 2.66667C5.0544 2.66667 2.66659 5.05449 2.66659 8.00001C2.66659 10.9455 5.0544 13.3333 7.99992 13.3333C10.9454 13.3333 13.3333 10.9455 13.3333 8.00001C13.3333 5.05449 10.9454 2.66667 7.99992 2.66667ZM1.33325 8.00001C1.33325 4.31811 4.31802 1.33334 7.99992 1.33334C11.6818 1.33334 14.6666 4.31811 14.6666 8.00001C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00001Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.73326 6.00001C1.73326 5.63182 2.03174 5.33334 2.39993 5.33334H13.5999C13.9681 5.33334 14.2666 5.63182 14.2666 6.00001C14.2666 6.3682 13.9681 6.66668 13.5999 6.66668H2.39993C2.03174 6.66668 1.73326 6.3682 1.73326 6.00001Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.73326 10C1.73326 9.63182 2.03174 9.33334 2.39993 9.33334H13.5999C13.9681 9.33334 14.2666 9.63182 14.2666 10C14.2666 10.3682 13.9681 10.6667 13.5999 10.6667H2.39993C2.03174 10.6667 1.73326 10.3682 1.73326 10Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.01951 1.43443C8.33187 1.62936 8.42707 2.04059 8.23215 2.35295C7.17511 4.04682 6.61471 6.00338 6.61471 8.00001C6.61471 9.99664 7.17511 11.9532 8.23215 13.6471C8.42707 13.9594 8.33187 14.3707 8.01951 14.5656C7.70715 14.7605 7.29592 14.6653 7.101 14.353C5.91182 12.4473 5.28137 10.2462 5.28137 8.00001C5.28137 5.7538 5.91182 3.55268 7.101 1.64707C7.29592 1.33471 7.70715 1.23951 8.01951 1.43443Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M7.98032 1.43443C8.29268 1.23951 8.70392 1.33471 8.89884 1.64707C10.088 3.55268 10.7185 5.7538 10.7185 8.00001C10.7185 10.2462 10.088 12.4473 8.89884 14.353C8.70392 14.6653 8.29268 14.7605 7.98032 14.5656C7.66796 14.3707 7.57276 13.9594 7.76769 13.6471C8.82473 11.9532 9.38513 9.99664 9.38513 8.00001C9.38513 6.00338 8.82473 4.04682 7.76769 2.35295C7.57276 2.04059 7.66796 1.62936 7.98032 1.43443Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Site Settings', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-more" class="elementor-panel-footer-tool elementor-toggle-state">
			<div class="tooltip-target" data-tooltip="<?php esc_attr_e( 'More', 'elementor' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="8" y="2" width="4" height="3.69231" fill="white"/>
					<rect x="8" y="8.15401" width="4" height="3.69231" fill="white"/>
					<rect x="8" y="14.3081" width="4" height="3.69231" fill="white"/>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu"></div>
		</div>
	</div>
	<div id="e-responsive-bar__center">
		<div id="e-responsive-bar-switcher" class="e-responsive-bar--pipe">
			<?php
				$icon_maps = [
					'desktop' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.66675 4.16667C1.66675 3.24619 2.41294 2.5 3.33341 2.5H16.6667C17.5872 2.5 18.3334 3.24619 18.3334 4.16667V12.5C18.3334 13.4205 17.5872 14.1667 16.6667 14.1667H10.8334V15.8333H11.6667C12.127 15.8333 12.5001 16.2064 12.5001 16.6667C12.5001 17.1269 12.127 17.5 11.6667 17.5H8.33342C7.87318 17.5 7.50008 17.1269 7.50008 16.6667C7.50008 16.2064 7.87318 15.8333 8.33342 15.8333H9.16675V14.1667H3.33341C2.41294 14.1667 1.66675 13.4205 1.66675 12.5V4.16667ZM16.6667 12.5V4.16667H3.33341V12.5H16.6667Z" fill="white"/></svg>',
					'tablet' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.33325 4C3.33325 3.17157 4.07944 2.5 4.99992 2.5H14.9999C15.9204 2.5 16.6666 3.17157 16.6666 4V16C16.6666 16.8284 15.9204 17.5 14.9999 17.5H4.99992C4.07944 17.5 3.33325 16.8284 3.33325 16V4ZM14.9999 4H4.99992V16H14.9999V4ZM7.49992 14.5C7.49992 14.0858 7.87301 13.75 8.33325 13.75H11.6666C12.1268 13.75 12.4999 14.0858 12.4999 14.5C12.4999 14.9142 12.1268 15.25 11.6666 15.25H8.33325C7.87301 15.25 7.49992 14.9142 7.49992 14.5Z" fill="white"/></svg>',
					'mobile' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.28571 13.75C8.89123 13.75 8.57143 14.0858 8.57143 14.5C8.57143 14.9142 8.89123 15.25 9.28571 15.25H10.7143C11.1088 15.25 11.4286 14.9142 11.4286 14.5C11.4286 14.0858 11.1088 13.75 10.7143 13.75H9.28571Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.32653 2.5C5.49457 2.5 5 3.2842 5 4V16C5 16.7158 5.49457 17.5 6.32653 17.5H13.6735C14.5054 17.5 15 16.7158 15 16V4C15 3.2842 14.5054 2.5 13.6735 2.5H6.32653ZM6.42857 16V4H13.5714V16H6.42857Z" fill="white"/></svg>',
				]
				?>
			<?php foreach ( $active_devices as $device_key ) {
				if ( 'desktop' === $device_key ) {
					$tooltip_label = esc_html__( 'Desktop <br> Settings added for the base device will apply to all breakpoints unless edited', 'elementor' );
				} elseif ( 'widescreen' === $device_key ) {
					$tooltip_label = esc_html__( 'Widescreen <br> Settings added for the Widescreen device will apply to screen sizes %dpx and up', 'elementor' );

					$tooltip_label = sprintf( $tooltip_label, $active_breakpoints[ $device_key ]->get_value() );
				} else {
					$tooltip_label = sprintf( $breakpoint_label, $active_breakpoints[ $device_key ]->get_label(), $active_breakpoints[ $device_key ]->get_value() );
				}

				$icon = isset( $icon_maps[ $device_key ] ) ? $icon_maps[ $device_key ] : '<i class="' . $breakpoint_classes_map[ $device_key ] . '" aria-hidden="true"></i>';

				printf('<label
					id="e-responsive-bar-switcher__option-%1$s"
					class="e-responsive-bar-switcher__option elementor-panel-footer-tool tooltip-target"
					for="e-responsive-bar-switch-%1$s"
					data-tooltip="%2$s">

					<input type="radio" name="breakpoint" id="e-responsive-bar-switch-%1$s" value="%1$s">
					%3$s
					<span class="screen-reader-text">%2$s</span>
				</label>', esc_attr( $device_key ), esc_attr( $tooltip_label ), $icon ); // phpcs:ignore
			} ?>
		</div>
		<div id="e-responsive-bar-scale">
			<div id="e-responsive-bar-scale__minus"></div>
			<div id="e-responsive-bar-scale__value-wrapper"><span id="e-responsive-bar-scale__value">100</span>%</div>
			<div id="e-responsive-bar-scale__plus"><i class="eicon-plus" aria-hidden="true"></i></div>
			<div id="e-responsive-bar-scale__reset"><i class="eicon-undo" aria-hidden="true"></i></div>
		</div>
		<div id="e-responsive-bar__size-inputs-wrapper" class="e-flex e-align-items-center" style="display:none;">
			<label for="e-responsive-bar__input-width">W</label>
			<input type="number" id="e-responsive-bar__input-width" class="e-responsive-bar__input-size" autocomplete="off">
			<label for="e-responsive-bar__input-height">H</label>
			<input type="number" id="e-responsive-bar__input-height" class="e-responsive-bar__input-size" autocomplete="off">
		</div>
	</div>
	<div id="e-responsive-bar__end">
		<div id="elementor-panel-footer-finder" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Finder', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M11.1653 0.902214C11.5046 1.04952 11.7062 1.40291 11.6603 1.76999L10.9441 7.49997H17.5001C17.8234 7.49997 18.1176 7.68702 18.2547 7.97984C18.3919 8.27266 18.3473 8.61838 18.1403 8.86679L9.80694 18.8668C9.57011 19.151 9.17428 19.245 8.83493 19.0977C8.49558 18.9504 8.29397 18.597 8.33986 18.2299L9.05611 12.5H2.50009C2.17674 12.5 1.88258 12.3129 1.74543 12.0201C1.60828 11.7273 1.6529 11.3815 1.85991 11.1331L10.1932 1.13314C10.4301 0.84895 10.8259 0.754907 11.1653 0.902214ZM4.27929 10.8333H10.0001C10.2391 10.8333 10.4666 10.9359 10.6248 11.1151C10.783 11.2943 10.8566 11.5328 10.827 11.77L10.3462 15.6162L15.7209 9.16663H10.0001C9.76107 9.16663 9.53355 9.06399 9.37536 8.8848C9.21717 8.70561 9.14355 8.46712 9.17319 8.22994L9.65398 4.38368L4.27929 10.8333Z" fill="#495157"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Finder', 'elementor' ); ?></span>
		</div>
		<a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank" id="elementor-panel-footer-help" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Help', 'elementor' ); ?>">
			<!-- <a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank"> -->
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8.8C12.0235 8.8 8.8 12.0235 8.8 16C8.8 19.9764 12.0235 23.2 16 23.2C19.9764 23.2 23.2 19.9764 23.2 16C23.2 12.0235 19.9764 8.8 16 8.8ZM7 16C7 11.0294 11.0294 7 16 7C20.9706 7 25 11.0294 25 16C25 20.9706 20.9706 25 16 25C11.0294 25 7 20.9706 7 16Z" fill="#495157"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16 19.6C16.4971 19.6 16.9 20.0029 16.9 20.5V20.509C16.9 21.0061 16.4971 21.409 16 21.409C15.5029 21.409 15.1 21.0061 15.1 20.509V20.5C15.1 20.0029 15.5029 19.6 16 19.6Z" fill="#495157"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M14.6273 10.9104C15.0767 10.688 15.5717 10.573 16.0732 10.5744C16.5746 10.5758 17.0689 10.6935 17.5172 10.9184C17.9654 11.1433 18.3553 11.4692 18.6562 11.8704C18.9571 12.2715 19.1607 12.7371 19.2511 13.2304C19.3415 13.7236 19.3162 14.2311 19.1771 14.7129C19.038 15.1947 18.789 15.6377 18.4496 16.0069C18.1103 16.3761 17.6899 16.6615 17.2215 16.8406C17.2139 16.8435 17.2062 16.8463 17.1986 16.849C17.1065 16.8814 17.0275 16.9428 16.9734 17.0239C16.9193 17.1051 16.893 17.2016 16.8986 17.299C16.9267 17.7953 16.5472 18.2204 16.051 18.2486C15.5547 18.2767 15.1296 17.8972 15.1014 17.401C15.0738 16.914 15.2052 16.4313 15.4757 16.0255C15.7435 15.6239 16.1332 15.3191 16.5871 15.156C16.7919 15.0763 16.9756 14.9507 17.1244 14.7888C17.2752 14.6247 17.3859 14.4279 17.4477 14.2137C17.5095 13.9996 17.5208 13.774 17.4806 13.5548C17.4404 13.3356 17.3499 13.1287 17.2162 12.9504C17.0825 12.7721 16.9092 12.6272 16.71 12.5273C16.5107 12.4273 16.2911 12.375 16.0682 12.3744C15.8453 12.3738 15.6253 12.4249 15.4256 12.5237C15.2258 12.6226 15.0517 12.7664 14.917 12.944C14.6166 13.34 14.052 13.4174 13.656 13.117C13.26 12.8166 13.1826 12.252 13.483 11.856C13.7861 11.4565 14.1778 11.1328 14.6273 10.9104Z" fill="#495157"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Help', 'elementor' ); ?></span>
			<!-- </a> -->
		</a>
		<div id="elementor-panel-footer-saver-preview" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
			<span id="elementor-panel-footer-saver-preview-label">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" fill="#495157"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.51999 4 3.9072 6.64709 1.13177 11.5038C0.956077 11.8113 0.956077 12.1887 1.13177 12.4962C3.9072 17.3529 7.51999 20 12 20C16.48 20 20.0928 17.3529 22.8682 12.4962C23.0439 12.1887 23.0439 11.8113 22.8682 11.5038C20.0928 6.64709 16.48 4 12 4ZM12 18C8.61278 18 5.65779 16.1305 3.15986 12C5.65779 7.86948 8.61278 6 12 6C15.3872 6 18.3422 7.86948 20.8401 12C18.3422 16.1305 15.3872 18 12 18Z" fill="#495157"/>
				</svg>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Preview Changes', 'elementor' ); ?></span>
			</span>
		</div>
		<div id="elementor-panel-footer-saver-publish" class="elementor-panel-footer-tool">
			<button id="elementor-panel-saver-button-publish" class="elementor-button elementor-button-success elementor-disabled">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span id="elementor-panel-saver-button-publish-label">
					<?php echo esc_html__( 'Publish', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-panel-footer-saver-options" class="elementor-panel-footer-tool elementor-toggle-state">
			<button id="elementor-panel-saver-button-save-options" class="elementor-button elementor-button-success tooltip-target elementor-disabled" data-tooltip="<?php esc_attr_e( 'Save Options', 'elementor' ); ?>" data-tooltip-offset="7">
				<div class="e-dropdown-arrow"></div>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Save Options', 'elementor' ); ?></span>
			</button>
			<div class="elementor-panel-footer-sub-menu">
				<p class="elementor-last-edited-wrapper elementor-panel-footer-sub-menu-item">
					<span class="elementor-state-icon">
						<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
					</span>
					<span class="elementor-last-edited"></span>
				</p>

				<div id="elementor-panel-footer-sub-menu-item-save-draft" class="elementor-panel-footer-sub-menu-item elementor-disabled">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M4 3.33333C3.82319 3.33333 3.65362 3.40357 3.5286 3.5286C3.40357 3.65362 3.33333 3.82319 3.33333 4V12C3.33333 12.1768 3.40357 12.3464 3.5286 12.4714C3.65362 12.5964 3.82319 12.6667 4 12.6667H12C12.1768 12.6667 12.3464 12.5964 12.4714 12.4714C12.5964 12.3464 12.6667 12.1768 12.6667 12V5.60948L10.3905 3.33333H4ZM2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H10.6667C10.8435 2 11.013 2.07024 11.1381 2.19526L13.8047 4.86193C13.9298 4.98695 14 5.15652 14 5.33333V12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14H4C3.46957 14 2.96086 13.7893 2.58579 13.4142C2.21071 13.0391 2 12.5304 2 12V4C2 3.46957 2.21071 2.96086 2.58579 2.58579Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8 8.66667C7.63181 8.66667 7.33333 8.96514 7.33333 9.33333C7.33333 9.70152 7.63181 10 8 10C8.36819 10 8.66667 9.70152 8.66667 9.33333C8.66667 8.96514 8.36819 8.66667 8 8.66667ZM6 9.33333C6 8.22876 6.89543 7.33333 8 7.33333C9.10457 7.33333 10 8.22876 10 9.33333C10 10.4379 9.10457 11.3333 8 11.3333C6.89543 11.3333 6 10.4379 6 9.33333Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M5.33333 2C5.70152 2 6 2.29848 6 2.66667V4.66667H8.66667V2.66667C8.66667 2.29848 8.96514 2 9.33333 2C9.70152 2 10 2.29848 10 2.66667V5.33333C10 5.70152 9.70152 6 9.33333 6H5.33333C4.96514 6 4.66667 5.70152 4.66667 5.33333V2.66667C4.66667 2.29848 4.96514 2 5.33333 2Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-save-template" class="elementor-panel-footer-sub-menu-item">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M3.33334 3.33333C3.15653 3.33333 2.98696 3.40357 2.86194 3.5286C2.73691 3.65362 2.66668 3.82319 2.66668 4V11.3333C2.66668 11.5101 2.73691 11.6797 2.86194 11.8047C2.98696 11.9298 3.15653 12 3.33334 12H12.6667C12.8435 12 13.0131 11.9298 13.1381 11.8047C13.2631 11.6797 13.3333 11.5101 13.3333 11.3333V6C13.3333 5.82319 13.2631 5.65362 13.1381 5.5286C13.0131 5.40357 12.8435 5.33333 12.6667 5.33333H8.00001C7.8232 5.33333 7.65363 5.2631 7.52861 5.13807L5.72387 3.33333H3.33334ZM1.91913 2.58579C2.2942 2.21071 2.80291 2 3.33334 2H6.00001C6.17682 2 6.34639 2.07024 6.47141 2.19526L8.27615 4H12.6667C13.1971 4 13.7058 4.21071 14.0809 4.58579C14.456 4.96086 14.6667 5.46957 14.6667 6V11.3333C14.6667 11.8638 14.456 12.3725 14.0809 12.7475C13.7058 13.1226 13.1971 13.3333 12.6667 13.3333H3.33334C2.80291 13.3333 2.2942 13.1226 1.91913 12.7475C1.54406 12.3725 1.33334 11.8638 1.33334 11.3333V4C1.33334 3.46957 1.54406 2.96086 1.91913 2.58579Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Save as Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
</script>
