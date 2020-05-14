app.controller('dashboardController', function($scope, $http, $rootScope) {
	
	$scope.UserID = window.localStorage.getItem("loginDetails");
	$scope.role = window.localStorage.getItem("loginRole");
	$scope.userName = window.localStorage.getItem("userName");
	
	if($scope.UserID == undefined || $scope.UserID == null ){
		window.location = "/visitor-Management-System/index.html";
	}
	
	//$('#dataTable').DataTable();
	//$('#dataTable2').DataTable();
	
	$scope.allVisits = [];
	$scope.getCounts = function(){
		$http.post("/visitor-Management-System/Employee/CancelVisitCount",$scope.UserID).then(function mySuccess(response){
			$scope.cancelVisitCount = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
		$http.post("/visitor-Management-System/Employee/TotalVisitCount",$scope.UserID).then(function mySuccess(response){
			$scope.totalVisitCount = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
		$http.post("/visitor-Management-System/Employee/TodaysVisitCount",$scope.UserID).then(function mySuccess(response){
			$scope.todaysVisitCount = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
		
		$http.post("/visitor-Management-System/Employee/AttendedVisitCount",$scope.UserID).then(function mySuccess(response){
			$scope.attendedVisitCount = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.viewAllCoVisitor = function(visitor){
		visitor.enableVisitorCheckOut = true;
		$http.post("/visitor-Management-System/Security/viewAllCoVisitor", visitor).then(function mySuccess(response){
			$scope.allCoVisitor = response.data;
			if($scope.allCoVisitor.length > 0){
				angular.forEach($scope.allCoVisitor,function(coVisitor){
					if(!coVisitor.seccheckout){
						visitor.enableVisitorCheckOut = false;
					}
				});
			}else{
				if(!visitor.empCheckout){
					visitor.enableVisitorCheckOut = false;
				}
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	
	};
	
	$scope.viewAllVisits = function(){
		$scope.param = {
				empCode: $scope.UserID,
				empRole: $scope.role
		};
		$http.post("/visitor-Management-System/Employee/viewAllVisits",$scope.param).then(function mySuccess(response){
			console.log(response.data);
			$scope.allVisits = response.data;
			if($scope.role != "Security"){
				$scope.getCounts();
			}else{
				angular.forEach($scope.allVisits,function(visit){
					$scope.viewAllCoVisitor(visit);
				});
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.viewAllContacts = function(){
		$http.post("/visitor-Management-System/Employee/viewAllContacts",$scope.UserID).then(function mySuccess(response){
			console.log(response.data);
			$scope.allContacts = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.getTasks = function(){
		$http.post("/visitor-Management-System/Employee/viewTask",$scope.UserID).then(function mySuccess(response){
			console.log(response.data);
			$scope.allTask = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	}
	
	$scope.getAllPlants = function(){
		$http.post("/visitor-Management-System/Plant/viewAllPlant").then(function mySuccess(response){
			console.log(response.data);
			$scope.allPlants = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	if($scope.role == "Security"){
		$scope.viewAllVisits();
	}else{
		$scope.viewAllContacts();
		$scope.viewAllVisits();
		$scope.getAllPlants();
		$scope.getTasks();
	}
	
	$scope.securityCheckin = function(visit){
		$rootScope.visitCheckin = visit;
		if($rootScope.visitCheckin.secCheckin){
			window.location = "#!securityCheckOut";
		}else{
			$rootScope.visitCheckin.secCheckinBy = $scope.userName;
			$http.post("/visitor-Management-System/Security/securityCheckin", $rootScope.visitCheckin).then(function mySuccess(response){
				if(response.data.msg == 'SUCCESS'){
					window.location = "#!securityCheckOut";
				}
			}, function myError(data){
				console.log("some internal error");
				console.log(data);
			});
		}
	};
	
	$scope.securityCheckout = function(visit){
		visit.secCheckoutBy = $scope.userName;
		$http.post("/visitor-Management-System/Security/securityCheckout", visit).then(function mySuccess(response){
			if(response.data.msg == 'SUCCESS'){
				$scope.viewAllVisits();
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	}
	
	$scope.addTask = function(){
		$scope.newTask.createdBy = $scope.UserID;
		$http.post("/visitor-Management-System/Employee/addTask",$scope.newTask).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getTasks();
				$('#addNewTask').modal('hide');
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	}
	
	$scope.updateTask = function(task){
		$http.post("/visitor-Management-System/Employee/completeTask",task).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getTasks();
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.setVisit = function(contact){
		$scope.visit = {};
		$scope.visit.meetingBooked = {};
		$scope.visit.meetingBooked.visitor = {};
		$scope.visit.meetingBooked.visitor.visitorName = contact.firstName +" "+ contact.lastName;
		$scope.visit.meetingBooked.visitor.emailId = contact.emailId;
		$scope.visit.meetingBooked.visitor.contactNumber = contact.mobileNumb;
		$scope.visit.meetingBooked.visitor.organisation = contact.company;
	};
	
	$scope.addNewVisit = function(){
		$scope.invalidMobile = false;
		$scope.invalidDate = false;
		if($scope.addVisitForm.$valid){
			if(!isNaN($scope.visit.meetingBooked.visitor.contactNumber) && angular.isNumber(+$scope.visit.meetingBooked.visitor.contactNumber)){
				var todayDate = new Date();
				todayDate.setHours(0,0,0,0)
				if($scope.visit.meetingBooked.visitDate < todayDate){
					$scope.invalidDate = true;
				}else{
					$scope.visit.createdBy = $scope.UserID;
					$scope.visit.lastUpdatedBy = $scope.UserID;
					$scope.visit.meetingBooked.empId = $scope.UserID;
					$scope.visit.meetingBooked.empName = $scope.userName;
					$http.post("/visitor-Management-System/Employee/addNewVisit", $scope.visit).then(function mySuccess(response){
						if(response.data.msg == "SUCCESS"){
							$('#VisitScheduleModal').modal('hide');
							window.location.href  = "#!employeeDashboard";
						}
					}, function myError(data){
						console.log("some internal error");
						console.log(data);
					});
				}
			}else{
				$scope.invalidMobile = true;
			}
		}
	};
	
});