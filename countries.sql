-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 25, 2025 at 01:39 PM
-- Server version: 10.6.21-MariaDB-cll-lve
-- PHP Version: 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `brandsv_ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(11) NOT NULL,
  `code` varchar(2) NOT NULL DEFAULT '',
  `name` varchar(100) NOT NULL DEFAULT '',
  `status` int(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `code`, `name`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'AF', 'Afghanistan', 0, '2021-04-06 01:06:30', '2021-10-11 00:34:13', NULL),
(2, 'AL', 'Albania', 0, '2021-04-06 01:06:30', NULL, NULL),
(3, 'DZ', 'Algeria', 0, '2021-04-06 01:06:30', NULL, NULL),
(4, 'AS', 'American Samoa', 0, '2021-04-06 01:06:30', NULL, NULL),
(5, 'AD', 'Andorra', 0, '2021-04-06 01:06:30', NULL, NULL),
(6, 'AO', 'Angola', 0, '2021-04-06 01:06:30', NULL, NULL),
(7, 'AI', 'Anguilla', 0, '2021-04-06 01:06:30', NULL, NULL),
(8, 'AQ', 'Antarctica', 0, '2021-04-06 01:06:30', NULL, NULL),
(9, 'AG', 'Antigua And Barbuda', 0, '2021-04-06 01:06:30', NULL, NULL),
(10, 'AR', 'Argentina', 0, '2021-04-06 01:06:30', NULL, NULL),
(11, 'AM', 'Armenia', 0, '2021-04-06 01:06:30', NULL, NULL),
(12, 'AW', 'Aruba', 0, '2021-04-06 01:06:30', NULL, NULL),
(13, 'AU', 'Australia', 0, '2021-04-06 01:06:30', NULL, NULL),
(14, 'AT', 'Austria', 0, '2021-04-06 01:06:30', NULL, NULL),
(15, 'AZ', 'Azerbaijan', 0, '2021-04-06 01:06:30', NULL, NULL),
(16, 'BS', 'Bahamas The', 0, '2021-04-06 01:06:30', NULL, NULL),
(17, 'BH', 'Bahrain', 0, '2021-04-06 01:06:30', NULL, NULL),
(18, 'BD', 'Bangladesh', 0, '2021-04-06 01:06:30', NULL, NULL),
(19, 'BB', 'Barbados', 0, '2021-04-06 01:06:30', NULL, NULL),
(20, 'BY', 'Belarus', 0, '2021-04-06 01:06:30', NULL, NULL),
(21, 'BE', 'Belgium', 0, '2021-04-06 01:06:30', NULL, NULL),
(22, 'BZ', 'Belize', 0, '2021-04-06 01:06:30', NULL, NULL),
(23, 'BJ', 'Benin', 0, '2021-04-06 01:06:30', NULL, NULL),
(24, 'BM', 'Bermuda', 0, '2021-04-06 01:06:30', NULL, NULL),
(25, 'BT', 'Bhutan', 0, '2021-04-06 01:06:30', NULL, NULL),
(26, 'BO', 'Bolivia', 0, '2021-04-06 01:06:30', NULL, NULL),
(27, 'BA', 'Bosnia and Herzegovina', 0, '2021-04-06 01:06:30', NULL, NULL),
(28, 'BW', 'Botswana', 0, '2021-04-06 01:06:30', NULL, NULL),
(29, 'BV', 'Bouvet Island', 0, '2021-04-06 01:06:30', NULL, NULL),
(30, 'BR', 'Brazil', 0, '2021-04-06 01:06:30', NULL, NULL),
(31, 'IO', 'British Indian Ocean Territory', 0, '2021-04-06 01:06:30', NULL, NULL),
(32, 'BN', 'Brunei', 0, '2021-04-06 01:06:30', NULL, NULL),
(33, 'BG', 'Bulgaria', 0, '2021-04-06 01:06:30', NULL, NULL),
(34, 'BF', 'Burkina Faso', 0, '2021-04-06 01:06:30', NULL, NULL),
(35, 'BI', 'Burundi', 0, '2021-04-06 01:06:30', NULL, NULL),
(36, 'KH', 'Cambodia', 0, '2021-04-06 01:06:30', NULL, NULL),
(37, 'CM', 'Cameroon', 0, '2021-04-06 01:06:30', NULL, NULL),
(38, 'CA', 'Canada', 0, '2021-04-06 01:06:30', NULL, NULL),
(39, 'CV', 'Cape Verde', 0, '2021-04-06 01:06:30', NULL, NULL),
(40, 'KY', 'Cayman Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(41, 'CF', 'Central African Republic', 0, '2021-04-06 01:06:30', NULL, NULL),
(42, 'TD', 'Chad', 0, '2021-04-06 01:06:30', NULL, NULL),
(43, 'CL', 'Chile', 0, '2021-04-06 01:06:30', NULL, NULL),
(44, 'CN', 'China', 0, '2021-04-06 01:06:30', NULL, NULL),
(45, 'CX', 'Christmas Island', 0, '2021-04-06 01:06:30', NULL, NULL),
(46, 'CC', 'Cocos (Keeling) Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(47, 'CO', 'Colombia', 0, '2021-04-06 01:06:30', NULL, NULL),
(48, 'KM', 'Comoros', 0, '2021-04-06 01:06:30', NULL, NULL),
(49, 'CG', 'Republic Of The Congo', 0, '2021-04-06 01:06:30', NULL, NULL),
(50, 'CD', 'Democratic Republic Of The Congo', 0, '2021-04-06 01:06:30', NULL, NULL),
(51, 'CK', 'Cook Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(52, 'CR', 'Costa Rica', 0, '2021-04-06 01:06:30', NULL, NULL),
(53, 'CI', 'Cote D\'Ivoire (Ivory Coast)', 0, '2021-04-06 01:06:30', NULL, NULL),
(54, 'HR', 'Croatia (Hrvatska)', 0, '2021-04-06 01:06:30', NULL, NULL),
(55, 'CU', 'Cuba', 0, '2021-04-06 01:06:30', NULL, NULL),
(56, 'CY', 'Cyprus', 0, '2021-04-06 01:06:30', NULL, NULL),
(57, 'CZ', 'Czech Republic', 0, '2021-04-06 01:06:30', NULL, NULL),
(58, 'DK', 'Denmark', 0, '2021-04-06 01:06:30', NULL, NULL),
(59, 'DJ', 'Djibouti', 0, '2021-04-06 01:06:30', NULL, NULL),
(60, 'DM', 'Dominica', 0, '2021-04-06 01:06:30', NULL, NULL),
(61, 'DO', 'Dominican Republic', 0, '2021-04-06 01:06:30', NULL, NULL),
(62, 'TP', 'East Timor', 0, '2021-04-06 01:06:30', NULL, NULL),
(63, 'EC', 'Ecuador', 0, '2021-04-06 01:06:30', NULL, NULL),
(64, 'EG', 'Egypt', 0, '2021-04-06 01:06:30', NULL, NULL),
(65, 'SV', 'El Salvador', 0, '2021-04-06 01:06:30', NULL, NULL),
(66, 'GQ', 'Equatorial Guinea', 0, '2021-04-06 01:06:30', NULL, NULL),
(67, 'ER', 'Eritrea', 0, '2021-04-06 01:06:30', NULL, NULL),
(68, 'EE', 'Estonia', 0, '2021-04-06 01:06:30', NULL, NULL),
(69, 'ET', 'Ethiopia', 0, '2021-04-06 01:06:30', NULL, NULL),
(70, 'XA', 'External Territories of Australia', 0, '2021-04-06 01:06:30', NULL, NULL),
(71, 'FK', 'Falkland Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(72, 'FO', 'Faroe Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(73, 'FJ', 'Fiji Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(74, 'FI', 'Finland', 0, '2021-04-06 01:06:30', NULL, NULL),
(75, 'FR', 'France', 0, '2021-04-06 01:06:30', NULL, NULL),
(76, 'GF', 'French Guiana', 0, '2021-04-06 01:06:30', NULL, NULL),
(77, 'PF', 'French Polynesia', 0, '2021-04-06 01:06:30', NULL, NULL),
(78, 'TF', 'French Southern Territories', 0, '2021-04-06 01:06:30', NULL, NULL),
(79, 'GA', 'Gabon', 0, '2021-04-06 01:06:30', NULL, NULL),
(80, 'GM', 'Gambia The', 0, '2021-04-06 01:06:30', NULL, NULL),
(81, 'GE', 'Georgia', 0, '2021-04-06 01:06:30', NULL, NULL),
(82, 'DE', 'Germany', 0, '2021-04-06 01:06:30', NULL, NULL),
(83, 'GH', 'Ghana', 0, '2021-04-06 01:06:30', NULL, NULL),
(84, 'GI', 'Gibraltar', 0, '2021-04-06 01:06:30', NULL, NULL),
(85, 'GR', 'Greece', 0, '2021-04-06 01:06:30', NULL, NULL),
(86, 'GL', 'Greenland', 0, '2021-04-06 01:06:30', NULL, NULL),
(87, 'GD', 'Grenada', 0, '2021-04-06 01:06:30', NULL, NULL),
(88, 'GP', 'Guadeloupe', 0, '2021-04-06 01:06:30', NULL, NULL),
(89, 'GU', 'Guam', 0, '2021-04-06 01:06:30', NULL, NULL),
(90, 'GT', 'Guatemala', 0, '2021-04-06 01:06:30', NULL, NULL),
(91, 'XU', 'Guernsey and Alderney', 0, '2021-04-06 01:06:30', NULL, NULL),
(92, 'GN', 'Guinea', 0, '2021-04-06 01:06:30', NULL, NULL),
(93, 'GW', 'Guinea-Bissau', 0, '2021-04-06 01:06:30', NULL, NULL),
(94, 'GY', 'Guyana', 0, '2021-04-06 01:06:30', NULL, NULL),
(95, 'HT', 'Haiti', 0, '2021-04-06 01:06:30', NULL, NULL),
(96, 'HM', 'Heard and McDonald Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(97, 'HN', 'Honduras', 0, '2021-04-06 01:06:30', NULL, NULL),
(98, 'HK', 'Hong Kong S.A.R.', 0, '2021-04-06 01:06:30', NULL, NULL),
(99, 'HU', 'Hungary', 0, '2021-04-06 01:06:30', NULL, NULL),
(100, 'IS', 'Iceland', 0, '2021-04-06 01:06:30', NULL, NULL),
(101, 'IN', 'India', 0, '2021-04-06 01:06:30', NULL, NULL),
(102, 'ID', 'Indonesia', 0, '2021-04-06 01:06:30', NULL, NULL),
(103, 'IR', 'Iran', 0, '2021-04-06 01:06:30', NULL, NULL),
(104, 'IQ', 'Iraq', 0, '2021-04-06 01:06:30', NULL, NULL),
(105, 'IE', 'Ireland', 0, '2021-04-06 01:06:30', NULL, NULL),
(106, 'IL', 'Israel', 0, '2021-04-06 01:06:30', NULL, NULL),
(107, 'IT', 'Italy', 0, '2021-04-06 01:06:30', NULL, NULL),
(108, 'JM', 'Jamaica', 0, '2021-04-06 01:06:30', NULL, NULL),
(109, 'JP', 'Japan', 0, '2021-04-06 01:06:30', NULL, NULL),
(110, 'XJ', 'Jersey', 0, '2021-04-06 01:06:30', NULL, NULL),
(111, 'JO', 'Jordan', 0, '2021-04-06 01:06:30', NULL, NULL),
(112, 'KZ', 'Kazakhstan', 0, '2021-04-06 01:06:30', NULL, NULL),
(113, 'KE', 'Kenya', 0, '2021-04-06 01:06:30', NULL, NULL),
(114, 'KI', 'Kiribati', 0, '2021-04-06 01:06:30', NULL, NULL),
(115, 'KP', 'Korea North', 0, '2021-04-06 01:06:30', NULL, NULL),
(116, 'KR', 'Korea South', 0, '2021-04-06 01:06:30', NULL, NULL),
(117, 'KW', 'Kuwait', 0, '2021-04-06 01:06:30', NULL, NULL),
(118, 'KG', 'Kyrgyzstan', 0, '2021-04-06 01:06:30', NULL, NULL),
(119, 'LA', 'Laos', 0, '2021-04-06 01:06:30', NULL, NULL),
(120, 'LV', 'Latvia', 0, '2021-04-06 01:06:30', NULL, NULL),
(121, 'LB', 'Lebanon', 0, '2021-04-06 01:06:30', NULL, NULL),
(122, 'LS', 'Lesotho', 0, '2021-04-06 01:06:30', NULL, NULL),
(123, 'LR', 'Liberia', 0, '2021-04-06 01:06:30', NULL, NULL),
(124, 'LY', 'Libya', 0, '2021-04-06 01:06:30', NULL, NULL),
(125, 'LI', 'Liechtenstein', 0, '2021-04-06 01:06:30', NULL, NULL),
(126, 'LT', 'Lithuania', 0, '2021-04-06 01:06:30', NULL, NULL),
(127, 'LU', 'Luxembourg', 0, '2021-04-06 01:06:30', NULL, NULL),
(128, 'MO', 'Macau S.A.R.', 0, '2021-04-06 01:06:30', NULL, NULL),
(129, 'MK', 'Macedonia', 0, '2021-04-06 01:06:30', NULL, NULL),
(130, 'MG', 'Madagascar', 0, '2021-04-06 01:06:30', NULL, NULL),
(131, 'MW', 'Malawi', 0, '2021-04-06 01:06:30', NULL, NULL),
(132, 'MY', 'Malaysia', 0, '2021-04-06 01:06:30', NULL, NULL),
(133, 'MV', 'Maldives', 0, '2021-04-06 01:06:30', NULL, NULL),
(134, 'ML', 'Mali', 0, '2021-04-06 01:06:30', NULL, NULL),
(135, 'MT', 'Malta', 0, '2021-04-06 01:06:30', NULL, NULL),
(136, 'XM', 'Man (Isle of)', 0, '2021-04-06 01:06:30', NULL, NULL),
(137, 'MH', 'Marshall Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(138, 'MQ', 'Martinique', 0, '2021-04-06 01:06:30', NULL, NULL),
(139, 'MR', 'Mauritania', 0, '2021-04-06 01:06:30', NULL, NULL),
(140, 'MU', 'Mauritius', 0, '2021-04-06 01:06:30', NULL, NULL),
(141, 'YT', 'Mayotte', 0, '2021-04-06 01:06:30', NULL, NULL),
(142, 'MX', 'Mexico', 0, '2021-04-06 01:06:30', NULL, NULL),
(143, 'FM', 'Micronesia', 0, '2021-04-06 01:06:30', NULL, NULL),
(144, 'MD', 'Moldova', 0, '2021-04-06 01:06:30', NULL, NULL),
(145, 'MC', 'Monaco', 0, '2021-04-06 01:06:30', NULL, NULL),
(146, 'MN', 'Mongolia', 0, '2021-04-06 01:06:30', NULL, NULL),
(147, 'MS', 'Montserrat', 0, '2021-04-06 01:06:30', NULL, NULL),
(148, 'MA', 'Morocco', 0, '2021-04-06 01:06:30', NULL, NULL),
(149, 'MZ', 'Mozambique', 0, '2021-04-06 01:06:30', NULL, NULL),
(150, 'MM', 'Myanmar', 0, '2021-04-06 01:06:30', NULL, NULL),
(151, 'NA', 'Namibia', 0, '2021-04-06 01:06:30', NULL, NULL),
(152, 'NR', 'Nauru', 0, '2021-04-06 01:06:30', NULL, NULL),
(153, 'NP', 'Nepal', 0, '2021-04-06 01:06:30', NULL, NULL),
(154, 'AN', 'Netherlands Antilles', 0, '2021-04-06 01:06:30', NULL, NULL),
(155, 'NL', 'Netherlands The', 0, '2021-04-06 01:06:30', NULL, NULL),
(156, 'NC', 'New Caledonia', 0, '2021-04-06 01:06:30', NULL, NULL),
(157, 'NZ', 'New Zealand', 0, '2021-04-06 01:06:30', NULL, NULL),
(158, 'NI', 'Nicaragua', 0, '2021-04-06 01:06:30', NULL, NULL),
(159, 'NE', 'Niger', 0, '2021-04-06 01:06:30', NULL, NULL),
(160, 'NG', 'Nigeria', 0, '2021-04-06 01:06:30', NULL, NULL),
(161, 'NU', 'Niue', 0, '2021-04-06 01:06:30', NULL, NULL),
(162, 'NF', 'Norfolk Island', 0, '2021-04-06 01:06:30', NULL, NULL),
(163, 'MP', 'Northern Mariana Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(164, 'NO', 'Norway', 0, '2021-04-06 01:06:30', NULL, NULL),
(165, 'OM', 'Oman', 0, '2021-04-06 01:06:30', NULL, NULL),
(166, 'PK', 'Pakistan', 1, '2021-04-06 01:06:30', '2022-12-14 16:22:10', NULL),
(167, 'PW', 'Palau', 0, '2021-04-06 01:06:30', NULL, NULL),
(168, 'PS', 'Palestinian Territory Occupied', 0, '2021-04-06 01:06:30', NULL, NULL),
(169, 'PA', 'Panama', 0, '2021-04-06 01:06:30', NULL, NULL),
(170, 'PG', 'Papua new Guinea', 0, '2021-04-06 01:06:30', NULL, NULL),
(171, 'PY', 'Paraguay', 0, '2021-04-06 01:06:30', NULL, NULL),
(172, 'PE', 'Peru', 0, '2021-04-06 01:06:30', NULL, NULL),
(173, 'PH', 'Philippines', 0, '2021-04-06 01:06:30', NULL, NULL),
(174, 'PN', 'Pitcairn Island', 0, '2021-04-06 01:06:30', NULL, NULL),
(175, 'PL', 'Poland', 0, '2021-04-06 01:06:30', NULL, NULL),
(176, 'PT', 'Portugal', 0, '2021-04-06 01:06:30', NULL, NULL),
(177, 'PR', 'Puerto Rico', 0, '2021-04-06 01:06:30', NULL, NULL),
(178, 'QA', 'Qatar', 0, '2021-04-06 01:06:30', NULL, NULL),
(179, 'RE', 'Reunion', 0, '2021-04-06 01:06:30', NULL, NULL),
(180, 'RO', 'Romania', 0, '2021-04-06 01:06:30', NULL, NULL),
(181, 'RU', 'Russia', 0, '2021-04-06 01:06:30', NULL, NULL),
(182, 'RW', 'Rwanda', 0, '2021-04-06 01:06:30', NULL, NULL),
(183, 'SH', 'Saint Helena', 0, '2021-04-06 01:06:30', NULL, NULL),
(184, 'KN', 'Saint Kitts And Nevis', 0, '2021-04-06 01:06:30', NULL, NULL),
(185, 'LC', 'Saint Lucia', 0, '2021-04-06 01:06:30', NULL, NULL),
(186, 'PM', 'Saint Pierre and Miquelon', 0, '2021-04-06 01:06:30', NULL, NULL),
(187, 'VC', 'Saint Vincent And The Grenadines', 0, '2021-04-06 01:06:30', NULL, NULL),
(188, 'WS', 'Samoa', 0, '2021-04-06 01:06:30', NULL, NULL),
(189, 'SM', 'San Marino', 0, '2021-04-06 01:06:30', NULL, NULL),
(190, 'ST', 'Sao Tome and Principe', 0, '2021-04-06 01:06:30', NULL, NULL),
(191, 'SA', 'Saudi Arabia', 0, '2021-04-06 01:06:30', NULL, NULL),
(192, 'SN', 'Senegal', 0, '2021-04-06 01:06:30', NULL, NULL),
(193, 'RS', 'Serbia', 0, '2021-04-06 01:06:30', NULL, NULL),
(194, 'SC', 'Seychelles', 0, '2021-04-06 01:06:30', NULL, NULL),
(195, 'SL', 'Sierra Leone', 0, '2021-04-06 01:06:30', NULL, NULL),
(196, 'SG', 'Singapore', 0, '2021-04-06 01:06:30', NULL, NULL),
(197, 'SK', 'Slovakia', 0, '2021-04-06 01:06:30', NULL, NULL),
(198, 'SI', 'Slovenia', 0, '2021-04-06 01:06:30', NULL, NULL),
(199, 'XG', 'Smaller Territories of the UK', 0, '2021-04-06 01:06:30', NULL, NULL),
(200, 'SB', 'Solomon Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(201, 'SO', 'Somalia', 0, '2021-04-06 01:06:30', NULL, NULL),
(202, 'ZA', 'South Africa', 0, '2021-04-06 01:06:30', NULL, NULL),
(203, 'GS', 'South Georgia', 0, '2021-04-06 01:06:30', NULL, NULL),
(204, 'SS', 'South Sudan', 0, '2021-04-06 01:06:30', NULL, NULL),
(205, 'ES', 'Spain', 0, '2021-04-06 01:06:30', NULL, NULL),
(206, 'LK', 'Sri Lanka', 0, '2021-04-06 01:06:30', NULL, NULL),
(207, 'SD', 'Sudan', 0, '2021-04-06 01:06:30', NULL, NULL),
(208, 'SR', 'Suriname', 0, '2021-04-06 01:06:30', NULL, NULL),
(209, 'SJ', 'Svalbard And Jan Mayen Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(210, 'SZ', 'Swaziland', 0, '2021-04-06 01:06:30', NULL, NULL),
(211, 'SE', 'Sweden', 0, '2021-04-06 01:06:30', NULL, NULL),
(212, 'CH', 'Switzerland', 0, '2021-04-06 01:06:30', NULL, NULL),
(213, 'SY', 'Syria', 0, '2021-04-06 01:06:30', NULL, NULL),
(214, 'TW', 'Taiwan', 0, '2021-04-06 01:06:30', NULL, NULL),
(215, 'TJ', 'Tajikistan', 0, '2021-04-06 01:06:30', NULL, NULL),
(216, 'TZ', 'Tanzania', 0, '2021-04-06 01:06:30', NULL, NULL),
(217, 'TH', 'Thailand', 0, '2021-04-06 01:06:30', NULL, NULL),
(218, 'TG', 'Togo', 0, '2021-04-06 01:06:30', NULL, NULL),
(219, 'TK', 'Tokelau', 0, '2021-04-06 01:06:30', NULL, NULL),
(220, 'TO', 'Tonga', 0, '2021-04-06 01:06:30', NULL, NULL),
(221, 'TT', 'Trinidad And Tobago', 0, '2021-04-06 01:06:30', NULL, NULL),
(222, 'TN', 'Tunisia', 0, '2021-04-06 01:06:30', NULL, NULL),
(223, 'TR', 'Turkey', 0, '2021-04-06 01:06:30', NULL, NULL),
(224, 'TM', 'Turkmenistan', 0, '2021-04-06 01:06:30', NULL, NULL),
(225, 'TC', 'Turks And Caicos Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(226, 'TV', 'Tuvalu', 0, '2021-04-06 01:06:30', NULL, NULL),
(227, 'UG', 'Uganda', 0, '2021-04-06 01:06:30', NULL, NULL),
(228, 'UA', 'Ukraine', 0, '2021-04-06 01:06:30', NULL, NULL),
(229, 'AE', 'United Arab Emirates', 0, '2021-04-06 01:06:30', NULL, NULL),
(230, 'GB', 'United Kingdom', 0, '2021-04-06 01:06:30', NULL, NULL),
(231, 'US', 'United States', 0, '2021-04-06 01:06:30', NULL, NULL),
(232, 'UM', 'United States Minor Outlying Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(233, 'UY', 'Uruguay', 0, '2021-04-06 01:06:30', NULL, NULL),
(234, 'UZ', 'Uzbekistan', 0, '2021-04-06 01:06:30', NULL, NULL),
(235, 'VU', 'Vanuatu', 0, '2021-04-06 01:06:30', NULL, NULL),
(236, 'VA', 'Vatican City State (Holy See)', 0, '2021-04-06 01:06:30', NULL, NULL),
(237, 'VE', 'Venezuela', 0, '2021-04-06 01:06:30', NULL, NULL),
(238, 'VN', 'Vietnam', 0, '2021-04-06 01:06:30', NULL, NULL),
(239, 'VG', 'Virgin Islands (British)', 0, '2021-04-06 01:06:30', NULL, NULL),
(240, 'VI', 'Virgin Islands (US)', 0, '2021-04-06 01:06:30', NULL, NULL),
(241, 'WF', 'Wallis And Futuna Islands', 0, '2021-04-06 01:06:30', NULL, NULL),
(242, 'EH', 'Western Sahara', 0, '2021-04-06 01:06:30', NULL, NULL),
(243, 'YE', 'Yemen', 0, '2021-04-06 01:06:30', NULL, NULL),
(244, 'YU', 'Yugoslavia', 0, '2021-04-06 01:06:30', NULL, NULL),
(245, 'ZM', 'Zambia', 0, '2021-04-06 01:06:30', NULL, NULL),
(246, 'ZW', 'Zimbabwe', 0, '2021-04-06 01:06:30', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=297;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
