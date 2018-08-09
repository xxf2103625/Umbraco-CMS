(function () {
    "use strict";

    function ChangeDocTypeController($scope, contentResource, navigationService) {

        var vm = this;
        var id = $scope.currentNode.id;

        vm.loading = false;
		vm.saveButtonState = "init";
		vm.currentContentType = {};
		vm.currentNodeName = null;
		vm.contentTypes = [];

        vm.save = save;

        function onInit() {
            vm.loading = true;
            contentResource.getAvailableContentTypesToChangeTo(id).then(function(data){
				vm.currentContentType = data.CurrentContentType;
				vm.currentNodeName = data.CurrentNodeName;
				vm.contentTypes = data.ContentTypes;
				vm.loading = false;
			});
        }

        function save() {
            vm.saveButtonState = "busy";
            
            var args = {
				"contentNodeId": 1234,
				"newContentTypeId": 80,
				"newTemplateId": 40,
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