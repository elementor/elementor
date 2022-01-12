# Elementor Developer Edition - by Elementor.com

#### 3.6.0-dev29 - 2022-01-12
* Fix: Can’t drag & drop elements inside a container  [ED-6077] (#17320)

#### 3.6.0-dev28 - 2022-01-10
* Fix: widescreen breakpoint  effects query media order (#17314)
* Tweak: Adding Responsive option to Text Stroke [ED-5846] (#17235)

#### 3.6.0-dev27 - 2022-01-07
* Fix: Core SVG icons from template library are imported empty [ED-5980] (#17373)
* Tweak: Adding Import Export to the Finder [ED-3997] (#17259)
* Tweak: Add border options in Image Box widget [ED-3927] (#17250)
* Tweak: Adding Kit Library to the Finder [ED-3726] (#17330)
* Tweak: "Library page" was replaced with "Page template" in Finder [ED-6138] (#17360)

#### 3.6.0-dev26 - 2022-01-06
* Fix: Internal - Swiper Util accepts only jQuery instances as the container parameter [ED-6050] (#17319)

#### 3.6.0-dev25 - 2022-01-03
* Fix: Image size with a link shrunk in Image widget [ED-3397] (#17245)

#### 3.6.0-dev22 - 2021-12-26
* Fix: Responsive reverse columns control inoperative []ED-5877 (#17246)
* Tweak: Remove `elementor-section-wrap` by adding it to the DOM experiment [ED-5865] (#17192)
* Fix: Favorites are not kept after page reload [ED-5903] (#17242)
* Tweak: Promoted some experiments status to Stable (#16986)
* Fix: Elements are pasted in reverse order when copying and pasting multi-selected elements [ED-5723] (#17231)
* Fix: Inner Section can’t be dragged into a column [ED-5910] (#17258)
* Tweak: Updated changelog v3.5.2 (#17281)
* Fix: Changelog links (#17285)

#### 3.6.0-dev21 - 2021-12-20
* Tweak: Delete deprecated 'Scheme' classes alias [ED-5894] (#17217)
* Fix: Revert task ED-1628 - document handle below the header with z-index above 99 (#17205)
* Revert "Tweak: Added Safe mode for Experiments [ED-741] (#16659)" (#17206)
* Tweak: Changelog for v3.5.1 (#17184)

#### 3.6.0-dev20 - 2021-12-17
* Tweak: New Admin Menu Rearrangement Experiment (#17208)
* Fix: Missing a wrapper when the Inner Section widget is in use (#17187) [ED-5875] (#17209)
* Fix: Missing escaping native WP translations (#17210)

#### 3.6.0-dev19 - 2021-12-16
* Fix: SVG and JSON files caused errors in Drag from Desktop [ED-5529] (#16966)

#### 3.6.0-dev18 - 2021-12-14
* Tweak: Navigator appears by default when loading the editor [ED-5742] (#17146)
* Fix: Elements are pasted in reverse order when copying and pasting multi-selected elements [ED-5723] (#17148)
* Revert "Fix: Elements are pasted in reverse order when copying and pasting multi-selected elements [ED-5723] (#17148)" (#17171)
* Fix: Elements are pasted in reverse order when copying and pasting multi-selected elements [ED-5723] (#17172)

#### 3.6.0-dev17 - 2021-12-13
* Tweak: Added `Difference`, `Exclusion` and `Hue` to Column and Section blend mode options [ED-5733] (#17079)
* New: Added a reusable button trait [ED-4597] (#17041) (#17092)
* Tweak: Favorites Widgets - Added an indication that a widget was added [ED-5500] (#17058)
* Tweak: Updated changelog release date (#17145)
* Fix: Several functions are being executed when not supposed to in all WP Dashboard screens [ED-5795] (#17163)
* Tweak: Added option to change the color of the navigation dots in carousel type widgets [ED-4970] (#16646)

#### 3.6.0-dev14 - 2021-12-01
* Fix: Dev Edition notice appears inside the Form Submission window [ED-4913] (#17067)

#### 3.6.0-dev11 - 2021-11-26
* Fix: Saving a template with a condition throws an error [ED-5661] (#17040)

#### 3.6.0-dev10 - 2021-11-24
* Fix: Templates Library is unreachable [ED-5613] (#17019)
* Fix: PayPal Button widget doesn't work with Core 3.5.0 beta3 [ED-5664] (#17022)

#### 3.6.0-dev9 - 2021-11-23
* Tweak: Contextual texts in the prompts - Document settings [ED-5324] (#16834)
* Tweak: Prompt the user permission to allow unfiltered file uploads in Import Template flow [ED-5279] (#16910)
* Fix: Broken button shortcodes and internal URLs (#16971) [ED-5566] (#17005)
* Fix: The data updater notice removed from update plugin page [ED-5381] (#17004)
* Fix: Choose control was in reversed order in RTL sites [ED-5461] (#16893)
* Fix: Scroll snap throw undefined error on Archive pages [ED-5544] (#17015)
* Fix: Z-index control override negative values (#17016)
* Fix: Text path widget is not optimized and makes redundant file system calls [ED-5420] (#16952)
* Fix: Conflict with JetEngine plugin in v3.5.0 [ED-5603] (#17021)

#### 3.6.0-dev8 - 2021-11-22
* Tweak: The maximum Offest values changes to 1000px in Advanced > Transform [ED-5600] (#17002)
* Fix: D&D issues with right and left positioned elements [ED-5494] (#16959)

#### 3.6.0-dev7 - 2021-11-19
* Fix: Default values in rotate 3D weren't apply in CSS Transfrom [ED-5568] (#16978)
* Tweak: Adjusting the widgets inline-CSS experiment to support custom-breakpoints [ED-5536] (#16922)

#### 3.6.0-dev6 - 2021-11-18
* Tweak: Removing redundant code that was needed in the past for the eicons and no longer needed due to the new inline-font experiment. (#16957)
* Fix: Widget > Advanced > Positioning Vertical align control isn't responsive [ED-5528] (#16927)

#### 3.6.0-dev5 - 2021-11-17
* Tweak: Updated changelog to v3.4.8 (#16951)
* Revert "Tweak: Added shortkey to panel tooltips [ED-4220] (#16478)" (#16889)
* Fix: Column padding affects absolute positioned elements [ED-5428] (#16930)
* Fix: Kit Library - Apply Kit throws an error with PHP 8 [ED-4974] (#16928)
* Fix: Text in beta users "Get beta updates" modal [ED-5446] (#16929)

#### 3.6.0-dev4 - 2021-11-16
* Fix: Sticky option throws an error and cause the editor not to work [ED-5539] (#16933)
* Fix: Font Awesome 4 support are wrong default value [ED-5404] (#16941)
* Fix: Font Awesome 4 support are wrong default value [ED-5404] (#16944)
* Fix: Some fields don't show placeholder values properly (closes #16608) [ED-4677] (#16948)

#### 3.6.0-dev3 - 2021-11-12
* Fix: Lightbox tweaks [ED-5532] (#16906)
* Fix: Empty state background is missing in Media controls [ED-5312] (#16768)

#### 3.6.0-dev2 - 2021-11-09
* Fix: Only one JSON browser-import is possible [ED-5443] (#16844)
* Fix: CSS Print method has wrong default value [ED-5883] (#16833)
* Fix: Font Awesome 4 support are wrong default value [ED-5404] (#16839)
* Fix: Additional Breakpoints - Conditional respon. controls disappear if exper. is active [ED-5362] (#16775)
* Fix: Template name changed if a dash mark was used in the import process [ED-4923] (#16788)
* Fix: The Top bar is disappearing from some pages [ED-5314] (#16835)
* Fix: data attributes are being printed to DOM when not needed in CSS Transform [ED-5419] (#16850)
* Fix: Activate and Deactivate all experiments buttons didn't work (#16802)
* Fix: Inner section cannot be added to the page [ED-5460] (#16863)
* Fix: 3.5.0 Core Beta - Skip SVG in Import Kit flow doesn't work properly [ED-5437] (#16837)
* Fix: CLI `library import` deletes the original imported file [ED-5203] (#16799)
* Fix: Drag from Desktop doesn’t work with SVG and JSON [ED-5454] (#16849)
* Fix: Nav menu not scrolling to the appropriate CSS ID if Scroll Snap is enabled [ED-5439] (#16808)
* Fix: Missing typography control in Text Path widget [ED-5455] (#16838)
* New: Added Container element [ED-2609] (#16105)

#### 3.6.0-dev1 - 2021-11-08
* Fix: Cannot open context menu in the 'Add New Section' area in the preview [ED-5453] (#16836)
* Fix: JSON browser-imports appear to be inserted at the top of the document [ED-5442] (#16845)
* Tweak: Statuses and experiments description changed in the new Experiments UI [ED-5316] (#16738)
* Fix: After downgrading from a version with Container - a PHP error is thrown [ED-5425] (#16842)

#### 3.5.0-dev51 - 2021-11-05
* Tweak: Delete deprecated 'Editor' class alias [ED-5429] (#16797)
* New: Drag files from desktop [ED-3817] (#16809)

#### 3.5.0-dev50 - 2021-11-04
* Fix: Can't upload JPG/JPEG files via Elementor Editor's WP media control (#16786) [ED-5406] (#16801)

#### 3.5.0-dev49 - 2021-11-03
* New: Added favorite widgets section to the editor panel [ED-1501] (#16630)
* Fix: Can't upload images via WP media library (#16786)

#### 3.5.0-dev48 - 2021-11-02
* Tweak: Adding new error handling scenarios to the import-export process [ED-4294] (#16720)
* Tweak: Renaming shared components names. (#16771)
* New: CLI - Added a command to import all templates in a directory [ED-5247] (#16666)

#### 3.5.0-dev47 - 2021-10-31
* Tweak: Updated changelog to v3.4.7 (#16762)
* Fix: UI Glitch in the new Experiments page [ED-5311] (#16763)

#### 3.5.0-dev46 - 2021-10-31
* Fix: Hamburger button didn't open on mobile in Nav menu widget [ED-5215] (#16686)
* Tweak: Added Safe mode for Experiments [ED-741] (#16659)
* Fix: Private Vimeo videos not loading in Video widget, Section Background Video, Media Carousel and Lightbox [ED-5128] (#16663)
* Tweak: Deprecate old const (#16687)
* Fix: Activate and Deactivate experiments buttons didn't work in Safari [ED-5115] (#16635)
* Tweak: Delete deprecated 'Core\Ajax' class alias [ED-5291] (#16697)
* Fix: Version control tab is visible to users without right capabilities [ED-5232] (#16699)
* Fix: Nav menu not scrolling to the appropriate CSS ID if Scroll Snap enabled [ED-5287] (#16711)
* Fix: Wrong HTML escaping in Pro features promotion (#16698)
* Fix: Custom width controls disappear in cascaded devices if Additional Breakpoints experiment is active [ED-5146] (#16633)
* Tweak: Internal - Moved Files Upload Handlers functionality to the Uploads Manager [ED-2585] (#16154)
* Tweak: The default values of Transition duration and Rotate 3d changed in CSS Transform [ED-5240] (#16696)

#### 3.5.0-dev45 - 2021-10-25
* Fix: PayPal button is unclickable [ED-5228] (#16656)
* Fix: Drag and Drop of multiple elements shouldn't be allowed in Navigator [ED-5266] (#16693)
* Fix: Right-click context-menu doesn't appear in favorite widgets [ED-5264] (#16692)
* Deprecated Utils::get_create_new_post_url  : Replaced by Plugin::$instance->documents->get_create_new_post_url (#15776)
* Tweak: Delete deprecated ajax method (#16688)

#### 3.5.0-dev44 - 2021-10-19
* Fix: Updated Admin Top Bar font for Non-English languages [ED-4903] (#16620)
* Tweak: Allow disabling Responsive Placeholder inheritance  [ED-5095] (#16513)

#### 3.5.0-dev43 - 2021-10-19
* Fix: SVG & Lottie files that don't already exist on a website, are not imported when included in templates (#15936)
* New: Added option to Multiselect page elements [ED-3682] (#16314)
* Tweak: Drag from desktop fixes [ED-5108] (#16537)
* New: Update E-Icons library to 5.13.0 [ED-5211] (#16619)
* Fix: Counter and Progress tracker didn't work with Scroll snap [ED-5210] (#16618)
* New: Added favorite widgets section to the editor panel [ED-1501] (#15068)
* Tweak: Updated changelog for v3.4.6 (#16621)

#### 3.5.0-dev42 - 2021-10-18
* Fix: Text Path custom SVG is not supported in some servers environment [ED-4557] (#16571)
* Tweak: In widget search, WP widgets are hidden [ED-4683] (#16422)

#### 3.5.0-dev41 - 2021-10-15
* Tweak: Adding styled-components infrastructure [ED-4561] (#16414)

#### 3.5.0-dev40 - 2021-10-14
* Tweak: Eicons to SVG [ED-2650] (#15897)
* Fix: Header Handle - handles don't show up [ED-1628] (#15700)
* Tweak: Removing a temporary BC support. (#16421)
* Tweak: Added a quick Apply Kit option using a popup modal in Kit Library [ED-4049] (#16492)
* Fix: Cleanup API info + `autoload=no` and  delete 'elementor_scheme_%'. [ED-3204] (#15755)

#### 3.5.0-dev39 - 2021-10-13
* Tweak: Updated changelog to v3.4.5 (#16553)
* Fix: Merge release/3.5.0 into feature/default-values (#16561)
* Tweak: Made placeholder values clearer in controls with CSS units [ED-4841] (#16488)
* Tweak: Hide the Archive Posts and Archive Title widgets from panel search results when not relevant [ED-4983] (#16486)
* Tweak: System Info - New experiments reporter [ED-1938] (#14800)
* Tweak: Added shortkey to panel tooltips [ED-4220] (#16478)
* Tweak: Default-Values - Loader on default values save [ED-4925] (#16212)

#### 3.5.0-dev38 - 2021-10-12
* Tweak: Updated featured video in readme.txt (#16552)

#### 3.5.0-dev37 - 2021-10-11
* Fix: Cannot open context menu in new section area [ED-5011] (#16361)
* Tweak: Changing the font-icon-svg experiment to be inactive for new sites. (#16535)
* New: CSS Transform [ED-4168] (#15800)

#### 3.5.0-dev36 - 2021-10-08
* Fix: Admin Top Bar experiment causes the WP "Add New Plugin" to disappear [ED-5090] (#16504)
* New: Drag image from desktop [ED-3817] (#15652)
* Fix: Section handler not reachable if Scroll snap is active [ED-4926] (#16508)
* Tweak: Updating the dialog library. (#16164)
* Tweak: Added reverse columns to Additional Custom Breakpoints Experiment (ED-4631) (#16098)

#### 3.5.0-dev35 - 2021-10-07
* Tweak: Height and width fields in Responsive bar cannot be edit in Desktop [ED-4529] (#16198)
* Fix: When adding margin to column of media-carousel widget it breaks the UI [ED-4915] (#16258)
* Tweak: Added an option for Storke in multiple widgets [ED-3914] (#16029)
* Tweak: Adjusting the widget promotional popup CTA text [ED-3971] (#16438)
* Tweak: New Experiments UI [ED-4179] (#16233)
* Tweak: Deprecate old properties [ED-4880] (#16158)
* Fix: Dividers not vertically centered in Icon List wisget [ED-5053] (#16440)

#### 3.5.0-dev34 - 2021-10-06
* Fix: Slides per view controls disappeared in multiple breakpoints in Testimonial Carousel [ED-5025] (#16388)

#### 3.5.0-dev33 - 2021-10-03
* Fix: Default value check for control validity [ED-5071] (#16437)

#### 3.5.0-dev31 - 2021-10-01
* Fix: When the "Optimized DOM" experiment is off and custom breakpoints are defined... [ED-4994] (#16385)

#### 3.5.0-dev30 - 2021-09-30
* Tweak: Apply filter for activate user in admin tool bar [ED-4309] (#15714)
* Fix: GitHub - Update servers to ubuntu 20.04 (#16413)
* Fix: GitHub - Update servers to ubuntu 20.04 (#16416)
* Fix: Admin top bar breaks admin dashboard [ED-5044] (#16424)

#### 3.5.0-dev28 - 2021-09-19
* Tweak: Adding a URL parameter to the import-export that skips the kit-content selection [ED-4750] (#16275)
* Tweak: Internal - Allow external extending of Element Editing Handles Buttons [ED-4480] (#16232)

#### 3.5.0-dev26 - 2021-09-15
* Tweak: Updated featured video in readme.txt (#16332)

#### 3.5.0-dev25 - 2021-09-14
* Fix: Elements panel UI glitch [ED-4959] (#16282)
* Fix: Offsets not working properly with an absolutely positioned widget and Improved DOM experiment [ED-4945] (#16253)

#### 3.5.0-dev24 - 2021-09-13
* Fix: If a responsive control is the first control in a popover, it breaks the popover for non-desktop devices   [ED-4979] (#16318)
* Fix: Large images are fully displayed before the swiper is initialized. (#16317)
* Tweak: Updated changelog for v3.4.4 (#16326)

#### 3.5.0-dev23 - 2021-09-13
* Fix: Element dragging after ctrl + click on Mac [ED-1827] (#15980)

#### 3.5.0-dev21 - 2021-09-10
* Tweak: CSS Transform - Change flip icon [ED-4462] (#16284)

#### 3.5.0-dev19 - 2021-09-06
* Fix: Editor doesn't load on v3.5.0 if `ELEMENTOR_DEBUG` is enabled [ED-4937] (#16256)

#### 3.5.0-dev18 - 2021-09-05
* Fix: Default global values override local global values [ED-4917] (#16206)

#### 3.5.0-dev16 - 2021-09-03
* JS API/Editor: Fix - Move 'Editor/Documents' to components folder. (#14602)
* Fix: Image content html tags appeared on Image carousel widget [ED-4828] (#16129)
* Tweak: Controls PHPCS (#16141)
* Tweak: Added "Justified" text alignment to columns & sections (#11512)
* Tweak: Add new "Word Spacing" control to typography controls [ED-4621] (#9152)
* Fix: PHP Lint failing during syntax lint (#16165)
* Tweak: Add step size to typography "Word Spacing" control [ED-4621] (#16167)
* Fix: Unable to import a kit via URL when not logged-in to WP [ED-4836] (#16157)
* Tweak: Show admin-top-bar only on elementor pages [ED-4879, ED-4899] (#16190)
* Tweak: Updated changelog for v3.4.3 (#16194)
* Tweak: Updated changelog for v3.4.3 (#16197)
* Fix: Page settings layout description [ED-1210] (#13360)
* Tweak: Add perspective to CSS transform [ED-4304] (#15774)
* Tweak: Changed default values experiment name [ED-4876] (#16155)
* Fix: Lighthouse CI test is failing - removed unused css [ED-3698] (#16200)
* Tweak: CSS Transform - Change flip icon [ED-4462] (#15933)
* Fix: Optimize Kit library index page performance [ED-4669] (#16201)
* Revert "Fix: Lighthouse CI test is failing - removed unused css [ED-3698] (#16200)" (#16207)
* Fix: Data Updater causes fatal error due to DB corruption [ED-4839] (#16195)
* Fix: SVG sanitizer is failing if there is a line break after "</svg" [ED-4853] (#16132)
* Tweak: Responsive bar - Make the minimum height smaller for all responsive devices (ED-4359) (#16017)
* Tweak: Internal - Add external filter for Context Menu Groups [ED-4483] (#16160)
* Tweak: Add CSS Transform section [ED-4767] (#16064)

#### 3.5.0-dev14 - 2021-08-26
* Fix: consistent hook names (#16099)
* New: Default values first iteration [ED-3683] (#15518)
* Fix: Landing page builder experiments causes page not found/ 404 errors with media files URLs (#15943) (ED-4806) (#16096)
* Fix: Animated elements disappear before entering the viewport (#2806) (ED-2513) (#16095)
* Tweak: Added Elementor price plan filter to Kit Library (closes #16075) [ED-4804] (#16102)
* Tweak: Entrance Animations - Once the element has been animated, unobserve it [ED-4845] (#16127)
* Tweak: Internal - Remove all usages of `Elementor\Utils::get_create_new_post_url()` (#16128)
* Fix: Controls in the Editor's JS system always have an empty string value as default, so they cannot be deleted (ED-4772) (#16042)
* Fix: Can't upload SVG files using Elementor (#16084, #16119, #16088) [ED-4813] (#16125)
* Fix: `wp_kses_post` strips `srcset` attribute from images (#16111) [ED-4840] (#16122)
* Fix: Inline CSS is parsed to an invalid charcaters. (#16143)
* Fix: When the inline-SVG experiment is active the list icons alignment can not be changed [ED-4758] (#16109)
* Fix: Autoplay not working for Vimeo videos in Lightbox (ED-4796) (#16068)
* Fix: Missing translations escaping in default values module (#16151)

#### 3.5.0-dev13 - 2021-08-23
* New: Docs - UI States [ED-4628] (#15961)
* Fix: Reflect inherited value in slider control [ED-4766] (#16040)
* Tweak: Library - On open, don't query all templates [ED-3149] (#15662)
* Fix: Custom Code Promotion [ED-508] (#15960)
* Tweak: Changed default cards view in Kit Library [ED-4484] (#15982)
* Tweak: Added the option to search by tag names in Kit Library [ED-4482] (#15959)
* Tweak: Changed Kit Library tab name [ED-3727] (#15986)
* Fix: Finder incorrectly identifies pages created. [ED-3708] (#15352)
* Fix: Admin Top Bar conflicts with WP customizer [ED-4768] (#16101)

#### 3.5.0-dev11 - 2021-08-19
* Revert: Fix: Gradient control doesn't work on frontend when using Global Colors (#16053)
* Fix: Background image controls missing when using dynamic image (Closes #16050) [ED-4785] (#16062)
* Fix: Motion effects popover is not visible since v3.4.1 (#16044) [ED-4788] (#16061)
* Fix: Responsive Site settings are not being applied on frontend when Additional Custom Breakpoints is active (ED-4787) (#16060)
* Tweak: Updated Changelog to v3.4.2 (#16066)

#### 3.5.0-dev10 - 2021-08-18
* Fix: Internal - `{device}_default` control properties are not deleted for responsive controls (ED-4741) (#16004)
* Fix: Gradient control doesn't work on frontend when using Global Colors (ED-3517) (#16002)
* Tweak: Added source=generic parameter when connecting through the top bar [ED-4459] (#15998)
* Fix: Control conditions are not being executed when has dash or underscore in the control slug (ED-4747) (#16014)
* Tweak - Adding SVG support to the global video play-icon. (#16031)
* Fix: Placeholder values of column width shouldn't cascade to mobile [ED-4664] (#16038)
* Tweak: Updated changelog for v3.4.1 (#16039)
* Fix: Source param at get_client_id request [ED-4459] (#16041)

#### 3.5.0-dev9 - 2021-08-17
* Tweak: WP_Query - Don't calc the total rows if not needed [ED-3150] (#15688)
* Tweak: Custom Code - Added promotion [ED-508] (#15615)
* Fix: Multiple repeaters in same widget has conflicts [ED-4001] (#15612)
* Fix: App - "x" button after refresh sent to the theme builder page [ED-4042] (#15616)
* Tweak: Page Transitions - Change icon [ED-4318] (#15722)
* Tweak: updated changelog for v3.4 (#15984)
* Fix: Basic Gallery - SVG Icon is not displayed in the Basic Gallery widget [ED-4046] (#15551)
* Tweak: Preparation in Core for future Page Transitions in Pro [ED-4571] (#15992)
* Fix: Editor - Some respon. controls pass the desktop default to other devices accidentally (ED-4670) (#15962)
* Fix: Alignment control in Testimonial widget doesn't work in responsive view (ED-4531) (#15995)
* Fix: Button alignment functionality not responding with Additional Custom Breakpoints (ED-4675) (#15981)
* Fix: Price & Quantity Ampersand sign is in HTML in Menu Cart widget (ED-4694) (#15997)
* Tweak: Kit Library - Missing post types in Site Parts overview screen [ED-4485] (#15988)
* Fix: Placeholder values of column width shouldn't cascade to mobile [ED-4664] (#15966)
* Fix: Activation bug for IDN domains [ED-886] (#15983)

#### 3.5.0-dev7 - 2021-08-13
* Fix: Responsive values cascade wrongly with different dimensions on different breakpoints [ED-4665] (#15955)

#### 3.5.0-dev6 - 2021-08-12
* New: Add dev-changelog.md on developer-edition release [ED-4286] (#15893)
* Fix: Widescreen breakpoint preview didn't fit the screen [ED-4504] (#15941)
* Fix: The position of the SVG icon is different from the i tag icon position. (#15937)
* Fix: Column width value cascading bottom limit was tablet instead of mobile-extra (ED-4661) (#15949)
* Tweak: Make the section element extendable (#13618)

#### 3.5.0-dev5 - 2021-08-11
* Fix: Gallery widget with dynamic tags can't be edited [ED-4443] (#15912)

#### 3.5.0-dev4 - 2021-08-11
* Revert "Tweak: Preparation in Core for future Page Transitions in Pro [ED-4571] (#15891)" (#15911)
* Tweak: Export `utils/escapeHTML()` to `elementorFrontend.utils` [ED-4308] (#15712)
* Fix: "Auto" text not showing in section margin control [ED-4534] (#15880)
* Fix: Theme builder not working when import export feature is inactive [ED-4563] (#15884)
* Fix: Re-migrate Kit - The migration fails in some cases [ED-4457] (#15478)
* Tweak: Blend Mode - Missing translations in section and column (#15900)
* Tweak: Additional Breakpoints - Added new _NEXT SCSS vars for mobile & tablet extra (ED-4596) (#15915)
* Fix: Breakpoints - Desktop max point when widescreen is inactive is 1439px instead of 99999px (ED-4595) (#15926)
* Tweak: Missing translations (#15923)
* Fix: UI glitch in Responsive bar in RTL sites [ED-4558] (#15924)
* Fix: Responsive columns didn't reacted to the appropriate breakpoints (ED-4556) (#15927)
* Fix: All styles under frontend/general were duplicated (#15925)
* Tweak: Additional Custom Breakpoints Experiment changed to Beta phase (ED-4600) (#15928)

#### 3.5.0-dev3 - 2021-08-06
* Fix: When additional breakpoints are active - responsive switcher is slow [ED-4411] (#15849)
* Tweak: Updated getting started video course [ED-4570] (#15894)
* Tweak: Preparation in Core for future Page Transitions in Pro [ED-4571] (#15891)

#### 3.5.0-dev2 - 2021-08-04
* Fix - When the inline-font-svg experiment is active the font-awesome library is not loaded by default inside the editor when not using a dedicated icons control. (#15855)
* Fix: Additional Breakpoints - Responsive 'base-multiple' controls with a default value inherit the desktop default as an actual value and not passively (#15860)
* Fix: Breakpoints/multiple default values (#15864)
* Fix: Select 2 - UI glitch in Dark mode [ED-4458] (#15818)
* Fix: Undefined "pro_widgets" array key in certain cases [ED-4528] (#15876)
* Fix: Image placeholder only cascades one level down [ED-4506] (#15863)
* Fix: Placeholder units not always reflected in dimension controls [ED-4505] (#15867)
* Fix: Placeholder values on desktop don't cascade up from Desktop to Widescreen [ED-4509] (#15868)
* Tweak: Change publish (#15879)

#### 3.5.0-dev1 - 2021-08-03
* Kit-Library: New - Init (#14184)
* Fix: Kit-Library - Return access_level from connect process. (#14714)
*  New: Kit-Library - Connect to download link. [ED-2712] (#14652)
* New: Kit-Library - Favorites [ED-2598] (#14650)
* Fix: Kit-Library - Taxonomies new API scheme [ED-3143] (#14864)
* Tweak: Kit-Library - Sorting [ED-2597] (#14737)
* Tweak: Kit-Library - Clicking a page in the kit overview opens live preview [ED-3134] (#15006)
* Tweak: Kit-Library - Text Fixes [ED-3130] (#15024)
* Fix: Kit-library - Re add react-query (#15030)
* Tweak: Kit-Library - sort by featured [ED-3251] (#15057)
* Tweak: Kit-Library - Add additional connect info to the api [ED-3360] (#15070)
* Fix: Kit-Library - Sort authentication headers a-z [ED-3380] (#15084)
* Fix: Kit-Library - Rejects from spec [ED-3357] (#15081)
* Tweak: Kit-Library - Send nonce and referrer to the import process [ED-3252] (#15110)
* Tweak: Kit-library - Made the filter tags clickable [ED-2904] (#14923)
* Tweak: Kit-Library - favorite kits empty state screen [ED-3131] (#14980)
* Tweak: Kit-Library - not loaded if import-export experiment is off [ED-3335] (#15058)
* Fix: Kit-Library - Move components from app to kit-library [ED-3410] (#15115)
* Fix: Kit-Library - Pages section not exists [ED-3416] (#15145)
* Tweak: Kit-Library - production url [ED-3440] (#15147)
* Tweak: Kit-Library - Styling dark mode [ED-3479] (#15179)
* Fix: Kit-Library - Using function that not exists in WP 5.6 [ED-3564] (#15235)
* Fix: Kit-Library - Separate kit access level from template access level [ED-3565] (#15238)
* New: Kit-Library - Tests [ED-3135] (#15113)
* Fix: Kit-Library - Taxonomies disappear [ED-3574] (#15246)
* Fix: Kit-Library - import not working [ED-3436] (#15280)
* Fix: Kit-Library - Page doc type [ED-3572] (#15239)
* Tweak: Kit-Library - Add Spinner to apply button [ED-3611] (#15299)
* Tweak: Kit-Library - Changed back button behavior [ED-3618] (#15318)
* Tweak: Kit-Library - Added Envato promotion [ED-3608] (#15326)
* Tweak: Improved PHP Lint enforcement [ED-2901] (#15334)
* Fix: PHP Lint - Security Linter [ED-3168, ED-2901] (#14948)
* Fix: PHP Lint [ED-3813] (#15422)
* Tweak: Controls System Optimization (ED-3378, ED-3643, ED-3744, ED-3814, ED-3839, ED-3855) (#15247)
* Tweak: Additional Breakpoints - Fixes, Widgets and Config adjustments (ED-3894, ED-3935, ED-3934) (#15446)
* Tweak: Fix merge conflicts between Additional Breakpoints and Dev Edition (#15580)
* Tweak: Font-Awesome icons as inline SVG [ED-2081] (#15236)
* Tweak: Additional Breakpoints - System tweaks (ED-3907, ED-3852, ED-3999, ED-3943, ED-4123) (#15465)
* Fix: The widgets inline CSS was printed as plain text. (#15666)
* Responsive bar: Fix - Widescreen breakpoint reject values entered in the Responsive bar [ED-4216] (#15689)

#### 3.4.0-dev13 - 2021-07-22
* Testimonial Alignment: Tweak - Responsive Added to Alignment control in Testimonial widget [ED-2812] (#15158)
* Fix: Exclude elementor templates from WP default sitemap closes [ED-583] (#15363)
* Fix: WP audio widget only shows correct styling in live preview [ED-855] (#15380)
* Fix: New tabs do not appear in Tabs Widget if alignment is not Default or Start [ED-1651] (#14686)
* Tweak: Usage - Add additional data [ED-798] (#13406)
* Tweak: Responsive Bar - Scale added to responsive preview [ED-1209]  (#15169)
* Fix: Promotion - The 'Go Pro' link appears even if the Pro is active [ED-3917] (#15445)
* Tweak: Added option to deep-link into revisions history [ED-3828] (#15503)
* Fix: Dynamic content disappeared if chosen in Code Highlight [ED-3232] (#15357)
* Tweak: Font-Awesome icons as inline SVG [ED-2081] (#15236)
* Tweak: Updating the webpack version to 5.40.0 and Optimizing Frontend JS Files With Babel [ED-3482] (#15507)
* Fix: Dev edition remove beta tag (#15590)
* Fix: The Color Sampler cursor isn't working properly [ED-4128] (#15592)
* Fix: Kit-Library - User is activate and not connected [ED-4154] (#15606)
* Fix:  ScreenShotter timeout (#15608)
* Tweak: Updated Changelog for v3.3.0 (#15609)
* Fix: System Info - User report is enabled even if there is no user [ED-2507] (#14619)
* Fix: Removed deprecated classes calls (#15625)
* Tweak: Additional Breakpoints - System tweaks (ED-3907, ED-3852, ED-3999, ED-3943, ED-4123) (#15465)
* Fix: The build process of 3.4.0 fails. (#15626)
* Tweak - Allowing to create inline-css dependencies between widgets. (#15663)
* Tweak: Adding a back to kit-library button in the import-kit screen [ED-3637] (#15617)
* Fix: The widgets inline CSS was printed as plain text. (#15666)
* Fix: Bug in global widgets cause in 3.3.0 core [ED-4223] (#15691)
* Fix: Z index issues in code highlight dynamic tag icon [ED-4043] (#15696)
* New: CSS Transform [ED-3212] (#15430)
* Tweak: Updated the E-Icons library to 5.12.0 (ED-4222) (#15685)
* Fix: The Inline CSS experiment link is incorrect. (#15687)
* Tweak: Optimizing the Inline CSS dependencies solution [ED-4272] (#15693)
* Fix: Default Mobile width changed to 360px in Responsive Bar preview (#15690)
* Fix: Icon List - Text size increased on Icon list widget with size set to `em` and a link [ED-3177] (#15544)
* Tweak: Updated changelog for v3.3.1 (#15706)
* Revert "Fix: Icon List - Text size increased on Icon list widget with size set to `em` and a link [ED-3177] (#15544)" (#15701)
* Tweak: Improved PHP Lint enforcement [ED-2901] (#15631)
* Fix: Setting zero offset in sticky motion effects not working properly [ED-3514] (#15191)
* Fix: Responsive bar - UI glitch in Responsive bar in Wide screens [ED-4175] (#15647)
* Fix: Lighthouse unused css rules (#15739)
* Fix: The build process fails. (#15726)
* Responsive bar: Fix - Widescreen breakpoint reject values entered in the Responsive bar [ED-4216] (#15689)
