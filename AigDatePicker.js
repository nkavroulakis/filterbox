define(["qlik", "text!./template.html", "./jquery_calendar/jquery-ui.min", "css!./jquery_calendar/jquery-ui.min.css", "css!./jquery_calendar/jquery-ui.theme.min.css", "css!./jquery_calendar/jquery-ui.structure.min.css", "css!./AigDatePicker.css"],
    //define(["qlik", "text!./template.html", "./jquery-ui.min.js", "css!./jquery-ui.min.css", "css!./jquery-ui.structure.min.css", "css!./jquery-ui.theme.min.css", "css!./AigDatePicker.css"],
	function ( qlik, template ) {

        return {
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 1,
                        qHeight: 10000
                    }]
                }
            },
			template: template,
			support: {
				snapshot: true,
				export: true,
				exportData: false
			},
            paint: function () {
				return qlik.Promise.resolve();
			},
			controller: ['$scope', function ( $scope ) {
                //add your rendering code here
                $scope.isCustomRangeActive = false;
                $scope.whichButtonActive = null;

                $scope.startDate = new Date();
                $("#datepicker-start-date").datepicker({
                    //setDate: $scope.startDate,
                    onSelect: function (date) { $scope.startDate = date; }
                });
                $("#ui-datepicker-div").wrap('<div class="aigcal" />');
                $("#datepicker-start-date").datepicker("setDate", $scope.startDate);

                $scope.endDate = new Date();
                $("#datepicker-end-date").datepicker({
                    //setDate: $scope.startDate,
                    onSelect: function (date) { $scope.endDate = date; }
                });
                $("#datepicker-end-date").datepicker("setDate", $scope.endDate);

                    //$("#datepicker-end-date").datepicker();
                    //$("#datepicker-end-date").datepicker("setDate", new Date);

                $scope.onApply = function () {
                    console.log($scope.startDate, $scope.endDate);
                }

                $scope.onRangeSelect = function (range) {
                        
                    if (range === 'YTD')
                    {

                        $scope.endDate = new Date();
                        var endDateYear = $scope.endDate.getFullYear().toString();
                        $scope.startDate = new Date(endDateYear);

                        $("#datepicker-start-date").datepicker("setDate", $scope.startDate);
                        $("#datepicker-end-date").datepicker("setDate", $scope.endDate);
                    } else if (range === 'QTD') {

                        $scope.endDate = new Date();
                        var firstQuarterDate = new Date($scope.endDate.getFullYear(), Math.floor($scope.endDate.getMonth()/3) * 3 );
                        $scope.startDate = firstQuarterDate;

                        $("#datepicker-start-date").datepicker("setDate", $scope.startDate);
                        $("#datepicker-end-date").datepicker("setDate", $scope.endDate);

                    }

                    if (range === $scope.whichButtonActive)
                    {
                        $scope.whichButtonActive = null;
                    }
                    else {
                        $scope.whichButtonActive = range;
                    }
                    


                }

                $scope.onClickCustomRange = function () {
                    $scope.isCustomRangeActive = !$scope.isCustomRangeActive;

                    if ($scope.isCustomRangeActive)
                    {
                        $(".qv-object-TabbedContainer_v2 .tab_content:not(.ng-hide)").css("height", "140px");
                    }
                    else
                    {
                        $(".qv-object-TabbedContainer_v2 .tab_content:not(.ng-hide)").css("height", "245px");
                    }

                }

                $scope.decorateButton = function () {
                    
                }


			}]
		};

	} );

