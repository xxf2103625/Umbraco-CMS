(function () {
    "use strict";

    function ChangeDocTypeController($scope, contentResource, navigationService) {

        var vm = this;
        var id = $scope.currentNode.id;

		vm.currentContentType = {};
		vm.allowedContentTypes = [];
		vm.allowedTemplates = [];
		vm.propertiesMap = [];

		// the new models
		vm.newContentType = {};
		vm.newTemplate = {};

		// bind function to view model
		vm.changeAllowedContentType = changeAllowedContentType;
		vm.changeProperty = changeProperty;
        vm.save = save;

        function onInit() {
            vm.loading = true;
			contentResource.getAvailableContentTypesToChangeTo(id)
				.then(function(data){
					vm.currentContentType = data.currentContentType;				
					vm.allowedContentTypes = data.contentTypes;
					vm.loading = false;
				});
		}
		
		function changeAllowedContentType(newContentType) {
			contentResource.getAvailableProperties(vm.currentContentType.alias, newContentType.alias)
				.then(function(data){
					vm.allowedTemplates = data.templates;
					vm.propertiesMap = data.currentProperties;
				});
		}

		function changeProperty(currentProperty, selected) {
			currentProperty.selectedAlias = selected;
		}

        function save() {

			vm.saveButtonState = "busy";

			var fieldMap = [];

			angular.forEach(vm.propertiesMap, function(property) {
				if(property.selectedAlias) {
					var map = {};
					map.fromAlias = property.alias;
					map.toAlias = property.selectedAlias;
					fieldMap.push(map);
				}
			});
            
            var args = {
				"contentNodeId": id,
				"newContentTypeId": vm.newContentType.id,
				"newTemplateId": vm.newTemplate.id,
				"fieldMap": fieldMap
			};

            contentResource.postContentTypeChange(args).then(function(){

				console.log('args', args);
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