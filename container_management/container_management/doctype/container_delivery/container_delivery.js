// Copyright (c) 2018, Flexsofts and contributors
// For license information, please see license.txt

frappe.ui.form.on('Container Delivery', {
	refresh: function(frm) {

	},
	get_items:function(frm){

		if(frm.doc.service_request){
			frappe.call({
            			"method": "frappe.client.get_value",
            			args: {
                			doctype: "Service Request",
					fieldname: 'customer',
                			filters: { "name": frm.doc.service_request },
            			},
            			callback: function (r) {
              				cur_frm.set_value("customer",r.message.customer)
            			}
		    	});
		}
		else{
			frappe.msgprint(__("Select service request"))
		}

	},
});
