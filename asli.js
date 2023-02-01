/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

// name: ABA - Print PDF Script
// id: _aba_print_pdf_sl
// deploy: __aba_print_pdf

define(['N/runtime', 'N/render', 'N/file', 'N/search', 'N/record', 'N/error'], function (runtime, render, file, search, record, error) {
    function onRequest(context) {
        log.debug({
            "title": "Remaining governance units: ",
            "details": runtime.getCurrentScript().getRemainingUsage()
        });
        var request = context.request;
        var response = context.response;
        var statePrint = 0;

        if (null != request.parameters.recordtype && null != request.parameters.id) {
            try {
                var recType = request.parameters.recordtype;
                var currID = request.parameters.id;
                log.debug({
                    "title": "request.parameters",
                    "details": recType + " " + currID
                });

                var renderer = render.create();

                if (recType == 'itemfulfillment') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/itemShip_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'T'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'taxline',
                        operator: 'IS',
                        values: 'F'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['ItemShip']
                    }));
                    /* arrFilters.push(search.createFilter({
                    name: 'status',
                    operator: search.Operator.ANYOF,
                    values: ['ItemShip:A']
                    })); */
                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));

                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'number', 'status', 'custbody_aba_picker', 'custbody_aba_checker', 'shipaddress', 'locationnohierarchy',
                            'memomain', 'createdfrom.number',
                            search.createColumn({
                                name: 'formulatext1',
                                formula: "TO_CHAR({trandate}, 'YYYY-Mon-DD')",
                                sort: search.Sort.ASC
                            }),
                        ]
                    }).run().getRange(0, 100);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['ItemShip']], 'and',
                                ['memorized', 'is', 'F'], 'and',
                                ['status', 'anyof', ['ItemShip:A']], 'and',
                                ['taxline', 'is', 'F'], 'and',
                                ['mainline', 'is', 'ANY'], 'and',
                                ["formulatext: {rate}", 'ISEMPTY', '']
                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'item',
                                'item.description', 'item.displayname', 'inventorydetail.expirationdate',
                                'item.unitstype',
                                'item.class', 'unitabbreviation',
                                search.createColumn({
                                    name: 'formulanumeric1',
                                // formula: "CASE WHEN {unitabbreviation} = 'GR' THEN (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity}*1000 ELSE  {quantity}*1000 END)ELSE (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity} ELSE  {quantity} END) END",
                                formula:"CASE WHEN {unitabbreviation} = 'GR'  THEN (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity}*1000 ELSE  {quantity}*1000 END) WHEN  {unitabbreviation} = 'ml'  THEN (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity}*1000 ELSE  {quantity}*1000 END) WHEN {unitabbreviation} = 'Kg'  THEN (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity}*5 ELSE {quantity}*5 END) ELSE (CASE WHEN {inventorydetail.quantity} > 0 THEN  {inventorydetail.quantity} ELSE  {quantity} END) END"  
                                }),
                                search.createColumn({
                                    name: 'formulatext1',
                                    formula: "{inventorydetail.inventorynumber}",
                                }),
                            ]
                        }).run().getRange(0, 1000);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });

                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });

                            var currItem = [];
                            for (var i = 0; i < myTrx.length; i++) {
                                currItem.push(myTrx[i].getValue('item'));
                            }
                            log.debug({
                                "title": "current Item Array: ",
                                "details": currItem
                            });

                            var myBarcode = search.create({
                                type: 'customrecord_aba_barcode',
                                filters: [
                                    ['custrecord_aba_link_to_mst_itm_form_body', 'anyof', currItem],
                                ],
                                columns: [
                                    search.createColumn({
                                        name: 'internalid',
                                        sort: search.Sort.ASC
                                    }),
                                    'custrecord_aba_barcode',
                                    'custrecord_aba_link_to_mst_itm_form_body',
                                ]
                            }).run().getRange(0, 1000);
                            log.debug({
                                "title": "myBarcode: ",
                                "details": myBarcode
                            });

                            renderer.addSearchResults({
                                templateName: 'myBarcode',
                                searchResult: myBarcode
                            });

                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //
                else if (recType == 'inventorytransfer') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/invTrnfr_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'T'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['InvTrnfr']
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'tranid', 'status', 'custbody_aba_picker', 'custbody_aba_checker',
                            'custbody_aba_ti_from_location', 'custbody_aba_ti_to_target_location', 'memo',
                            search.createColumn({
                                name: 'formulatext1',
                                formula: "TO_CHAR({trandate}, 'YYYY-Mon-DD')",
                                sort: search.Sort.ASC
                            }),
                        ]
                    }).run().getRange(0, 100);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', 'is', 'F'], 'and',
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['InvTrnfr']], 'and',
                                ['memorized', 'is', 'F'], 'and',
                                ['taxline', 'is', 'F'], 'and',
                                ["formulanumeric: {quantity} * -1", 'GREATERTHAN', 0],
                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'item',
                                'item.displayname',
                                'inventorydetail.inventorynumber',
                                'inventorydetail.expirationdate',
                                'inventorydetail.quantity',
                                'quantity',
                                'item.unitstype',
                                'item.class',
                            ]
                        }).run().getRange(0, 1000);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });

                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });

                            var currItem = [];
                            for (var i = 0; i < myTrx.length; i++) {
                                currItem.push(myTrx[i].getValue('item'));
                            }
                            log.debug({
                                "title": "current Item Array: ",
                                "details": currItem
                            });

                            var myBarcode = search.create({
                                type: 'customrecord_aba_barcode',
                                filters: [
                                    ['custrecord_aba_link_to_mst_itm_form_body', 'anyof', currItem],
                                ],
                                columns: [
                                    search.createColumn({
                                        name: 'internalid',
                                        sort: search.Sort.ASC
                                    }),
                                    'custrecord_aba_barcode',
                                    'custrecord_aba_link_to_mst_itm_form_body',
                                ]
                            }).run().getRange(0, 1000);
                            log.debug({
                                "title": "myBarcode: ",
                                "details": myBarcode
                            });

                            renderer.addSearchResults({
                                templateName: 'myBarcode',
                                searchResult: myBarcode
                            });

                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //					
                else if (recType == 'expensereport') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/expRept_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'T'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['ExpRept']
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'subsidiary.legalname', 'tranid', 'trandate', 'custbody_aba_tipe_er_body', 'employee.entityid', 'memomain',
                            'totalamount', 'currency.name', 'memomain', 'advance', 'custbody_odi_terbilang_body', 'custbody_aba_er_approver_1',
                            'custbody_aba_er_approver_2', 'custbody_aba_er_approver_3', 'custbody_aba_er_approver_4',
                            search.createColumn({
                                name: 'formulatext1',
                                formula: "CASE  WHEN  {class} = 'VENCHI' THEN  {custbody_abave_er_um_kary} WHEN {class}= 'ELEMIS' THEN {custbody_abael__er_um_kary} ELSE {custbody_abalo_er_um_kary} END ",
                                sort: search.Sort.ASC
                            }),
                        ]
                    }).run().getRange(0, 100);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', 'is', 'ANY'], 'and',
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['ExpRept']], 'and',
                                ['memorized', 'is', 'F'], 'and',
                                ["formulanumeric: {creditamount}||{debitamount}", 'GREATERTHAN', 0],

                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'account',
                                'creditamount',
                                'debitamount',
                            ]
                        }).run().getRange(0, 100);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });

                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });

                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //
                else if (recType == 'vendorpayment') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/vendPymt_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'T'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['VendPymt']
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'subsidiary.legalname', 'transactionnumber', 'trandate', 'name', 'memomain', 'currency',
                            'exchangerate', 'custbody_odi_terbilang_body', 'custbody_aba_bp_approver_1',
                            'custbody_aba_bp_approver_2', 'custbody_aba_bp_approver_3', 'custbody_aba_bp_approver_4', 'nextapprover',
                            search.createColumn({
                                name: 'formulatext1',
                                formula: "TRIM(SUBSTR( {accountmain}, INSTR({accountmain} , ':' , 1, 1)+1))",
                                sort: search.Sort.ASC
                            }),
                            search.createColumn({
                                name: 'formulanumeric1',
                                formula: "{fxamount}*-1",
                                sort: search.Sort.ASC
                            }),
                        ]
                    }).run().getRange(0, 100);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', 'is', 'ANY'], 'and',
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['VendPymt']], 'and',
                                ['memorized', 'is', 'F'],

                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'account',
                                'creditamount',
                                'debitamount',
                            ]
                        }).run().getRange(0, 100);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });

                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });

                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //
                else if (recType == 'deposit') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/deposit_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'F'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['Deposit']
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'subsidiary.legalname', 'number', 'trandate', 'memomain', 'custbody_aba_dpst_nama_penerima_body',
                            'totalamount', 'custbody_odi_terbilang_body', 'accountmain',
                        ]
                    }).run().getRange(0, 100);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', 'is', 'ANY'], 'and',
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['Deposit']], 'and',
                                ['memorized', 'is', 'F'], 'and',
                                ["formulanumeric: {creditamount}||{debitamount}", 'GREATERTHAN', 0],

                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'account',
                                'creditfxamount',
                                'debitfxamount',
                            ]
                        }).run().getRange(0, 100);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });

                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });

                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //
                else if (recType == 'salesorder') { // Lock WF --> Done
                    statePrint = 1;
                    var xmlTemplateFile = file.load('Templates/PDF Templates/salesOrder_PDFTemplate.xml');
                    renderer.templateContent = xmlTemplateFile.getContents();

                    // Get data Header...
                    var arrFilters = [];
                    arrFilters.push(search.createFilter({
                        name: 'mainline',
                        operator: 'IS',
                        values: 'T'
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: currID
                    }));
                    arrFilters.push(search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['SalesOrd']
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'taxline',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));

                    arrFilters.push(search.createFilter({
                        name: 'memorized',
                        operator: search.Operator.IS,
                        values: 'F'
                    }));
                    var recLoad = search.create({
                        type: search.Type.TRANSACTION,
                        filters: arrFilters,
                        columns: [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            }), 'transactionnumber', 'trandate', 'mainname', 'otherrefnum', 'customer.custentity_aba_property_name_entity',
                            'terms', 'custbody_aba_so_transfer_to', 'custbody_aba_so_used_for', 'custbody_aba_so_marketing_support',
                            'custbody_aba_so_vm_support', 'custbody_aba_so_delivery_percent', 'custbody_aba_so_insentive_percent',
                            'class', 'custbody_aba_so_discount_rate',
                        ]
                    }).run().getRange(0, 1000);

                    if (recLoad.length == 1) { //  Jika terdapat data pada Header...
                        log.debug({
                            "title": "recLoad",
                            "details": recLoad
                        });
                        log.debug({
                            "title": "Remaining governance units: ",
                            "details": runtime.getCurrentScript().getRemainingUsage()
                        });

                        renderer.addSearchResults({
                            templateName: 'myRecord',
                            searchResult: recLoad
                        });

                        //  Get Data Lines...
                        var myTrx = search.create({
                            type: search.Type.TRANSACTION,
                            filters: [
                                ['mainline', 'is', 'F'], 'and',
                                ['internalid', 'is', currID], 'and',
                                ['type', 'anyof', ['SalesOrd']], 'and',
                                ['memorized', 'is', 'F'], 'and',
                                ['taxline', 'is', 'F'],
                            ],
                            columns: [
                                search.createColumn({
                                    name: 'internalid',
                                    sort: search.Sort.ASC
                                }), 'item', 'item.description', 'quantityuom',
                                'rate', 'amount',
                            ]
                        }).run().getRange(0, 100);

                        if (myTrx.length > 0) { //  Jika terdapat data pada Lines...
                            log.debug({
                                "title": "myTrx",
                                "details": myTrx
                            });
                            log.debug({
                                "title": "Remaining governance units: ",
                                "details": runtime.getCurrentScript().getRemainingUsage()
                            });


                            renderer.addSearchResults({
                                templateName: 'myTrx',
                                searchResult: myTrx
                            });


                        }
                    } //

                    log.debug({
                        "title": "Remaining governance units: ",
                        "details": runtime.getCurrentScript().getRemainingUsage()
                    });
                } //
                else {
                    /* do nothing */
                }

                if (statePrint == 1) {
                    var newfile = renderer.renderAsPdf();
                    response.writeFile(newfile, true);
                } //--//
            } //
            catch (e) {
                log.error({
                    "title": "Error",
                    "details": e.toString()
                });
                try {
                    return 'Please try again... ' + e.toString();
                } catch (e) {
                    log.error({
                        "title": "Error",
                        "details": e.toString()
                    });
                    return e.toString();
                }
            }
        }
    }

    return {
        onRequest: onRequest
    }
});