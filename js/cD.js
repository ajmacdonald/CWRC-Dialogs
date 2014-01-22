
// Tree traversal
$(function(){
	cD = {};
	(function(){
		var cwrcApi = new CwrcApi('http://apps.testing.cwrc.ca/services/ccm-api/', $);
		
		// parameters

		var params = {};
		params.lang = "a:en";
		params.modalOptions = {
			show: false,
			keyboard: true,
			backdrop: false,
			maxHeight: 500,
		}
		var dialogType = "";

		///////////////////////////////////////////////////////////////////////
		// Helpers
		///////////////////////////////////////////////////////////////////////

		var last = function(array) {
			return array[array.length-1];
		};
		
		var initialize = function() {
			entity.initialize();
			search.initialize();
		};

		var setHelp = function() {
			$(".cwrc-help").tooltip({
				// trigger: "hover",
				placement: 'right',
				trigger: 'click',
				delay: { show: 100, hide: 100 },
			});
			// $('.dpYears').datepicker();

			$('.input-append.date').datepicker({
				format: "yyyy-mm-dd",
				startView: 2,
				autoclose: true
			});
		};


		///////////////////////////////////////////////////////////////////////
		// Entities
		///////////////////////////////////////////////////////////////////////

		// entity
		var entity = {};
		entity.viewModel = ko.observable({});
		entity.viewModel().interfaceFields = ko.observableArray([]);
		entity.viewModel().dialogTitle = ko.observable("");
		entity.viewModel().validated = ko.observable(true);
		entity.selfWorking = $.parseXML('<entity></entity>');
		entity.elementPath = []
		entity.person = {};
		entity.person.schemaUrl = "./schemas/entitySchema.xml";
		entity.person.schema = "";
		entity.person.success = null;
		entity.organization = {};
		entity.organization.schemaUrl = "./schemas/entitySchema.xml";
		entity.organization.schema = "";
		entity.organization.success = null;
		

		// XXX Add namespace

		entity.initialize = function() {
			$.ajax({
				type: "GET",
				async: false,
				url: entity.person.schemaUrl,
				dataType: "xml",
				success: function(xml) {
					entity.person.schema = xml;
					entity.organization.schema = xml;
				}
			});

			var entityTemplates = '' +
			'		<script type="text/html" id="quantifier">' +
			'			<div class="quantifier">' +
			'			<div>' +
			'				<span data-bind="text: label"></span>' +
			'				<span  data-bind="if: isGrowable()">' +
			'					<span data-bind="if: showAddButton()">' +
			'						<button data-bind="click: addGroup" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-plus"</span></button>' +
			'					</span>' +
			'					<!--' +
			'					<span data-bind="if: showDelButton()">' +
			'						<button data-bind="click: delGroup" class="btn btn-default btn-xs">-</button>' +
			'					</span>' +
			'					-->' +
			'				</span>' +
			'			</div>' +
			'			<div data-bind="if: isInterleave()">' +
			'				<!--isInterleave-->' +
			'			</div>' +
			'			<div data-bind="if: isOptional()">' +
			'				<!--isOptional-->' +
			'			</div>' +
			'			<div data-bind="if: isOneOrMore()">' +
			'				<!--isOneOrMore-->' +
			'			</div>' +
			'			<div data-bind="if: isZeroOrMore()">' +
			'				<!--isZeroOrMore-->' +
			'			</div>' +
			'			' +
			'			<div class="interfaceFieldsContainer" data-bind="template:{name: $root.displayMode, foreach: interfaceFields}"> ' +
			'			</div>' +
			'			</div>' +
			'		</script>' +
			'		<script type="text/html" id="seed">' +
			'			<!--seed-->' +
			'			<div>' +
			'				<span data-bind="template:{name: $root.displayMode, foreach: interfaceFields}"></span>' +
			'				<span data-bind="if: $parent.showRemoveThisButton()">' +
			'					<button data-bind="click: $parent.removeThisGroup" class="btn btn-default btn-xs">' +
			'						<span class="glyphicon glyphicon-minus"></span>' +
			'					</button>' +
			'				</span>' +
			'			</div>' +
			'		</script>' +
			'		<script type="text/html" id="textField">' +
			'			<!--textField-->' +
			'			<span>' +
			'				<span data-bind="text: label"></span> ' +
			'				<input data-bind="value: value" /> ' +
			'				<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'				<div class="label" data-bind="text:nodeMessage, attr:{class: nodeMessageClass}"></div>' +
			'' +
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="datePicker">' +
			'			<!-- datePicker -->' +
			'			<span>' +
			'				<span data-bind="text: label"></span> ' +
			'				<div class="input-append date">' +
			'					<input placeholder="YYYY-MM-DD" type="text" class="span2" data-bind="value: value">' +
			'					<button class=" add-on btn btn-default btn-xs"><span class="glyphicon glyphicon-calendar"></span></button>' +
			'					<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'				</div>' +
			'				<div class="label" data-bind="text:nodeMessage, attr:{class: nodeMessageClass}"></div>' +
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="dialogue">' +
			'			<!--dialogue-->' +
			'			<span>' +
			'				<span class="cwrc-help" data-bind="text: label, attr:{\'title\': help}"></span> ' +
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="textArea">' +
			'			<!--textArea-->' +
			'			<span>' +
			'				<span data-bind="text: label"></span> ' +
			'				<textarea rows="4" cols="50" data-bind="value: value"></textarea> ' +
			'				<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'				<div class="label" data-bind="text:nodeMessage, attr:{class: nodeMessageClass}"></div>' +
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="radioButton">' +
			'			<span>' +
			'				<span data-bind="text: label"></span>' +
			'				<ul data-bind="foreach: options">' +
			'					<li>' +
			'						<input type="radio" data-bind="attr: { value: value, name : $parent.path }, checked: $parent.value"> ' +
			'						<span data-bind="text:content"></span> ' +
			'					</li>' +
			'				</ul>' +
			'				<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="dynamicCheckbox">' +
			'			<span>' +
			'				<span data-bind="text: label"></span>' +
			'				<ul data-bind="foreach: options">' +
			'					<li>' +
			'						<input type="checkbox" data-bind="attr: { value: value, name : $parent.path }, checked: $parent.value"> ' +
			'						<span data-bind="text:content"></span> ' +
			'					</li>' +
			'				</ul>' +
			'				<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'			</span>' +
			'		</script>' +
			'		<script type="text/html" id="dropDown">' +
			'			<select data-bind="value: value, options: options, optionsText: \'content\', optionsValue: \'value\'"></select>' +
			'				<span class="cwrc-help glyphicon glyphicon-question-sign" data-bind="attr:{\'title\': help}"></span>'+
			'		</script>';

			$('head').append(entityTemplates);
			$("#cwrcEntityModal").modal(params.modalOptions);
			$("#cwrcEntityModal").draggable({	
				handle: ".modal-header"
			});

			var newDialogTemplate = '' +
			'<div id="newDialogue" class="cwrcDialog" title="">' +
			'<div class="modal fade" id="cwrcEntityModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
			'	<div class="modal-dialog">' +
			'		<div class="modal-content">' +
			'			<div class="modal-header">' +
			'				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
			'				<h4 class="modal-title"><span data-bind="text: dialogTitle"></span></h4>' +
			'			</div>' +
			'			<div class="modal-body modal-body-area">' +
			'				<div data-bind="template: { name: displayMode , foreach: interfaceFields }">'+
			'				</div>' +
			'			</div>' +
			'			<div class="modal-footer">' +
			'				<div class="label label-danger" data-bind="ifnot: validated"> Form is not valid</div>' +
			'				<button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>' +
			'				<button type="button" class="btn btn-primary" onclick="cD.processCallback();">Ok</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>' +
			'</div>';

			$('body').append(newDialogTemplate);
			ko.applyBindings(entity.viewModel, $("#newDialogue")[0]);

		}

		var initializeQuantifiers = function() {
			entity[dialogType].nodeStack = [];
			entity[dialogType].workingContainers = [];
			entity[dialogType].shouldValidate = [];
			entity.viewModel().interfaceFields([]);
			var startingInterleave = interleaveModel();
			entity.viewModel().interfaceFields.push(startingInterleave);
			entity[dialogType].workingContainers.push(startingInterleave);
			entity.viewModel().validated(true);
		};

		var completeDialog = function(opts) {
			entity[dialogType].success = typeof opts.success === undefined ? function(){} : opts.success;
			entity[dialogType].error = typeof opts.error === undefined ? function(){} : opts.error;
			newDialog();
			setHelp();
		};

		var newDialog = function() {
			initializeQuantifiers();
			var interfaceOrder = $(entity['person'].schema).find('interface-order[type='+dialogType+']');
			entity.elementPath = $(interfaceOrder).attr('path').split('/');
			interfaceOrder.children('ref').each(function(){
				var defName = $(this).attr("name");
				$(entity[dialogType].schema).find('define[name='+defName+']')
					.children().each(function(i,child) {
						visit(child);
					});
			});
			// var root = entity[dialogType].workingContainers.last();
			var root = entity[dialogType].workingContainers[0];
			root.interfaceFields.push(root.seed);
			entity.viewModel().interfaceFields(entity[dialogType].workingContainers[0]); // startingIterfaceField
			
		};

		var visit = function(node) {
			if (node.nodeType === 1) { // ELEMENT_NODE
				entity[dialogType].nodeStack.push(node);
				// working with node
				processNode(node);
				entity[dialogType].nodeStack.pop();
			}
		};

		var processNode = function(node) {
			var nodeName = node.nodeName.toLowerCase();
			var visitChildren = true;
			switch(nodeName) {
				case 'element':
					processElement(node);
					break;
				// case 'attribute':
				// 	processAttribute(node);
				// 	break;
				case 'ref':
					processRef(node);
					break;
				case 'xs:annotation':
					processXSAnnotation(node);
					visitChildren = false;
					break;
				case 'choice':
					visitChildren = false;
					break;
				case 'oneormore':
				case 'zeroormore':
				case 'optional':
				case "interleave":
					processQuantifier(node);
					break;
			}
			if (visitChildren) {
				// visit all children
				$(node).children().each(function(i,child){
					visit(child);
				});
			}
			// post process
			switch(nodeName) {
				case 'element':
					postprocessElement(node);
					break;
				// case 'attribute':
				// 	postProcessAttribute(node);
				// 	break;
				case 'oneormore':
				case 'zeroormore':
				case 'optional':
				// case 'interleave':
					postprocessQuantifier();
					break;
				case 'interleave':
					postProcessInterleave();
					break;
			}
		};

		var processElement = function(node){
			entity.elementPath.push($(node).attr('name'));
		};

		var postprocessElement = function(node){
			entity.elementPath.pop();
		};

		// var processAttribute = function(node) {
		// 	// entity.elementPath.push("@test");
		// };

		// var postProcessAttribute = function(node) {
		// 	// entity.elementPath.pop();
		// };

		var processRef = function(node){
			var defName = $(node).attr('name');
			var defNode = $(entity[dialogType].schema).find('define[name='+defName+']')[0];
			visit(defNode);
		};

		var isSamePath = function(currentPath) {
			// var workingPath = currentPath;
			// XXX TESTING
			var len = currentPath.length;
			if (currentPath[len-1].indexOf('@') != -1) {
				// workingPath.pop();
				len = len - 1;
			}
			if (len != entity.elementPath.length) {
				return false;
			}
			for (var i=0; i<len; ++i) {
				var orPaths = currentPath[i].split('|');
				var same = false;
				for (var j=0; j< orPaths.length; ++j) {
					if (entity.elementPath[i] == orPaths[j]) {
						same = true;
						break;
					}
				}
				if (!same) return false;
			}
			return true;
		};

		var setQuantifierLabel = function(label) {
			var lastContainer = last(entity[dialogType].workingContainers);
			lastContainer.label = label;
		};

		var addOptions = function(newInput, appInfo) {
			var type = dialogType,
				lang = params.lang;


			var values = $(appInfo).children('values[type='+ type +']')[0];
			
			if (!values) {
				values = $(appInfo).children('values')[0];
			}
			
			if (values) {

				var valuesURL = $(values).attr('url');
				if (valuesURL) {
					addRemoteOptions(newInput, valuesURL);
				}

				$(values).find('value').each(function(i,e){
					newInput.options.push({
						'content': $(e).attr(lang),
						'value': $(e).text()
					});
				});
			}
		};

		var addRemoteOptions = function(newInput, url) {
			var lang = params.lang;
			$.ajax({
				url: url,
				async: false,
				dataType: "json"
			}).done(function(data){
				$.each(data, function(i, option){
					newInput.options.push({
						'content': option['content'][lang],
						'value': option['value']
					});
				});
			});
		};

		var processXSAnnotation = function(node){
			// ADD WIDGET HERE
			var appInfoNode = $(node).children("xs\\:appinfo");
			// check all children for path XXX
			$(appInfoNode).children("interface-field").each(function(i,e){
				var currentPath = $(e).attr('path').split('/');
				if (isSamePath(currentPath)) {
					// if same path XXX
					// check what widget to add XXX
					var newInput;
					var inputType = "";
					if ($(e).children('input').first().text() !== '') {
						inputType = $(e).children('input').first().text();
					}
					switch(inputType) {
						case "textField" :
							newInput = textInputModel();
							break;
						case "textArea" :
							newInput = textAreaModel();
							break;
						case "radioButton" :
							newInput = radioButtonModel();
							//XXX Get Options
							addOptions(newInput, appInfoNode);
							// new entry
							newInput.defaultValue = true;
							newInput.value(newInput.options[0].value);
							break;
						case "dynamicCheckbox" :
							newInput = dynamicCheckboxModel();
							//XXX Get Options
							addOptions(newInput, appInfoNode);
							break;
						case "dropDown" :
						case "slider" : //XXX Implement
						case "combobox" : //XXX Implement
							newInput = dropDownModel();
							addOptions(newInput, appInfoNode);
							break;
						case "dialogue" :
							newInput = dialogueInputModel();
							break;
						case "datePicker" :
							newInput = datePickerInputModel();
							break;
						case "" : // Label
							var quantifierLabel = $(e).children('label').first().text();
							setQuantifierLabel(quantifierLabel);
							break;
						default:
						newInput = textInputModel();
					}
					if (newInput) {
						newInput.path = entity.elementPath + "";
						// check if it should be stored as an attribute
						var parent = $(node).parent()[0];
						if (parent.nodeName == 'attribute') {
							newInput.attributeName = $(parent).attr('name') + "";
						}
						newInput.label = $(e).children('label').first().text();
						newInput.help = $(e).children('help-text').first().text();
						var lastContainer = last(entity[dialogType].workingContainers);
						if (lastContainer.isInterleave()) {
							// lastContainer.interfaceFields.push(newInput);
							lastContainer.seed.interfaceFields.push(newInput);
						} else {
							if (lastContainer.isOneOrMore()) {
								newInput.nodeMessage("Required value");
							}
							lastContainer.seed.interfaceFields.push(newInput);
						}
					}
				}
			});
		};

		var processQuantifier = function(node){
			
			var newQuantifier;
			var nodeName = node.nodeName.toLowerCase();
			switch(nodeName) {
				case "oneormore":
					newQuantifier = oneOrMoreModel();
				break;
				case "zeroormore":
					newQuantifier = zeroOrMoreModel();
				break;
				case "optional":
					newQuantifier = optionalModel();
				break;
				case "interleave":
					newQuantifier = interleaveModel();
				break;
			}
			// add to latestWorking quantifier
			last(entity[dialogType].workingContainers).seed.interfaceFields.push(newQuantifier);
			// add to quantifier list
			entity[dialogType].workingContainers.push(newQuantifier);
		};

		var isInterfaceIsPresent= function(item) {
			switch(item.input) {
				case 'textField':
				case 'textArea':
				case 'dropDown':
				case 'dynamicCheckbox':
				case 'radioButton':
				case 'combobox':
				case 'slider':
				case 'dialogue':
				case 'datePicker':
				case '':
					return true;
			}
			return false;
		};

		var postProcessInterleave = function(node) {
			var lastContainer = last(entity[dialogType].workingContainers);

			if (lastContainer.seed.interfaceFields().length >= 1) {
				lastContainer.hasInterface = true;

				$.each(lastContainer.seed.interfaceFields(), function(index, item){
					var path = item.path;
					if (item.attributeName !== "") {
						path += "," + item.attributeName;
					}
					lastContainer.elements.push(path);
				});
			}

			if (lastContainer.hasInterface) {
				lastContainer.interfaceFields.push(lastContainer.seed.clone());
				entity[dialogType].workingContainers.pop();
				
			} else {
				entity[dialogType].workingContainers.pop();
				var parent = last(entity[dialogType].workingContainers);
				parent.seed.interfaceFields.remove(lastContainer);
			}
		};

		var postprocessQuantifier = function(node){
			var lastContainer = last(entity[dialogType].workingContainers);
			
			$.each(lastContainer.seed.interfaceFields(), function(index, item){
		
				if (isInterfaceIsPresent(item)) {
					lastContainer.hasInterface = true;
					
					var path = item.path;
					if (item.attributeName !== "") {
						path += "," + item.attributeName;
					}
				
					lastContainer.elements.push(path);
					
				}
			});

			if (lastContainer.hasInterface) {

				lastContainer.label = lastContainer.seed.interfaceFields()[0].label;
				lastContainer.seed.interfaceFields()[0].label = "";
				
				if (lastContainer.minItems == 1) {
					lastContainer.interfaceFields.push(lastContainer.seed.clone());
				}
				entity[dialogType].workingContainers.pop();
			} else {
				entity[dialogType].workingContainers.pop();
				var parent = last(entity[dialogType].workingContainers);
				moveInterfaceElements(lastContainer , parent);
			}	
		};

		var moveInterfaceElements = function(from, to) {
			$.each(from.seed.interfaceFields(), function(index, item){
				// if (item.hasInterface) {
				to.seed.interfaceFields.push(item);
				// }
			});
			// XXX Needed ?
			if (to.label === "") {
				to.label = from.label;
			}
			to.seed.interfaceFields.remove(from);
		};

		var visitStringifyResult = function(node) {
			if (node.input == "quantifier" || node.input == "seed") {
				if (node.input == "quantifier") {
					var minItems = node.minItems;
					var maxItems = node.maxItems;
					if (node.isOneOrMore()) {
						entity[dialogType].shouldValidate.push(true);
					} else {
						entity[dialogType].shouldValidate.push(false);
					}
				}
				$.each(node.interfaceFields(), function(index, node) {
					visitStringifyResult(node);
				});
				if (node.input == "quantifier") {
					entity[dialogType].shouldValidate.pop();
				}
			} else if (node.input != "label") {
				// CREATE NODE
				var validate = last(entity[dialogType].shouldValidate);
				if (validate && $.trim(node.value()) === ""){
					// node.nodeMessage("Required value");
					node.nodeMessageClass("label label-danger");
					entity.viewModel().validated(false);
				} else {
					// node.nodeMessage("");
					node.nodeMessageClass("label label-info");
				}
				createNode(node);
			}
		};

		var createNode = function(node) {
			var pathString = node.path,
				fullPath = pathString.split(","),
				maxDepth = fullPath.length,
				path,
				thisPathString,
				selectior,
				newElement;
				
			if (node.attributeName !== "") {
				--maxDepth;
			}
			
			for (var i=0; i< maxDepth; i++) {
				path = pathString.split(',');
				thisPathString = path.splice(0, i+1) + "";
				selector = thisPathString.replace(/,/g, " > ");
				var entry = $(entity.selfWorking).find(selector);
				// entry if not found (needs to create it) or if at maxDepth
				if (entry.size() === 0 || i === fullPath.length - 1) {
					path = pathString.split(',');
					thisPathString = path.splice(0, i) + "";
					selector = thisPathString.replace(/,/g, " > ");
					newElement = entity.selfWorking.createElement(fullPath[i]);
					$(entity.selfWorking).find(selector).append(newElement);
				}
			}
			// set value
			if(node.attributeName !== "") {
				// set attribute value
				thisPathString = path.splice(0, i) + "";
				selector = thisPathString.replace(/,/g, " > ");
				$(entity.selfWorking).find(selector).attr(node.attributeName, node.value());
			} else {
				// set text value
				var newText = entity.selfWorking.createTextNode(node.value());
				$(newElement).append(newText);
			}
		};

		var addRecordInfo = function(xml) {
			var accessConditionText = 'Use of this public-domain resource is governed by the <a href="http://creativecommons.org/licenses/by-nc/3.0/" rel="license">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.';
			
			var recordInfo = entity.selfWorking.createElement("recordInfo");
			var accessCondition = entity.selfWorking.createElement("accessCondition");
			accessCondition.setAttribute("type", "use and reproduction");
			var originInfo = entity.selfWorking.createElement("originInfo");
			var recordCreationDate = entity.selfWorking.createElement("recordCreationDate");
			var type = entity.selfWorking.createElement(dialogType);
			var selector = "entity";
			$(xml).find(selector).append(type);

			selector = "entity > " + dialogType;
			$(xml).find(selector).append(recordInfo);
			selector = "entity > " + dialogType + " > recordInfo";
			// var selector = "entity > ";
			
			// accessCondition.attr("type", "use and reproduction");
			var newText = entity.selfWorking.createTextNode(accessConditionText);
			$(xml).find(selector).append(accessCondition);
			$(accessCondition).append(newText);

			$(xml).find(selector).append(originInfo);
			selector = "entity > " + dialogType + " > recordInfo > originInfo";
			var todayText = entity.viewModel().paddedToday();
			$(recordCreationDate).append(todayText);
			$(xml).find(selector).append(recordCreationDate);
			
		};

		var getWorkingXML = function() {
			var startingXML = '<?xml version="1.0" encoding="UTF-8"?>';

			switch (dialogType) {
				case 'person' :
					startingXML += '<?xml-model href="http://cwrc.ca/schema/person.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>';
					break;
				case 'organization' :
					startingXML += '<?xml-model href="http://cwrc.ca/schema/organization.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>';
					break;
				case 'place' :
					startingXML += '<?xml-model href="http://cwrc.ca/schema/place.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>';
					break;
				case 'title' :
					startingXML += '<mods xmlns="http://www.loc.gov/mods/v3">';
					break;
			}

			entity.selfWorking = $.parseXML(startingXML + '<entity></entity>');
			addRecordInfo(entity.selfWorking);
			visitStringifyResult(entity[dialogType].workingContainers[0]);
			var result = xmlToString(entity.selfWorking);
			return result;
		};

		cD.processCallback = function() {
			entity.viewModel().validated(true);
			var xml = getWorkingXML();
			if (entity.viewModel().validated()) {
				var response = cwrcApi[dialogType].newEntity(xml);
				var result = {
					response : response,
					data : xml
				};

				entity[dialogType].success(result);
				$('#cwrcEntityModal').modal('hide');
				
			} else {
				entity[dialogType].error("Form not valid");
			}
		};

		var xmlToString = function(xmlData) {
			var xmlString;
			if (window.ActiveXObject){ // IE
				xmlString = xmlData.xml;
			} else{ // code for Mozilla, Firefox, Opera, etc.
				xmlString = (new XMLSerializer()).serializeToString(xmlData);
			}
			return xmlString;
		};

		// models

		entity.viewModel().displayMode = function(field) {
			return field.input;
		};

		/*
		entity.viewModel().today = function() {
			var date = new Date();
			return date.getFullYear() +"-"+ date.getMonth() + "-" + date.getDay();
		};
		*/
		entity.viewModel().paddedToday = function() {
			var date = new Date();
			var pad = "00";
			var month = "" + date.getMonth() + 1;
			var day = "" + date.getDate();
			month = pad.substring(0, pad.length - month.length) + month;
			day = pad.substring(0, pad.length - day.length) + day;
			return date.getFullYear() +"-"+ month + "-" + day;
		};

		///////////////////////////////////////////////////////////////////////
		// Entity models
		///////////////////////////////////////////////////////////////////////

		var quantifierModel = function() {
			// var self = this;
			var that = {};
			that.input = "quantifier";
			that.elements = [];
			that.label = "";
			that.minItems = 0;
			that.maxItems = Number.MAX_VALUE; // infinity;
			that.interfaceFields = ko.observableArray();
			that.seed = seedModel();
			// 1 1 Interleave
			// 0 1 Optional
			// 1 INF One or more
			// 0 INF Zero or more
			that.isGrowable = function() {
				if (that.minItems == 1 && that.maxItems == 1) {
					return false;
				}
				return true;
			};

			that.showAddButton = function() {
				if (that.interfaceFields().length < that.maxItems) {
					return true;
				}
				return false;
			};

			that.showDelButton = function() {
				if (that.interfaceFields().length > that.minItems) {
					return true;
				}
				return false;
			};
			
			that.showRemoveThisButton = function() {
				if (that.interfaceFields().length > that.minItems) {
					return true;
				}
				return false;
			};
			
			that.addGroup = function() {
				if (that.interfaceFields().length < that.maxItems) {
					// that.interfaceFields.push(that.seed.clone());	//XXX SEED
					var newClone = that.seed.clone();
					newClone.interfaceFields()[0].label = "";
					that.interfaceFields.push(newClone);
					setHelp();
				}
			};
			
			that.delGroup = function() {
				if (that.interfaceFields().length > that.minItems) {
					that.interfaceFields.pop();
				}
			};
			
			that.removeThisGroup = function(group) {
				if (that.interfaceFields().length > that.minItems) {
					that.interfaceFields.remove(group);
				}
			};
			
			that.isInterleave = function() {
				if (that.minItems === 1 && that.maxItems === 1) {
					return true;
				}
				return false;
			};
			
			that.isOptional = function() {
				if (that.minItems === 0 && that.maxItems === 1) {
					return true;
				}
				return false;
			};
			
			that.isOneOrMore = function() {
				if (that.minItems === 1 && that.maxItems === Number.MAX_VALUE) {
					return true;
				}
				return false;
			};
			
			that.isZeroOrMore = function() {
				if (that.minItems === 0 && that.maxItems === Number.MAX_VALUE) {
					return true;
				}
				return false;
			};
			
			that.isRequired = function() {
				return that.isOneOrMore() || that.isInterleave();
			};
			
			that.clone = function() {
				var result = quantifierModel();
				result.minItems = this.minItems;
				result.maxItems = this.maxItems;
				result.seed = this.seed.clone();
				result.label = this.label;
				result.elements = this.elements;
				// take label
				// result.label = result.seed.interfaceFields()[0].label;
				if (result.minItems === 1) {
					//XXX clone to interfaceFields
					result.interfaceFields.push(this.seed.clone());
					// _.last(result.interfaceFields()).interfaceFields()[0].label="";
				}
				// result.seed.interfaceFields()[0].label = "";
				return result;
			};

			return that;
		};

		var interleaveModel = function() {
			var that = quantifierModel();
			that.minItems = 1;
			that.maxItems = 1;
			return that;
		};

		var optionalModel = function() {
			var that = quantifierModel();
			that.minItems = 0;
			that.maxItems = 1;
			return that;
		};

		var zeroOrMoreModel = function() {
			var that = quantifierModel();
			that.minItems = 0;
			that.maxItems = Number.MAX_VALUE;
			return that;
		};

		var oneOrMoreModel = function() {
			var that = quantifierModel();
			that.minItems = 1;
			that.maxItems = Number.MAX_VALUE;
			return that;
		};

		var seedModel = function() {
			var that = {};
			that.input = "seed";
			that.interfaceFields = ko.observableArray();
			that.clone = function() {
				var result = seedModel();
				$.each(that.interfaceFields(), function(index, field){
					result.interfaceFields.push(field.clone());
				});
				return result;
			};
			return that;
		};

		var inputModel = function() {
			var that = {};
			that.input = "";
			that.path = "";
			that.label = "";
			that.help = "";
			that.attributeName = "";
			that.value = ko.observable("");
			that.defaultValue = false;
			that.constructor = inputModel;
			that.nodeMessage = ko.observable("");
			that.nodeMessageClass = ko.observable("label label-info");
			that.options = [];
			that.clone = function() {
				var result = that.constructor();
				result.label = that.label;
				result.path = that.path;
				result.help = that.help;
				result.attributeName = that.attributeName;
				result.options = that.options;
				result.defaultValue = that.defaultValue;
				result.nodeMessage = ko.observable(that.nodeMessage());
				result.nodeMessageClass = ko.observable(that.nodeMessageClass());
				if (result.defaultValue) {
					result.value(that.value());
				}
				return result;
			};
			return that;
		};

		var textInputModel = function() {
			var that = inputModel();
			that.input = "textField";
			that.constructor = textInputModel;
			that.value= ko.observable();
			return that;
		};
		
		var datePickerInputModel = function() {
			var that = inputModel();
			that.input = "datePicker";
			that.constructor = datePickerInputModel;
			return that;
		};
		
		var dialogueInputModel = function() {
			var that = inputModel();
			that.input = "dialogue";
			that.constructor = dialogueInputModel;
			return that;
		};

		var textAreaModel = function() {
			var that = inputModel();
			that.input = "textArea";
			that.constructor = textAreaModel;
			return that;
		};

		var radioButtonModel = function() {
			var that = inputModel();
			that.input = "radioButton";
			that.constructor = radioButtonModel;
			return that;
		};

		var dynamicCheckboxModel = function() {
			var that = inputModel();
			that.input = "dynamicCheckbox";
			that.value = ko.observableArray();
			that.constructor = dynamicCheckboxModel;
			return that;
		};

		var dropDownModel = function() {
			var that = inputModel();
			that.input = "dropDown";
			that.constructor = dropDownModel;
			return that;
		};

		///////////////////////////////////////////////////////////////////////
		// cD entity interface
		///////////////////////////////////////////////////////////////////////

		var initializeWithCookie = function(name){
			cwrcApi.initializeWithCookie(name);
		};

		cD.initializeWithCookie = initializeWithCookie;

		var initializeWithLogin = function(username, password) {
			cwrcApi.initializeWithLogin(username, password);
		};

		cD.initializeWithLogin = initializeWithLogin;

		var popCreatePerson = function(opts) {
			dialogType = "person";
			entity.viewModel().dialogTitle("Add Person");
			completeDialog(opts);
			$('#cwrcEntityModal').modal('show');
			// hackish
			setTimeout(function(){
				$(".modal-body-area").scrollTop(0);
			},5);
		};

		cD.popCreatePerson = popCreatePerson;

		var popCreateOrganization = function(opts) {
			dialogType = "organization";
			entity.viewModel().dialogTitle("Add Organization");
			completeDialog(opts);
			$('#cwrcEntityModal').modal('show');
			// hackish
			setTimeout(function(){
				$(".modal-body-area").scrollTop(0);
			},5);
			
		};

		cD.popCreateOrganization = popCreateOrganization;

		var popCreate = {
			person: popCreatePerson,
			organization : popCreateOrganization,
		};

		cD.popCreate = popCreate;
		
		///////////////////////////////////////////////////////////////////////
		// Search
		///////////////////////////////////////////////////////////////////////
		
		// search
		var search = {};
		search.buttons = ko.observableArray([]);
		search.infoTitle = ko.observable("");
		search.infoConte = ko.observable("");
		
		search.getLinkedDataSource = function(specs) {


			var that = {
				results : ko.observableArray([]),
				ajaxRequest : null,
				name : specs.name === null ? "" : specs.name,
				processSearch : specs.processSearch === null ? function(queryString){} : specs.processSearch
			}

			return that;
		}

		search.processCWRCSearch = function(queryString) {
			
			/*
			search.processData = cwrcApi[dialogType].getEntity;
			var result = cwrcApi[dialogType].searchEntity(queryString);

			$.each(result["response"]["objects"], function(i, doc){
				search.linkedDataSources.cwrc.results.push(search.getResultFromCWRC(doc));
			});
			*/

			search.linkedDataSources.cwrc.ajaxRequest = cwrcApi[dialogType].searchEntity({
				query : queryString,
				success : function(result){
					$.each(result["response"]["objects"], function(i, doc){
						search.linkedDataSources.cwrc.results.push(search.getResultFromCWRC(doc));
					});
				},
				error: function(result) {
					console.log(result);
				},
			});

		}

		search.processViafData = function(id) {
			// http://www.viaf.org/viaf/306236550/viaf.xml
			var url = "http://apps.testing.cwrc.ca/services/viaf/" + id + "/viaf.xml";
			var result = "";
			$.ajax({
				url: url,
				dataType: "text",
				async : false,
				success : function(response) {
					result = response;
				},
				error: function() {
					alert("error");
				}
			});
			
			return result;
		}

		search.processVIAFSearch = function(queryString) {
			search.processData = search.processViafData;
			var viafUrl = "http://apps.testing.cwrc.ca/services/viaf/search";
			var viafPrefix = "";

			switch (dialogType) {
				case "person" :
				viafPrefix = "local.personalNames+all+";
				break;
				case "organization": // XXX
				break
			}

			search.linkedDataSources.viaf.ajaxRequest = $.ajax({
				url: viafUrl,
				// dataType : 'json',
				dataType : "xml",
				// data : {
				// 	query : viafPrefix + queryString,
				// 	httpAccept : 'text/xml'
				// },
				processData : false,
				data : "query=" + viafPrefix + queryString + "&httpAccept=text/xml",
				success: function(response) {
					$('searchRetrieveResponse record', response).each(function(index, spec) {
						search.linkedDataSources.viaf.results.push(search.getResultFromVIAF(spec, index));
					});
				},
				error : function(xhr, ajaxOptions, thrownError) {
					if (ajaxOptions != "abort") {
						console.log("Error " + ajaxOptions);	
					}					
				}
			});
		}

		search.linkedDataSources = {
			cwrc: search.getLinkedDataSource({name:"CWRC", processSearch: search.processCWRCSearch}),
			viaf: search.getLinkedDataSource({name:"VIAF", processSearch: search.processVIAFSearch})
		}

		search.selectedLinkedDataSource = "cwrc";
		search.queryString = ko.observable("");

		search.getLinkedDataSourceTemplates = function() {
			var result = "";
			var index = 0;
			for (var key in search.linkedDataSources) {
				var lds = search.linkedDataSources[key];
				result +=
				'										<div class="panel panel-default">' +
				'											<div data-name="'+key+'" class="panel-heading panel-title" data-toggle="collapse" data-parent="#accordion" href="#collapse'+key+'" data-bind="{click:$root.selectLinkedDataSource}">' +
				'														' + lds.name +
				'											</div>' +
				'											<div id="collapse'+key+'"" class="panel-collapse collapse '+(function(){return index ===0 ? "in" : ""})()+'">' +
				'												<div class="panel-body">' +
				// content
				'									<div class="list-group cwrc-result-area">' +
				'										<!-- ko foreach: linkedDataSources.'+key+'.results -->' +
				'										<a href="#" class="list-group-item" data-bind="{click:$root.selectResult, event: { dblclick: $root.returnAndHide }, css: {active: selected}}" >' +
				'											<h5 class="list-group-item-heading">' +
				'												<span data-bind="text: name"></span>' +
				'												<span class="cwrc-entity-info pull-right glyphicon glyphicon-info-sign" data-bind="click: $root.showInfoPopOver" data-content="Test content" data-original-title="Test title"></span>' +
				'											</h5>' +
				// '											<h5 class="list-group-item-heading"> <span data-bind="text:data[\'dc.title\']"></span> - <span data-bind="text:source"></span></h5>' +
				// '											<p class="list-group-item-text"><span data-bind="text:data.id"></span></p>' +
				'										</a>' +
				'										<!-- /ko -->' +
				'									</div>' +
				// end of content
				'												</div>' +
				'											</div>' +
				'										</div>';
				// alert(lds.name);
				++index;
			}


			return result;
		}


		search.initialize = function() {

			var queryResultsTemplate = '' +
			'<script type="text/html" id="queryResults">' +
			'										<div class="panel panel-default">' +
			'											<div data-name="NAME VARIABLE" class="panel-heading panel-title" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" data-bind="{click:$root.selectLinkedDataSource}">' +
			'														NAME VARIABLE' +
			'											</div>' +
			'											<div id="collapseOne" class="panel-collapse collapse in">' +
			'												<div class="panel-body">' +
			// content
			'									<div class="list-group cwrc-result-area">' +
			// '										<!-- ko foreach: results.cwrc -->' +
			// '										<a href="#" class="list-group-item" data-bind="{click:$root.selectResult, css: {active: selected}}" >' +
			// '											<h5 class="list-group-item-heading"> <span data-bind="text:data[\'dc.title\']"></span> - <span data-bind="text:source"></span></h5>' +
			// '											<p class="list-group-item-text"><span data-bind="text:data.id"></span></p>' +
			// '										</a>' +
			// '										<!-- /ko -->' +
			'									</div>' +
			// end of content
			'												</div>' +
			'											</div>' +
			'										</div>' +
			'</script>';

			// $('head').append(queryResultsTemplate);

			var searchTemplates = '' +
			'<div id="cDSearch">' +
			'	<div class="modal fade" id="cwrcSearchDialog">' +
			'		<div class="modal-dialog">' +
			'			<div class="modal-content">' +
			'				<div class="modal-header">' +
			'					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
			'					<h4 class="modal-title"><span>Title</span></h4>' +
			'				</div>' +
			'				<div class="modal-body">' +
			'					<!-- Content -->' +
			'					<div class="row">' +
			'						<div class="col-lg-12">' +
			'								<input type="text" class="form-control" id="searchEntityInput" placeholder="Search" data-bind="{value:queryString, onKeyUp: delayedSearchEntity}">' +
			'						</div><!-- /.col-lg-6 -->' +
			'					</div><!-- /.row -->' +
			'					<br> <!-- FIXME -->' +
			'					<div class="row">' +
			'						<!-- Results -->' +
			'						<div class="col-lg-12">' +
			'							<div class="panel">' +
			// '								<div class="panel-heading">Results</div>' +
			'								<div class="panel-body">' +
//		
			'									<div class="panel-group" id="accordion">' +
														search.getLinkedDataSourceTemplates() +
			// '										<!-- ko foreach: linkedDataSources -->' +
			// '										+<div data-bind="template: { name: \'queryResults\', data: $data }"></div>' +
			// '										<!-- /ko -->' +
			'									</div>' +
//			

			'								</div>' +
			'							</div>' +
			'						</div>' +
			'					</div>' +
			'					<!--  End of content-->' +
			'				</div>' +
			'				<div class="modal-footer">' +
			'					<button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>' +
			'					<!-- ko foreach: buttons -->' +
			'					<button type="button" class="btn btn-default" data-dismiss="modal" data-bind="text:label, click: action"></button>' +
			'					<!-- /ko -->' +
			// '					<button type="button" class="btn btn-default" data-bind="click: createEntity">Add New</button>' +
			'					<button type="button" class="btn btn-primary" data-dismiss="modal" data-bind="click: returnSelected">Select</button>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
			
			$('body').append(searchTemplates);



			

			ko.bindingHandlers.onKeyUp = {
				init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
					ko.utils.registerEventHandler(element, 'keyup', function(evt) {
						valueAccessor().call(viewModel);
					});
				}
			};

			ko.applyBindings(search, $("#cDSearch")[0]);
			$("#cwrcSearchDialog").modal(params.modalOptions);
			$("#cwrcSearchDialog").draggable({	
				handle: ".modal-header"
			});
		}

		search.clear = function() {
			search.selectedData = null;
			for (var key in search.linkedDataSources) {
				var lds = search.linkedDataSources[key];
				lds.results.removeAll();
			}
			search.queryString("");
			search.initiateInfo();
			search.removeInfoPopOver();
		};

		// search.delayedTimeout;
		search.delayedSearchEntity = function() {
			clearTimeout(search.delayedTimeout);
			search.delayedTimeout = setTimeout(search.searchEntity, 1000);
		}

		search.searchEntity = function() {
			// TEMP
			search.removeInfoPopOver();
			search.performSearch($("#searchEntityInput").val());
		};

		// Logic functions

		// models
		
		search.result = function(specs) {
			var that = {
				name : "",
				data : "",
				id : "",
				selected : ko.observable(false)
			}
			return that;
		}

		search.getResultFromCWRC = function(specs) {
			// specs has data and source
			var that = search.result();
			that.name = specs["solr_doc"]["fgs.label"];
			that.id = specs["PID"];
			// that.data = cwrcApi[dialogType].getEntity(specs["PID"]);
			return that;
		}

		search.getResultFromVIAF = function(specs, index) {
			var that = search.result();
			// var mainEl = $('mainHeadingEl', specs).first();
			// alert($('subfield[code="a"]', mainEl).text());
			var i = index + 2
			var nameSelector = "recordData ns"+i+"\\:VIAFCluster ns"+i+"\\:mainHeadings ns"+i+"\\:text";
			
			that.name = $(specs).find(nameSelector).text();

			var idSelector = "recordData ns"+i+"\\:VIAFCluster ns"+i+"\\:viafID";
			that.id = $(specs).find(idSelector).text();;
			// that.data = "missing";

			// alert($(specs).children("mainHeadingEl").first().children())
			// var mainEl = $('mainHeadingEl', specs).first();

			// var name = $('subfield[code="a"]', mainEl).text();
			// var date = $('subfield[code="d"]', mainEl).text();
			// var gender = $('gender', specs).text();
			// switch (gender) {
			// 	case 'a':
			// 		gender = 'f';
			// 	break;
			// 	case 'b':
			// 		gender = 'm';
			// 	break;
			// 	default:
			// 		gender = 'u';
			// }
			// alert(name);
			// that.name = name;
			return that;
		}


		search.selectResult = function(result) {
			$.each(search.linkedDataSources[search.selectedLinkedDataSource].results(), function(i, entry){
				entry.selected(false) ;
			});
			result.selected(true);
			search.selectedData = result;
		};

		search.selectLinkedDataSource = function(data, event) {
			search.selectedLinkedDataSource = $(event.target).attr("data-name");
			search.searchEntity();
		}

		search.performSearch = function(queryString) {
			search.selectedData = null;
			
			for (var key in search.linkedDataSources) {
				var lds = search.linkedDataSources[key];
				lds.results.removeAll();
			}

			search.selectedData = null;
			if (queryString !== "") {

				// CWRC Search
				for(var key in search.linkedDataSources) {
					var lds = search.linkedDataSources[key];
					if (lds.ajaxRequest !== null) {
						lds.ajaxRequest.abort();	
					}
				}
				search.linkedDataSources[search.selectedLinkedDataSource].processSearch(queryString);
			}
		};

		search.processData = function() {
			return "";
		}

		search.returnSelected = function() {
			search.selectedData.data = search.processData(search.selectedData["id"]);
			search.success(search.selectedData);
			search.clear();
		};

		search.initiateInfo = function() {			
			$(".modal-dialog").popover({
				title : function(){return search.selectedData.name;},
				content : function(){
					var result = "";
					result += "<div>";
					result += search.scrapeInformation(search.selectedData);
					result += "</div>";
					return result;
				},
				html: true,

				trigger: "manual"
			});
		}

		search.scrapeInformation = function(doc) {
			return doc.id;
		}

		search.showInfoPopOver = function(clicked) {
			search.selectResult(clicked);
			$(".modal-dialog").popover("show");
		}


		search.removeInfoPopOver = function() {			
			$(".modal-dialog").popover("hide");
		}

		search.returnAndHide = function() {
			search.returnSelected();
			$("#cwrcSearchDialog").modal("hide");
		}

		///////////////////////////////////////////////////////////////////////
		// cD search interface
		///////////////////////////////////////////////////////////////////////

		var popSearchPerson = function(opts) {
			search.clear();
			dialogType = "person";
			$("#cwrcSearchDialog").modal({show: true});
			// search.buttons = opts.buttons ? opts.buttons : [];
			// search.buttons = opts.buttons;
			search.buttons.removeAll();
			// search.buttons(opts.buttons);
			if (typeof opts.buttons !== undefined ) {
				for (var i = 0; i< opts.buttons.length; ++i) {
					var button = opts.buttons[i];
					if (typeof(button.label) === 'string' && 
						typeof(button.action) === 'function') {
						search.buttons.push(button);	
					}
				}
			}
		
			// alert(search.buttons[0].label)
			search.success = typeof opts.success === undefined ? function(){} : opts.success;
			search.error = typeof opts.error === undefined ? function(){} : opts.error;

		};

		cD.popSearchPerson = popSearchPerson;

		var popSearch = {
			person: popSearchPerson,
		};

		cD.popSearch = popSearch;

		///////////////////////////////////////////////////////////////////////

		initialize();

	})();
});
