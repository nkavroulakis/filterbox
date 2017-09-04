require.config({
    paths: {
        filesaver: './external/file-saver/FileSaver.min'
    },
    shim: {
        filesaver: { exports: 'FileSaver' }
    }
})

﻿define([
    'jquery',
    'angular',
    'qlik',
    'text!./TabbedContainer.css',
    'text!./template.html',
    './properties/definition',
    './constants/colors',
    './services/tabService',
    './services/colorsService',
    './services/qlikService',
    './directives/stackedContainer',
    './directives/exportTable',
    //'./directives/detailsCard'
],

    function($, a, qlik, cssStyles, template, definition, colors) {
        var colorsService;

        $("<style>").html(cssStyles).appendTo("head");

        return {
            initialProperties: {
                version: 1.0
            },
            definition: definition,
            support: {
                snapshot: true,
                export: false,
                exportData: false
            },
            template: template,
            priority: 0,
            paint: function($element, layout) {
                /* the background of the container can be determined
                 * by the color picker or the text input. The latter has priority. */
                if(layout.backgroundColorCode.length > 0) {
                    var tileBackground = layout.backgroundColorCode;
                } else {
                    var tileBackgroundRgb = colorsService.hexToRgb(colors.palette[layout.backgroundColor]);
                    var tileBackground = colorsService.toString(tileBackgroundRgb, 0.2);
                }

                //debugger;

                // Paint the border and the background of the object container
                var tileBorder = colorsService.hexToRgb(colors.palette[layout.borderColor]);
                $element.find('.tab_container').css('border-color', colorsService.toString(tileBorder));
                $element.find('.tab_content').css('background-color', tileBackground);



                return qlik.Promise.resolve();
            },
            resize: function($element, layout) {

                this.paint($element, layout);

            },
            controller: ['$scope', '$timeout', 'tabService', 'colorsService',
                function($scope, $timeout, tabService, cService) {
                    colorsService = cService;
                    $scope.layout.colors = colors;
                    $scope.currentObject;
                    $scope.shouldDisplayDetailsCard = false;
                    $scope.isExpandModeON = false;
                    $scope.initExpandMode = false;
                    $scope.stackedMode = true;

                    $scope.isTabActive = function (tab) {
                        return $scope.isExpandModeON || $scope.activeTab != null && tab.id === $scope.activeTab.id;//new code Expand mode
                    }

                    $scope.toggleDisplayCard = function(){
                        $scope.shouldDisplayDetailsCard = !$scope.shouldDisplayDetailsCard;
                    }

                    $scope.getTabStyles = function(tab) {
                        var buttonBackground = colorsService.hexToRgb(colors.palette[$scope.layout.buttonColor])

                        return $scope.isTabActive(tab) ?
                            {
                                'background-color': colorsService.toString(buttonBackground, 0.2),
                                'border-color': colorsService.toString(buttonBackground)
                            } :
                            {
                                'background-color': colors.inactive.background,
                                'border-color': colors.inactive.border
                            }
                    }
                    //Expand Collapse new Code
                    $scope.onTabClick = function (index) {
                        $scope.isExpandModeON = false;
                        if ($scope.activeTab == $scope.tabItems[index])
                        {
                            $scope.activeTab = null;
                        }
                        else
                        {
                            $scope.activeTab = $scope.tabItems[index];
                            //debugger;
                            
                            //var htmlId = mItems[layout.listItems[i].qName] + '_' + tid;
                            //$element.find('.tab_container').append('<div id="' + htmlId + '" class="q-object margin-lr margin-tb" ></div>');

                            //$(".tab_content")[0].append();

                            var extensionId = '#' + $scope.localId + '_' + $scope.activeTab.id;
                            //console.log('#' + $scope.localId + '_' + $scope.activeTab.id);
                            qlik.currApp().getObject(
                                $(extensionId),
                                $scope.activeTab.objectid
                            );

                            setTimeout(function () {
                                var numOfElements = $(extensionId + " .qv-filterpane-column > div").length;

                                var ELEM_HEIGHT = 34;
                                var ELEM_MARGIN = 10;
                                var calculatedHeight = (numOfElements * (ELEM_HEIGHT + ELEM_MARGIN)) - ELEM_MARGIN;

                                //debugger;

                                if (numOfElements == 0)
                                {
                                    //calc(100 % - 4px)
                                    $(".qv-object-TabbedContainer_v2 .tab_content:not(.ng-hide)").css('height', "calc(100% - 4px)");
                                    
                                }
                                else { $(".qv-object-TabbedContainer_v2 .tab_content:not(.ng-hide)").css('height', calculatedHeight + "px");}

                                $(extensionId + " .qv-filterpane-column").css('background-color', "black");

                                //$(".qv-object-TabbedContainer_v2 .tab_content:not(.ng-hide)").css('height', calculatedHeight + "px");
                                //debugger;
                            }, 1000);

                            $(".qv-object-TabbedContainer_v2 .tab_content").css('background-color', "inherit");

                            

                            //debugger;

                            //debugger;

                            /*
                            qlik.currApp().getObject(
                                //$('#' + $scope.localId + '_' + $scope.activeTab.id),
                                $(".tab_content")[0],
                                $scope.activeTab.objectid
                            )
                            */

                        }

                    }

                    $scope.localId = Math.floor(Math.random()*16777215).toString(16);
                    $scope.tabItems = tabService.getTabInfo($scope);
                    $scope.activeTab = $scope.tabItems[0];//The first tab is active


                    /** Reinitialize the tabItems object if the layout changes,
                     * which happens when the user gives some input.
                     *
                     * Then, check for the following scenarios:
                     *     1. The first tab is added -> render it inmediately
                     *     2. The active tab was removed -> take user to tab 0
                     *     3. Otherwise, reload the current object */
                    $scope.$watch('layout', function (newValue) {
                        //debugger;
                        var prevNumberTabs = $scope.tabItems.length;
                        $scope.tabItems = tabService.getTabInfo($scope);

                        if(prevNumberTabs === 0 && $scope.tabItems.length > 0){
                            $timeout(function() {
                                $scope.onTabClick(0);
                            }, 200)
                        } else if($scope.tabItems.length > 0){
                            // if active tab is -1, then it was removed
                            var activeTabIndex = -1;
                            //New Code////////
                            /*
                            if ($scope.activeTab == null)
                            {
                                return;
                            }
                            */
                            for(var i=0; i<$scope.tabItems.length; i++){
                                if($scope.tabItems[i].index === $scope.activeTab.index) {
                                    activeTabIndex = i;
                                    break;
                                }
                            }

                            $timeout(function(){
                                (activeTabIndex === -1) ? $scope.onTabClick(0)
                                    : $scope.onTabClick(activeTabIndex);
                            },200)
                            
                        }
                    }, true);

                    $scope.collapseAllTabs = function () {
                        $scope.isExpandModeON = false;
                        $scope.initExpandMode = true;
                        //debugger;
                        $scope.activeTab = null;
                    }

                    $scope.expandAllTabs = function () {
                        $scope.isExpandModeON = true;
                        $scope.initExpandMode = false;

                        for (var item of $scope.tabItems) {
                            //debugger;
                            
                            qlik.currApp().getObject(
                                $('#' + $scope.localId + '_' + item.id),
                                item.objectid
                            )
                            
                        }

                    }
                }
            ]
        };

    }
);
