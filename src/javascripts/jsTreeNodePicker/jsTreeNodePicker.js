/**
 * PROJECT: jsTreeNodePicker
 * Version: 0.5
 * Note:    Recommended for Bootstrap >=3, JQuery >=1.11.3, JQuery UI >=1.11.4, tagit >=2.0, jsTree >=3.2.1
 * AUTHOR:  (Jason Steve Nguyen) Hau Nguyen Viet
 * Email:   nvconghau1995@gmail.com
 * (c) 2016 Hau Nguyen Viet.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function( $ ) {
    var _count = -1;

    function __getSearchFunction(e, selectedNode, result) {
        if(e.id === selectedNode) {
            return true;
        }

        if (e.children == null) {
            return false;
        }

        if (e.children.length < 1) {
            return false;
        }


        var tryGet = $.grep(e.children, function(e2) { return __getSearchFunction(e2, selectedNode, result); } );
        if (tryGet.length == 0) {
              return false;
        } else {
            result.push(tryGet[0]);
        }

        return false;

    }

    function __getSelectedNodeObj(data, selectedNode) {
        var result = [];
        var tryGet = $.grep(data, function(e){
            return __getSearchFunction(e, selectedNode, result);

        });
        if (tryGet.length == 0) {
            if(result.length > 0) {
                return result[0];
            }
            return null;
        } else {
          return tryGet[0];
        }
    }


    $.fn.jsTreeNodePicker = function(options ) {

        var opts = $.extend( {}, $.fn.jsTreeNodePicker.defaults, options);
        var modalSelector;
        var btnOpen;
        var treeControl;
        var tagitControl;
        var errorMessageContainer;
		var modalBody;
		var treeControlContainer ;
		var idValuesContainer;
        var pickerObj = this.each(function() {
            modalSelector = $("#"+opts.dialogId);

            _count++;

            // Append open picker dialog button
            var btnOpenContainer = $('<div id="btnOpen'+opts.dialogId+'_container" ></div>');
            $(this).append(btnOpenContainer);
            btnOpen = $('<button id="btnOpen'+opts.dialogId+'" type="button" class="btn btn-default" '
                + ' data-toggle="modal" data-target="#'+opts.dialogId+'"> </button>');

            btnOpenContainer.append(btnOpen);

            modalBody = modalSelector.children(".modal-dialog").children(".modal-content").children(".modal-body");
            modalBody.css(opts.sizeCSS);

            // Add place to show error message
            errorMessageContainer = $('<div id="'+opts.dialogId+'_error_container" class="alert alert-danger" style="display: none;margin-bottom:10px;"></div>');
            modalBody.append(errorMessageContainer);

            var treeControlId = opts.dialogId + "_treeControl";

            treeControlContainer = $('<div id="'+ treeControlId +'_container" style="overflow: auto;'
                        +'height: 99%;max-width:95%;"></div>');
            modalBody.append(treeControlContainer);
            treeControl = $('<div id="'+ treeControlId +'" ></div>');

            treeControlContainer.append(treeControl);

            treeControl.jstree({
                'core' : {
                    'data' : opts.data
                },
                "checkbox" : opts.jstreeOptions.checkbox,
                "plugins" : opts.jstreeOptions.plugins
            });

            treeControl.bind("loaded.jstree", function (event, data) {
                if (opts.expandAllNodes === true) {
                    $(this).jstree("open_all");
                } else {
                    $(this).jstree("close_all");
                }

            });

            idValuesContainer = $('<div id="idValuesContainer_'+_count+'" ></div>');
            $(this).append(idValuesContainer);


            // Append tagit control
            var tagitControlContainer = $('<div id="tagit_control_container_'+_count+'" class="row" style="padding-left: 28px;"></div>');
            $(this).append(tagitControlContainer);

            tagitControl = $('<ul id="tagit_control_'+_count+'" class="col-md-8"></ul>');
            tagitControlContainer.append(tagitControl);
            tagitControl.tagit({
                fieldName: opts.tagitOptions.fieldName,
                allowSpaces: opts.tagitOptions.allowSpaces,
                tagLimit: opts.tagLimit,
                showAutocompleteOnFocus:  opts.tagitOptions.showAutocompleteOnFocus,
                readOnly: opts.tagitOptions.readOnly
            });
            opts.tagitOptions.fieldNameId = opts.tagitOptions.fieldName + "_ids";

            if (opts.removeTagItBorder === true) {
                tagitControl.removeClass("ui-widget-content");
            }

            if (opts.selectedNodes.length > 0) {
                tagitControl.tagit("removeAll");
                for (x in opts.selectedNodes) {
                    var tryGet = __getSelectedNodeObj(opts.data, opts.selectedNodes[x]);
                    if (tryGet == null) {
                        continue;
                    } else {
                      tagitControl.tagit('createTag', tryGet.text);
                      idValuesContainer.append('<input type="hidden" name="'
                            +opts.tagitOptions.fieldNameId
                            +'" value="'+tryGet.id+'" >');
                    }
                }
            }

        });

        pickerObj.idValuesContainer = idValuesContainer;

        pickerObj.modalSelector = modalSelector;
		pickerObj.modalBody = modalBody;
        pickerObj.btnOpen = btnOpen;
		pickerObj.treeControlContainer = treeControlContainer;
        pickerObj.treeControl = treeControl;
        pickerObj.tagitControl = tagitControl;
        pickerObj.errorMessageContainer = errorMessageContainer;

        pickerObj.opts = $.extend({}, opts);

        pickerObj.btnClearAll = pickerObj.modalSelector.children(".modal-dialog").children(".modal-content")
                                .children(".modal-footer").children(".btnTreeNodePickerClearAll");


        pickerObj.btnOK = pickerObj.modalSelector.children(".modal-dialog").children(".modal-content")
                                        .children(".modal-footer").children(".btnTreeNodePickerOK");
        pickerObj.btnCancel = pickerObj.modalSelector.children(".modal-dialog").children(".modal-content")
                                                .children(".modal-footer").children(".btnTreeNodePickerCancel");


        pickerObj.dialogTitle = pickerObj.modalSelector.children(".modal-dialog").children(".modal-content")
                                                .children(".modal-header").children(".modal-title");

        pickerObj.btnClearAll.text(pickerObj.opts.labels.buttons.btn_clear_all);
        pickerObj.btnOK.text(pickerObj.opts.labels.buttons.btn_ok);
        pickerObj.btnCancel.text(pickerObj.opts.labels.buttons.btn_cancel);
        pickerObj.btnCancel.text(pickerObj.opts.labels.buttons.btn_cancel);
        pickerObj.btnOpen.text(pickerObj.opts.labels.buttons.btn_open);
        pickerObj.dialogTitle.text(pickerObj.opts.labels.text.label_title);


        pickerObj.btnClearAll.click(function() {
             pickerObj.treeControl.jstree("deselect_all");
        });


        pickerObj.btnOK.click(function(){

            var selectedNodes = pickerObj.treeControl.jstree("get_selected");
            if (selectedNodes.length > pickerObj.opts.tagLimit) {
                return false;
            }
            pickerObj.tagitControl.tagit("removeAll");
            idValuesContainer.empty();

            for (x in selectedNodes) {
                var tryGet = __getSelectedNodeObj(pickerObj.opts.data, selectedNodes[x]);
                if (tryGet == null) {
                    continue;
                } else {
                  tagitControl.tagit('createTag', tryGet.text);
                  idValuesContainer.append('<input type="hidden" name="'
                        +pickerObj.opts.tagitOptions.fieldNameId
                        +'" value="'+tryGet.id+'" >');
                }
            }

            pickerObj.modalSelector.modal("toggle");
            pickerObj.opts.selectedNodes = selectedNodes;
        });

        pickerObj.btnOpen.click(function () {
            pickerObj.treeControl.jstree(true).deselect_all();

            for (x in pickerObj.opts.selectedNodes) {
                var tryGet = __getSelectedNodeObj(pickerObj.opts.data, pickerObj.opts.selectedNodes[x]);
                if (tryGet == null) {
                    continue;
                } else {
                    treeControl.jstree(true).select_node(tryGet.id);
                }
            }
            if (pickerObj.opts.expandAllNodes === true) {
               pickerObj.treeControl.jstree("open_all");
            } else {
               pickerObj.treeControl.jstree("close_all");
            }
        });

        pickerObj.treeControl.on("changed.jstree", function (e, data) {
            if (data.selected.length > pickerObj.opts.tagLimit) {
                pickerObj.errorMessageContainer.text(pickerObj.opts.errMessages.err_you_can_not_pick_more_than
                    + ' ' + pickerObj.opts.tagLimit + ' ' + pickerObj.opts.labels.text.label_node);
                pickerObj.errorMessageContainer.show();

				var treeMaxHeight = pickerObj.modalBody.innerHeight() -
						pickerObj.errorMessageContainer.outerHeight();
				pickerObj.treeControlContainer.css({"height": "75%"});
				pickerObj.errorMessageContainer.css({"height": "20%"});
            } else {
                pickerObj.errorMessageContainer.hide();
				pickerObj.treeControlContainer.css({"height": "99%"});
            }

        });

        if (pickerObj.opts.expandChildOnSingleClick === true) {
            pickerObj.treeControl.on("select_node.jstree", function (e, data) {
                if(data.node.state.opened == true) {
                    pickerObj.treeControl.jstree(true).close_node(data.node);
//                    node.state.opened = false;
               } else {
                    pickerObj.treeControl.jstree(true).open_node(data.node);
//                    node.state.opened = true;
               }
            });
            /* pickerObj.treeControl.on("click",function (e) {
              var li = $(e.target).closest("li");
              var node =  pickerObj.treeControl.jstree(true).get_node(li[0].id);

              console.log(node.state.opened);

               if(node.state.opened == true) {
                    pickerObj.treeControl.jstree(true).close_node(node);
                    node.state.opened = false;
               } else {
                    pickerObj.treeControl.jstree(true).open_node(node);
                    node.state.opened = true;
               }
            });*/
        }



        return pickerObj;

    }

    $.fn.jsTreeNodePicker.defaults = {
        "sizeCSS": {
            "min-height": "300px",
            "max-height": "300px",
            "height": "300px",
            "min-width": "600px",
            "max-width": "600px",
            "width": "600px",
        },
        "dialogId": "pickerDlg",
        "expandChildOnSingleClick": true,
        "tagLimit": 5,
        "expandAllNodes": true,
        "data": [],
        "selectedNodes": [],
        "removeTagItBorder": false,
        "tagitOptions": {
            "fieldName": "tagList",
            "allowSpaces": true,
            "showAutocompleteOnFocus": false,
            "readOnly": true
        },
        "jstreeOptions": {
            "checkbox" : {
                "keep_selected_style" : false,
                "three_state": false
            },
            "plugins" : [ "checkbox" ]
        },
        "labels": {
            "buttons": {
                "btn_ok": "OK",
                "btn_cancel": "Cancel",
                "btn_clear_all": "Clear All",
                "btn_open": "Click here to choose nodes"
            },
            "text": {
                "label_title": "Choose nodes",
                "label_node": "node"
            }

        },
        "errMessages": {
            "err_you_can_not_pick_more_than": "You cannot pick more than"
        }
    };

}( jQuery ));