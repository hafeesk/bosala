# -*- coding: utf-8 -*-
# Copyright (c) 2018, Flexsofts and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ServiceDelivery(Document):
	def on_submit(self):

                obj_service_request = frappe.get_doc('Service Request',self.service_request)
		obj_service_request.service_delivery = self.name
		obj_service_request.save()
	
