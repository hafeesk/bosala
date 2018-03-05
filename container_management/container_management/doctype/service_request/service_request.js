// Copyright (c) 2018, Flexsofts and contributors
// For license information, please see license.txt

{% include 'erpnext/selling/sales_common.js' %}

frappe.ui.form.on('Service Request', {
	refresh: function(frm) {
		if(frm.doc.docstatus == 1){
			if(frm.doc.service_delivery){
    			        cur_frm.add_custom_button(__('Show Service Delivery'),
                                        cur_frm.cscript['Show Service Delivery']);

			}
			else{
				cur_frm.add_custom_button(__('Make Service Delivery'),
					cur_frm.cscript['Make Service Delivery']);
			}

			if(frm.doc.sales_order){
				cur_frm.add_custom_button(__('Show Sales Order'),
					cur_frm.cscript['Show Sales Order']);
			}
			else{
  			        cur_frm.add_custom_button(__('Make Sales Order'),
                                       cur_frm.cscript['Make Sales Order']);

			}
		}
	},

});

erpnext.selling.SalesOrderController = erpnext.selling.SellingController.extend({


	tc_name: function() {
		this.get_terms();
	},

	make_material_request: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_material_request",
			frm: this.frm
		})
	},

	make_delivery_note_based_on_delivery_date: function() {
		var me = this;

		var delivery_dates = [];
		$.each(this.frm.doc.items || [], function(i, d) {
			if(!delivery_dates.includes(d.delivery_date)) {
				delivery_dates.push(d.delivery_date);
			}
		});

		var item_grid = this.frm.fields_dict["items"].grid;
		if(!item_grid.get_selected().length && delivery_dates.length > 1) {
			var dialog = new frappe.ui.Dialog({
				title: __("Select Items based on Delivery Date"),
				fields: [{fieldtype: "HTML", fieldname: "dates_html"}]
			});

			var html = $(`
				<div style="border: 1px solid #d1d8dd">
					<div class="list-item list-item--head">
						<div class="list-item__content list-item__content--flex-2">
							${__('Delivery Date')}
						</div>
					</div>
					${delivery_dates.map(date => `
						<div class="list-item">
							<div class="list-item__content list-item__content--flex-2">
								<label>
								<input type="checkbox" data-date="${date}" checked="checked"/>
								${frappe.datetime.str_to_user(date)}
								</label>
							</div>
						</div>
					`).join("")}
				</div>
			`);

			var wrapper = dialog.fields_dict.dates_html.$wrapper;
			wrapper.html(html);

			dialog.set_primary_action(__("Select"), function() {
				var dates = wrapper.find('input[type=checkbox]:checked')
					.map((i, el) => $(el).attr('data-date')).toArray();

				if(!dates) return;

				$.each(dates, function(i, d) {
					$.each(item_grid.grid_rows || [], function(j, row) {
						if(row.doc.delivery_date == d) {
							row.doc.__checked = 1;
						}
					});
				})
				me.make_delivery_note();
				dialog.hide();
			});
			dialog.show();
		} else {
			this.make_delivery_note();
		}
	},

	make_delivery_note: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_delivery_note",
			frm: me.frm
		})
	},

	make_sales_invoice: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice",
			frm: this.frm
		})
	},

	make_maintenance_schedule: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_maintenance_schedule",
			frm: this.frm
		})
	},

	make_project: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_project",
			frm: this.frm
		})
	},

	make_maintenance_visit: function() {
		frappe.model.open_mapped_doc({
			method: "erpnext.selling.doctype.sales_order.sales_order.make_maintenance_visit",
			frm: this.frm
		})
	},

	make_purchase_order: function(){
		var me = this;
		var dialog = new frappe.ui.Dialog({
			title: __("For Supplier"),
			fields: [
				{"fieldtype": "Link", "label": __("Supplier"), "fieldname": "supplier", "options":"Supplier",
					"get_query": function () {
						return {
							query:"erpnext.selling.doctype.sales_order.sales_order.get_supplier",
							filters: {'parent': me.frm.doc.name}
						}
					}, "reqd": 1 },
				{"fieldtype": "Button", "label": __("Make Purchase Order"), "fieldname": "make_purchase_order", "cssClass": "btn-primary"},
			]
		});

		dialog.fields_dict.make_purchase_order.$input.click(function() {
			var args = dialog.get_values();
			if(!args) return;
			dialog.hide();
			return frappe.call({
				type: "GET",
				method: "erpnext.selling.doctype.sales_order.sales_order.make_purchase_order_for_drop_shipment",
				args: {
					"source_name": me.frm.doc.name,
					"for_supplier": args.supplier
				},
				freeze: true,
				callback: function(r) {
					if(!r.exc) {
						var doc = frappe.model.sync(r.message);
						frappe.set_route("Form", r.message.doctype, r.message.name);
					}
				}
			})
		});
		dialog.show();
	},
	close_sales_order: function(){
		this.frm.cscript.update_status("Close", "Closed")
	},
	update_status: function(label, status){
		var doc = this.frm.doc;
		var me = this;
		frappe.ui.form.is_saving = true;
		frappe.call({
			method: "erpnext.selling.doctype.sales_order.sales_order.update_status",
			args: {status: status, name: doc.name},
			callback: function(r){
				me.frm.reload_doc();
			},
			always: function() {
				frappe.ui.form.is_saving = false;
			}
		});
	},
	on_submit: function(doc, cdt, cdn) {
		if(cint(frappe.boot.notification_settings.sales_order)) {
			this.frm.email_doc(frappe.boot.notification_settings.sales_order_message);
		}
	},

	items_add: function(doc, cdt, cdn) {
		var row = frappe.get_doc(cdt, cdn);
		if(doc.delivery_date) {
			row.delivery_date = doc.delivery_date;
			refresh_field("delivery_date", cdn, "items");
		} else {
			this.frm.script_manager.copy_from_first_row("items", row, ["delivery_date"]);
		}
	}
});

$.extend(cur_frm.cscript, new erpnext.selling.SalesOrderController({frm: cur_frm}));




cur_frm.cscript['Make Sales Order'] = function() {
	frappe.model.open_mapped_doc({
		method: "container_management.container_management.doctype.service_request.service_request.make_sales_order",
		frm: cur_frm
	})
}
cur_frm.cscript['Make Service Delivery'] = function() {
        frappe.model.open_mapped_doc({
                method: "container_management.container_management.doctype.service_request.service_request.make_service_delivery",
                frm: cur_frm
        })
}



cur_frm.cscript['Show Sales Order'] = function() {
		
     		frappe.route_options = {
                        "name": cur_frm.doc.sales_order,

                };
                frappe.set_route("Form", "Sales Order",cur_frm.doc.sales_order);

}

cur_frm.cscript['Show Service Delivery'] = function() {
               
                frappe.route_options = {
                        "name": cur_frm.doc.service_delivery,

                };
                frappe.set_route("Form", "Service Delivery",cur_frm.doc.service_delivery);

}

