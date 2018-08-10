(function () {
    'use strict';

    function ContentNodeInfoDirective($timeout, $location, logResource, eventsService, userService, localizationService, dateHelper, editorService) {

        function link(scope, element, attrs, ctrl) {

            var evts = [];
            var isInfoApp = false;
            var labels = {};
            scope.publishStatus = [];

            scope.disableTemplates = Umbraco.Sys.ServerVariables.features.disabledFeatures.disableTemplates;
            scope.allowChangeDocumentType = false;
            scope.allowChangeTemplate = false;
            
            function onInit() {

                //get the current variant
                scope.activeVariant = _.find(scope.node.variants, function (variant) {
                    return variant.active;
                });

                userService.getCurrentUser().then(function(user){
                        // only allow change of media type if user has access to the settings sections
                        angular.forEach(user.sections, function(section){
                            if(section.alias === "settings") {
                                scope.allowChangeDocumentType = true;
                                scope.allowChangeTemplate = true;
                            }
                        });
                    });

                var keys = [
                    "general_deleted", 
                    "content_unpublished", 
                    "content_published",
                    "content_publishedPendingChanges",
                    "content_notCreated"
                ];

                localizationService.localizeMany(keys)
                    .then(function(data){
                        labels.deleted = data[0];
                        labels.unpublished = data[1]; //aka draft
                        labels.published = data[2];
                        labels.publishedPendingChanges = data[3];
                        labels.notCreated = data[4];

                        setPublishState(scope.node, scope.activeVariant);

                    });

                scope.datePickerConfig = {
                    pickDate: true,
                    pickTime: true,
                    useSeconds: false,
                    format: "YYYY-MM-DD HH:mm",
                    icons: {
                        time: "icon-time",
                        date: "icon-calendar",
                        up: "icon-chevron-up",
                        down: "icon-chevron-down"
                    }
                };

                scope.auditTrailOptions = {
                    "id": scope.node.id
                };

                // get available templates
                scope.availableTemplates = scope.node.allowedTemplates;

                // get document type details
                scope.documentType = scope.node.documentType;

                // make sure dates are formatted to the user's locale
                formatDatesToLocal();
                
                // Declare a fallback URL for the <umb-node-preview/> directive
                scope.previewOpenUrl = '#/settings/documenttypes/edit/' + scope.documentType.id;

            }

            scope.auditTrailPageChange = function (pageNumber) {
                scope.auditTrailOptions.pageNumber = pageNumber;
                loadAuditTrail();
            };

            scope.openDocumentType = function (documentType) {
                var editor = {
                    id: documentType.id,
                    submit: function(model) {
                        editorService.close();
                    },
                    close: function() {
                        editorService.close();
                    }
                };
                editorService.documentTypeEditor(editor);
            };

            scope.openTemplate = function () {
                var templateEditor = {
                    id: scope.node.templateId,
                    submit: function(model) {
                        editorService.close();
                    },
                    close: function() {
                        editorService.close();
                    }
                };
                editorService.templateEditor(templateEditor);
            }

            scope.updateTemplate = function (templateAlias) {
                // update template value
                scope.node.template = templateAlias;
            };

            scope.datePickerChange = function (event, type) {
                if (type === 'publish') {
                    setPublishDate(event.date.format("YYYY-MM-DD HH:mm"));
                } else if (type === 'unpublish') {
                    setUnpublishDate(event.date.format("YYYY-MM-DD HH:mm"));
                }
            };

            scope.clearPublishDate = function () {
                clearPublishDate();
            };

            scope.clearUnpublishDate = function () {
                clearUnpublishDate();
            };

            function loadAuditTrail() {

                scope.loadingAuditTrail = true;

                logResource.getPagedEntityLog(scope.auditTrailOptions)
                    .then(function (data) {

                        // get current backoffice user and format dates
                        userService.getCurrentUser().then(function (currentUser) {
                            angular.forEach(data.items, function(item) {
                                item.timestampFormatted = dateHelper.getLocalDate(item.timestamp, currentUser.locale, 'LLL');
                            });
                        });
                    
                        scope.auditTrail = data.items;
                        scope.auditTrailOptions.pageNumber = data.pageNumber;
                        scope.auditTrailOptions.pageSize = data.pageSize;
                        scope.auditTrailOptions.totalItems = data.totalItems;
                        scope.auditTrailOptions.totalPages = data.totalPages;

                        setAuditTrailLogTypeColor(scope.auditTrail);
                        
                        scope.loadingAuditTrail = false;
                    });

            }

            function setAuditTrailLogTypeColor(auditTrail) {
                angular.forEach(auditTrail, function (item) {
                    switch (item.logType) {
                        case "Publish":
                            item.logTypeColor = "success";
                            break;
                        case "UnPublish":
                        case "Delete":
                            item.logTypeColor = "danger";
                            break;
                        default:
                            item.logTypeColor = "gray";
                    }
                });
            }

            function setPublishState(node, variant) {

                var state = {};

                if (node.trashed) {
                    // deleted node
                    state.label = labels.deleted;
                    state.color = "danger";
                    return;
                }

                if (variant.state === "NotCreated") {
                    // not created variant
                    state.label = labels.notCreated;
                    state.color = "gray";
                }
                else if (variant.state === "Draft") {
                    // draft variant
                    state.label = labels.unpublished;
                    state.color = "gray";
                }
                else if (variant.state === "Published") {
                    // published variant
                    state.label = labels.published;
                    state.color = "success";
                }
                else if (variant.state === "PublishedPendingChanges") {
                    // published variant with pending changes
                    state.label = labels.publishedPendingChanges;
                    state.color = "success";
                }

                scope.variantState = state;

            }

            function setPublishDate(date) {

                if (!date) {
                    return;
                }

                //The date being passed in here is the user's local date/time that they have selected
                //we need to convert this date back to the server date on the model.

                var serverTime = dateHelper.convertToServerStringTime(moment(date), Umbraco.Sys.ServerVariables.application.serverTimeOffset);

                // update publish value
                scope.node.releaseDate = serverTime;

                // make sure dates are formatted to the user's locale
                formatDatesToLocal();

                // emit event
                var args = { node: scope.node, date: date };
                eventsService.emit("editors.content.changePublishDate", args);

            }

            function clearPublishDate() {

                // update publish value
                scope.node.releaseDate = null;

                // emit event
                var args = { node: scope.node, date: null };
                eventsService.emit("editors.content.changePublishDate", args);

            }

            function setUnpublishDate(date) {

                if (!date) {
                    return;
                }

                //The date being passed in here is the user's local date/time that they have selected
                //we need to convert this date back to the server date on the model.

                var serverTime = dateHelper.convertToServerStringTime(moment(date), Umbraco.Sys.ServerVariables.application.serverTimeOffset);

                // update publish value
                scope.node.removeDate = serverTime;

                // make sure dates are formatted to the user's locale
                formatDatesToLocal();

                // emit event
                var args = { node: scope.node, date: date };
                eventsService.emit("editors.content.changeUnpublishDate", args);

            }

            function clearUnpublishDate() {

                // update publish value
                scope.node.removeDate = null;

                // emit event
                var args = { node: scope.node, date: null };
                eventsService.emit("editors.content.changeUnpublishDate", args);

            }
            
            function ucfirst(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function formatDatesToLocal() {
                // get current backoffice user and format dates
                userService.getCurrentUser().then(function (currentUser) {
                    scope.node.createDateFormatted = dateHelper.getLocalDate(scope.node.createDate, currentUser.locale, 'LLL');
                    
                    scope.node.releaseDateYear = scope.node.releaseDate ? ucfirst(dateHelper.getLocalDate(scope.node.releaseDate, currentUser.locale, 'YYYY')) : null;
                    scope.node.releaseDateMonth = scope.node.releaseDate ? ucfirst(dateHelper.getLocalDate(scope.node.releaseDate, currentUser.locale, 'MMMM')) : null;
                    scope.node.releaseDateDayNumber = scope.node.releaseDate ? ucfirst(dateHelper.getLocalDate(scope.node.releaseDate, currentUser.locale, 'DD')) : null;
                    scope.node.releaseDateDay = scope.node.releaseDate ? ucfirst(dateHelper.getLocalDate(scope.node.releaseDate, currentUser.locale, 'dddd')) : null;
                    scope.node.releaseDateTime = scope.node.releaseDate ? ucfirst(dateHelper.getLocalDate(scope.node.releaseDate, currentUser.locale, 'HH:mm')) : null;
                    
                    scope.node.removeDateYear = scope.node.removeDate ? ucfirst(dateHelper.getLocalDate(scope.node.removeDate, currentUser.locale, 'YYYY')) : null;
                    scope.node.removeDateMonth = scope.node.removeDate ? ucfirst(dateHelper.getLocalDate(scope.node.removeDate, currentUser.locale, 'MMMM')) : null;
                    scope.node.removeDateDayNumber = scope.node.removeDate ? ucfirst(dateHelper.getLocalDate(scope.node.removeDate, currentUser.locale, 'DD')) : null;
                    scope.node.removeDateDay = scope.node.removeDate ? ucfirst(dateHelper.getLocalDate(scope.node.removeDate, currentUser.locale, 'dddd')) : null;
                    scope.node.removeDateTime = scope.node.removeDate ? ucfirst(dateHelper.getLocalDate(scope.node.removeDate, currentUser.locale, 'HH:mm')) : null;
                });
            }

            // load audit trail when on the info tab
            evts.push(eventsService.on("app.tabChange", function (event, args) {
                $timeout(function(){
                    if (args.alias === "info") {
                        isInfoApp = true;
                        loadAuditTrail();
                    } else {
                        isInfoApp = false;
                    }
                });
            }));

            // listen for variant change so we can update the content
            evts.push(eventsService.on("editors.content.changeVariant", function (event, args) {
                setPublishState(args.node, args.variant);
            }));

            // watch for content updates - reload content when node is saved, published etc.
            scope.$watch('node.updateDate', function(newValue, oldValue){

                if(!newValue) { return; }
                if(newValue === oldValue) { return; }
                
                if(isInfoTab) {
                    loadAuditTrail();
                    formatDatesToLocal();
                    setNodePublishStatus(scope.node);
                }
            });

            //ensure to unregister from all events!
            scope.$on('$destroy', function () {
                for (var e in evts) {
                    eventsService.unsubscribe(evts[e]);
                }
            });

            onInit();

        }

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/components/content/umb-content-node-info.html',
            scope: {
                node: "="
            },
            link: link
        };

        return directive;

    }

    angular.module('umbraco.directives').directive('umbContentNodeInfo', ContentNodeInfoDirective);

})();
