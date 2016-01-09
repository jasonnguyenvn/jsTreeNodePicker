/**
 * PROJECT: jsTreeNodePicker
 * Version: 0.2
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


    $.fn.jsTreeNodePicker = function(options ) {

        var opts = $.extend( {}, $.fn.jsTreeNodePicker.defaults, options);
        var modalSelector;
        var btnOpen;
        var treeControl;
        var tagitControl;
        var errorMessageContainer;

        var pickerObj = this.each(function() {
            modalSelector = $("#"+opts.dialogId);

            // Append open picker dialog button
            var btnOpenContainer = $('<div id="btnOpen'+opts.dialogId+'_container" ></div>');
            $(this).append(btnOpenContainer);
            btnOpen = $('<button id="btnOpen'+opts.dialogId+'" type="button" class="btn btn-default" '
                + ' data-toggle="modal" data-target="#'+opts.dialogId+'"> </button>');

            btnOpenContainer.append(btnOpen);

            var modalBody = modalSelector.children(".modal-dialog").children(".modal-content").children(".modal-body");

            // Add place to show error message
            errorMessageContainer = $('<div id="'+opts.dialogId+'_error_container" class="alert alert-danger" style="display: none;"></div>');
            modalBody.append(errorMessageContainer);

            var treeControlId = opts.dialogId + "_treeControl";
            var treeControlContainer = $('<div id="'+ treeControlId +'_container" style="overflow"></div>');
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


            // Append tagit control
            var tagitControlContainer = $('<div id="tagit_control_container" class="row" style="padding-left: 28px;"></div>');
            $(this).append(tagitControlContainer);

            tagitControl = $('<ul id="tagit_control" class="col-md-8"></ul>');
            tagitControlContainer.append(tagitControl);
            tagitControl.tagit({
                fieldName: opts.tagitOptions.fieldName,
                allowSpaces: opts.tagitOptions.allowSpaces,
                tagLimit: opts.tagLimit,
                showAutocompleteOnFocus:  opts.tagitOptions.showAutocompleteOnFocus,
                readOnly: opts.tagitOptions.readOnly
            });

            if (opts.selectedNodes.length > 0) {
                tagitControl.tagit("removeAll");
                for (x in opts.selectedNodes) {
                    tagitControl.tagit('createTag', opts.selectedNodes[x]);

                }
            }

        });

        pickerObj.modalSelector = modalSelector;
        pickerObj.btnOpen = btnOpen;
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
            for (x in selectedNodes) {
                pickerObj.tagitControl.tagit('createTag', selectedNodes[x]);

            }

            $("#dlgPickCategories").modal("toggle");
            pickerObj.opts.selectedNodes = selectedNodes;
        });

        pickerObj.btnOpen.click(function () {
            pickerObj.treeControl.jstree(true).deselect_all();
            for (x in pickerObj.opts.selectedNodes) {
                treeControl.jstree(true).select_node(pickerObj.opts.selectedNodes[x]);
            }
        });

        pickerObj.treeControl.on("changed.jstree", function (e, data) {
            if (data.selected.length > pickerObj.opts.tagLimit) {
                pickerObj.errorMessageContainer.text(pickerObj.opts.errMessages.err_you_can_not_pick_more_than
                    + ' ' + pickerObj.opts.tagLimit + ' ' + pickerObj.opts.labels.text.label_node);
                pickerObj.errorMessageContainer.show();
            } else {
                pickerObj.errorMessageContainer.hide();
            }

        });



        return pickerObj;

    }

    $.fn.jsTreeNodePicker.defaults = {
        "dialogId": "pickerDlg",
        "tagLimit": 5,
        "expandAllNodes": true,
        "data": [],
        "selectedNodes": [],
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