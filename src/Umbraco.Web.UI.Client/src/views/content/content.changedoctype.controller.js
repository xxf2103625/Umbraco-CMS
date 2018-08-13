(function () {
    "use strict";

    function ChangeDocTypeController($scope, $timeout, contentResource, navigationService) {

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
        vm.save = save;

        function onInit() {
            vm.loading = true;
            contentResource.getAvailableContentTypesToChangeTo(id).then(function(data){
				
				vm.currentContentType = data.CurrentContentType;				
				vm.allowedContentTypes = data.ContentTypes;

				vm.loading = false;
			});
		}
		
		function changeAllowedContentType(newContentType) {
			console.log("change");

			// use in request
			console.log("current content type", vm.currentContentType.Alias);
			console.log("new content type", newContentType.Alias);

			contentResource.getAvailableProperties(vm.currentContentType.Alias, newContentType.Alias)
				.then(function(data){
					console.log(data);
				});

			/*
			// fake request
			$timeout(function(){

				vm.allowedTemplates = [
					{
						"name": "Template Name 1",
						"alias": "templateAlias",
						"id": 1
					},
					{
						"name": "Template Name 2",
						"alias": "templateAlias2",
						"id": 2
					}
				];

				vm.propertiesMap = [
					{
						"name": "Date",
						"alias": "datePicker",
						"allowed": [
							{
								"name": "Release Date",
								"alias": "datePicker"
							},
							{
								"name": "Date",
								"alias": "datePicker"
							}
						]
					},
					{
						"name": "Headline",
						"alias": "textString",
						"allowed": [
							{
								"name": "Awesome Headline",
								"alias": "textString"
							}
						]
					}
				];

			}, 1000);
			*/

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