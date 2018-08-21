(function () {
    "use strict";

    function HostnamesOverviewController($location, $timeout, navigationService, localizationService) {

        var vm = this;

        vm.page = {};
        vm.languages = [];
        vm.labels = {};

        vm.addHostname = addHostname;
        vm.editHostname = editHostname;
        vm.deleteHostname = deleteHostname;

        function init() {

            vm.loading = true;

            // localize labels
            var labelKeys = [
                "treeHeaders_languages"
            ];

            localizationService.localizeMany(labelKeys).then(function (values) {
                vm.labels.languages = values[0];
                vm.page.name = "Hostnames";
            });

            vm.hostnames = [
                {
                    "id": 1,
                    "hostname": "www.hostname.com",
                    "language": "English (United States)",
                    "node": {
                        "name": "Home",
                        "icon": "icon-home"
                    }
                },
                {
                    "id": 2,
                    "hostname": "www.hostname.com/da",
                    "language": "Danish",
                    "node": {
                        "name": "Forside",
                        "icon": "icon-home"
                    }
                },
                {
                    "id": 3,
                    "hostname": "www.hostname.com/fr",
                    "language": "French",
                    "node": {
                        "name": "French root node",
                        "icon": "icon-home"
                    }
                },
                {
                    "id": 4,
                    "hostname": "www.hostname.com/es",
                    "language": "Spanish",
                    "node": {
                        "name": "Spanish root node",
                        "icon": "icon-home"
                    }
                }
            ];

            vm.loading = false;

            /*
            $timeout(function () {
                navigationService.syncTree({ tree: "hostnames", path: "-1" });
            });
            */

        }

        function addHostname() {
            $location.search('create', null);
            $location.path("/settings/hostnames/edit/-1").search("create", "true");
        }

        function editHostname(hostname) {
            $location.search('create', null);
            $location.path("/settings/hostnames/edit/" + hostname.id);
        }

        function deleteHostname(hostname, event) {
            var confirmed = confirm("Are you sure you want to delete " + hostname.name + "?");
            if(confirmed) {
                hostname.deleteButtonState = "busy";
                // fake request
                $timeout(function(){
                    var index = vm.hostnames.indexOf(hostname);
                    vm.hostnames.splice(index, 1);
                }, 1000);
            }
            event.preventDefault()
            event.stopPropagation();
        }

        init();

    }

    angular.module("umbraco").controller("Umbraco.Editors.Hostnames.OverviewController", HostnamesOverviewController);

})();