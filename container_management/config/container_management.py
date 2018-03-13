from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Container Management"),
			"items": [
				{
					"type": "doctype",
					"name": "Service Request",
					"description": _("Service Request For Containers.")
				},
				{
                                        "type": "doctype",
                                        "name": "Service Delivery",
                                        "description": _("Container delivery and return.")
                                },
				{
                                        "type": "doctype",
                                        "name": "Contract",
                                        "description": _("Container Contract.")
                                },
                                {
                                        "type": "doctype",
                                        "name": "Auto Invoicing",
                                        "description": _("Invoice from Container")
                                },

			]
		},
		{
			"label": _("Master Data"),
			"items": [
				{
					"type": "doctype",
					"name": "Item",
					"description": _("All Products or Services."),
				},
				{
                                        "type": "doctype",
                                        "name": "Contract Type",
                                        "description": _("Type of Contract"),
                                },
				{
                                        "type": "doctype",
                                        "name": "Driver",
                                        "description": _("Type of Contract"),
                                },
				{
					"type": "doctype",
					"name": "Customer",
					"description": _("Customer database."),
				},
				{
                                        "type": "doctype",
                                        "name": "Container No",
                                        "description": _("Container Details."),
                                },

			]
		}
	]
