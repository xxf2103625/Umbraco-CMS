(function () {
    "use strict";

    function HostnamesEditController($scope, $timeout, $location, $routeParams, localizationService, languageResource, formHelper) {

        var vm = this;
        var hostnamesOverviewPath = "/settings/hostnames/overview";
        var id = $routeParams.id;
        var create = $routeParams.create;

        vm.page = {};
        vm.showBackButton = true;
        vm.hostname = {};
        vm.availableCultures = null;
        vm.breadcrumbs = [];
        vm.labels = {};
        vm.allowRemoveNode = true;

        vm.save = save;
        vm.back = back;
        vm.goToPage = goToPage;

        function init() {

            vm.loading = true;

            // localize labels
            var labelKeys = [
                "treeHeaders_hostnames",
                "hostnames_addHostname",
                "hostnames_editHostname"
            ];

            localizationService.localizeMany(labelKeys).then(function (values) {
                vm.labels.hostnames = "Hostnames";
                vm.labels.addHostname = "Add hostname";
                vm.labels.editHostname = "Edit hostname";

                languageResource.getAll().then(function (languages) {
                    vm.languages = languages;
                });

                if(create) {
                    vm.page.name = vm.labels.addHostname;
                    vm.loading = false;
                }

                if(!create) {
                    vm.page.name = vm.labels.editHostname;
                    $timeout(function(){
                        vm.hostname = {
                            "id": 1,
                            "hostname": "www.hostname.com",
                            "language": {
                                "displayName": "English (United States)",
                                "culture": "en-US"
                            },
                            "node": {
                                "id": 1,
                                "name": "Home",
                                "icon": "icon-home"
                            }
                        };
                        makeBreadcrumbs();
                        vm.loading = false;
                    }, 500);
                }

            });
            
        }

        function save() {
            if (formHelper.submitForm({ scope: $scope })) {
                vm.page.saveButtonState = "busy";
                $timeout(function(){
                    vm.page.saveButtonState = "success";
                }, 1000);
            }
        }

        function back() {
            $location.path(hostnamesOverviewPath);
        }

        function goToPage(ancestor) {
            $location.path(ancestor.path);
        }

        function makeBreadcrumbs() {
            vm.breadcrumbs = [
                {
                    "name": vm.labels.hostnames,
                    "path": hostnamesOverviewPath
                },
                {
                    "name": vm.hostname.hostname
                }
            ];
        }

        init();

    }

    angular.module("umbraco").controller("Umbraco.Editors.Hostnames.EditController", HostnamesEditController);

})();
