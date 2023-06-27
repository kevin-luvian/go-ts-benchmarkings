
CREATE TABLE `go_tbl_faspay_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `upload_logs_id` int(11) DEFAULT NULL,
  `source_id` int(11) DEFAULT '3',
  `channel_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bill_date` datetime DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `total_bill` decimal(25,2) DEFAULT NULL,
  `total_payment` decimal(25,2) DEFAULT NULL,
  `settlement_service_rate` decimal(5,2) DEFAULT NULL,
  `settlement_service_fee` decimal(25,2) DEFAULT NULL,
  `fee_channel` decimal(25,2) DEFAULT NULL,
  `reconciliation_date` datetime DEFAULT NULL,
  `settlement_date` datetime DEFAULT NULL,
  `total_settlement` decimal(25,2) DEFAULT NULL,
  `bill_number` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bill_reff` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matching_id` int(11) DEFAULT NULL,
  `matching_table_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matching_type_id` int(11) DEFAULT NULL,
  `note` mediumtext COLLATE utf8mb4_unicode_ci,
  `operator_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tbl_faspay_reports_matching_id` (`matching_id`),
  KEY `tbl_faspay_reports_transaction_id` (`transaction_id`),
  KEY `tbl_faspay_reports_payment_date` (`payment_date`),
  KEY `tbl_faspay_reports_total_payment` (`total_payment`),
  KEY `IDX_matching_id_payment_date` (`matching_id`,`payment_date`),
  KEY `IDX_bill_number` (`bill_number`),
  KEY `IDX_bill_reff` (`bill_reff`),
  KEY `idx_tbl_faspay_reports_upload_logs_id` (`upload_logs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=816216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `node_tbl_faspay_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `upload_logs_id` int(11) DEFAULT NULL,
  `source_id` int(11) DEFAULT '3',
  `channel_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bill_date` datetime DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `total_bill` decimal(25,2) DEFAULT NULL,
  `total_payment` decimal(25,2) DEFAULT NULL,
  `settlement_service_rate` decimal(5,2) DEFAULT NULL,
  `settlement_service_fee` decimal(25,2) DEFAULT NULL,
  `fee_channel` decimal(25,2) DEFAULT NULL,
  `reconciliation_date` datetime DEFAULT NULL,
  `settlement_date` datetime DEFAULT NULL,
  `total_settlement` decimal(25,2) DEFAULT NULL,
  `bill_number` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bill_reff` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matching_id` int(11) DEFAULT NULL,
  `matching_table_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matching_type_id` int(11) DEFAULT NULL,
  `note` mediumtext COLLATE utf8mb4_unicode_ci,
  `operator_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tbl_faspay_reports_matching_id` (`matching_id`),
  KEY `tbl_faspay_reports_transaction_id` (`transaction_id`),
  KEY `tbl_faspay_reports_payment_date` (`payment_date`),
  KEY `tbl_faspay_reports_total_payment` (`total_payment`),
  KEY `IDX_matching_id_payment_date` (`matching_id`,`payment_date`),
  KEY `IDX_bill_number` (`bill_number`),
  KEY `IDX_bill_reff` (`bill_reff`),
  KEY `idx_tbl_faspay_reports_upload_logs_id` (`upload_logs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=816216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `limerock_repayments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  `kredivo_loan_id` decimal(25,2) DEFAULT NULL,
  `kredivo_user_id` decimal(25,2) DEFAULT NULL,
  `distributor_id` decimal(25,2) DEFAULT NULL,
  `lender_id` decimal(25,2) DEFAULT NULL,
  `repayment_id` decimal(25,2) DEFAULT NULL,
  `repaid_amount` decimal(25,2) DEFAULT NULL,
  `repaid_principal_amount` decimal(25,2) DEFAULT NULL,
  `repaid_interest_amount` decimal(25,2) DEFAULT NULL,
  `loan_dpd` decimal(25,2) DEFAULT NULL,
  `loan_id` decimal(25,2) DEFAULT NULL,
  `late_interest` decimal(25,2) DEFAULT NULL,
  `late_fee` decimal(25,2) DEFAULT NULL,
  
  `kredivo_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lender_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lender_contact_email_primary` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `internal_repayment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_repayment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posting_date` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value_date` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_refund_payment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repaid_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legacy_loan_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jfs_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenure` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `term` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loan_closed_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repayment_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,

  `sidecar_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `sidecar_muuid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `sidecar_mcount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '0',
  `sidecar_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sidecar_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=latin1;

CREATE TABLE `limerock_repayments_sidecar` (
  `kredivo_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `muuid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `mcount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kredivo_transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=latin1;


-- CREATE TABLE new_foo LIKE go_tbl_faspay_reports;
-- RENAME TABLE go_tbl_faspay_reports TO old_foo, new_foo TO go_tbl_faspay_reports;
-- DROP TABLE old_foo;



-- CREATE TABLE new_foo LIKE node_tbl_faspay_reports;
-- RENAME TABLE node_tbl_faspay_reports TO old_foo, new_foo TO node_tbl_faspay_reports;
-- DROP TABLE old_foo;

-- select count(1) from go_tbl_faspay_reports;
-- select count(1) from node_tbl_faspay_reports;
