app.controller('manageDeptController', function($scope, $rootScope, $http, $timeout) {
	
	$scope.allDept = [];
	$scope.UserID = window.localStorage.getItem("loginDetails");
	
	if($scope.UserID == undefined || $scope.UserID == null ){
		window.location = "/visitor-Management-System/index.html";
	}
	
	$scope.getPlantCode = function(dept){
		$scope.plantCodeArray = [];
		angular.forEach(dept.deptPlantCode,function(value){
			$scope.plantCodeArray.push(value.plantCode);
		});
		dept.plantCode = $scope.plantCodeArray.join();
		$timeout(function() {
			$('#dataTable').DataTable();
		   }, 200);
	};

	$scope.viewAllDept = function(){
		$http.post("/visitor-Management-System/Department/viewAllDept").then(function mySuccess(response){
			console.log(response.data);
			$scope.allDept = response.data;
			angular.forEach($scope.allDept,function(value){
				$scope.getPlantCode(value);
			});
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.getAllPlants = function(){
		$http.post("/visitor-Management-System/Plant/viewAllPlant").then(function mySuccess(response){
			console.log(response.data);
			$scope.allPlants = response.data;
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.viewAllDept();
	$scope.getAllPlants();
	
	$scope.viewSelectedDept = function(dept){
		$scope.viewDept = dept;
	};
	
	$scope.editSelectedDept = function(dept){
		$scope.editedDept = angular.copy(dept);
	};
	
	$scope.dtlSelectedDept = function(dept){
		$scope.deptToBeDeleted = dept;
	};
	
	$scope.addNewDept = function(){
		if($scope.addForm.$valid){
			$scope.newDept.regBy = $scope.UserID;
			$http.post("/visitor-Management-System/Department/addNewOrEditDept", $scope.newDept).then(function mySuccess(response){
				$('#addNewDeptModal').modal('hide');
				$scope.viewAllDept();
			}, function myError(data){
				console.log("some internal error");
				console.log(data);
			});
		}
	};
	
	$scope.editDept = function(){
		if($scope.editForm.$valid){
			$scope.editedDept.regBy = $scope.UserID;
			$http.post("/visitor-Management-System/Department/addNewOrEditDept", $scope.editedDept).then(function mySuccess(response){
				$('#editDeptModal').modal('hide');
				$scope.viewAllDept();
			}, function myError(data){
				console.log("some internal error");
				console.log(data);
			});
		}
	};
	
	$scope.deleteDept = function(){
		$scope.deptToBeDeleted.regBy = $scope.UserID;
		$http.post("/visitor-Management-System/Department/deleteDept", $scope.deptToBeDeleted).then(function mySuccess(response){
			$scope.viewAllDept();
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
});