# -*- coding: utf-8 -*-
# Copyright (c) 2018, Flexsofts and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, nowdate, getdate

class ServiceRequest(Document):
	pass

@frappe.whitelist()
def make_sales_order(source_name, target_doc=None, ignore_permissions=False):

	def set_missing_values(source, target):
		target.ignore_pricing_rule = 1
		target.flags.ignore_permissions = ignore_permissions
		target.run_method("set_missing_values")
		target.run_method("calculate_taxes_and_totals")

	def update_item(obj, target, source_parent):
		target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)

	doclist = get_mapped_doc("Service Request", source_name, {
			"Service Request": {
				"doctype": "Sales Order",
				"validation": {
					"docstatus": ["=", 1]
				}
			},
			"Service Request Item": {
				"doctype": "Sales Order Item",
			
				"postprocess": update_item
			},
			"Sales Taxes and Charges": {
				"doctype": "Sales Taxes and Charges",
				"add_if_empty": True
			},
			
		}, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

	# postprocess: fetch shipping address, set missing values

	return doclist



@frappe.whitelist()
def make_service_delivery(source_name, target_doc=None, ignore_permissions=False):

        def set_missing_values(source, target):
                target.ignore_pricing_rule = 1
                target.flags.ignore_permissions = ignore_permissions
                target.run_method("set_missing_values")
              

        def update_item(obj, target, source_parent):
                target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)

        doclist = get_mapped_doc("Service Request", source_name, {
                        "Service Request": {
                                "doctype": "Service Delivery",
                                "validation": {
                                        "docstatus": ["=", 1]
                                }
                        },
                        "Service Request Item": {
                                "doctype": "Service Delivery Item",

                                "postprocess": update_item
                        },
                       

                }, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

        # postprocess: fetch shipping address, set missing values

        return doclist


