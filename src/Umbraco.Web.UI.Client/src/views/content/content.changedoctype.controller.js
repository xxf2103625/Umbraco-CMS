(function () {
    "use strict";

    function ChangeDocTypeController($scope, contentResource, navigationService) {

        var vm = this;
        var id = $scope.currentNode.id;

        vm.loading = false;
		vm.saveButtonState = "init";

		vm.currentNodeName = null;
		vm.currentContentType = {};
		vm.currentContentProps = {};
		
		vm.contentTypes = [];
		vm.newContentProps = [];

		vm.contentTypeChanged = contentTypeChanged;
		vm.propertyChanged = propertyChanged;
        vm.save = save;

        function onInit() {
            vm.loading = true;
            contentResource.getAvailableContentTypesToChangeTo(id).then(function(data){
				vm.currentNodeName = data.CurrentNodeName;
				
				//Current ContentType selected
				vm.currentContentType = data.CurrentContentType;
				vm.currentContentProps = [];
				
				//New Content Types
				vm.contentTypes = data.ContentTypes;
				vm.selectedContentTypeTemplates = {};
				vm.newContentProps = [];
				vm.fieldMap = [];

				vm.loading = false;
			});
        }

		function contentTypeChanged(){
			//Update the available templates select - based on chosen new doctype
			vm.selectedContentTypeTemplates = vm.newContentType !== null ? vm.newContentType.AllowedTemplates : null;

			angular.forEach(vm.currentContentType.PropertyGroups, function(item){
				angular.forEach(item.PropertyTypes, function(propItem){
					//List of the current doctype properties
					vm.currentContentProps.push(propItem);

					//Add in our fieldmappings (which dropdowns will update)
					/*
					"fieldMap": [
						{
							"fromAlias": "siteTitle",
							"toAlias": "newsTitle"
						},
						{
							"fromAlias": "bodyText",
							"toAlias": null
						}
					]
					*/
					vm.fieldMap.push({ "fromAlias": propItem.Alias, "toAlias": null });
				});
			});

			if(vm.newContentType !== null){
				angular.forEach(vm.newContentType.PropertyGroups, function(item){
					angular.forEach(item.PropertyTypes, function(propItem){
						//List of the NEW doctype properties
						vm.newContentProps.push(propItem);
					});
				});
			}
			else {
				vm.newContentProps = [];
			}
			
		}

		function propertyChanged(fromProperty) {
			console.log('from property', fromProperty);
			
		}

        function save() {
            vm.saveButtonState = "busy";
            
            var args = {
				"contentNodeId": id,
				"newContentTypeId": vm.newContentType.Id,
				"newTemplateId": vm.newTemplate.Id,
				"fieldMap": vm.fieldMap
			  };

            contentResource.postContentTypeChange(args).then(function(){
				//Sync tree?

				//Reload node?
				
				vm.saveButtonState = "success";
			}, function(error) {
				vm.error = error;
				vm.saveButtonState = "error";
			});
		}
		
        onInit();
    }

    angular.module("umbraco").controller("Umbraco.Editors.Content.ChangeDocTypeController", ChangeDocTypeController);
})();