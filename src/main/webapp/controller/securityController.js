app.controller('securityController', function($scope, $rootScope, $http,$timeout) {
	
	$scope.UserID = window.localStorage.getItem("loginDetails");
	$scope.UserName = window.localStorage.getItem("userName");
	
	if($scope.UserID == undefined || $scope.UserID == null ){
		window.location = "/visitor-Management-System/index.html";
	};
	
	if($rootScope.visitCheckin == undefined || $rootScope.visitCheckin == null){
		window.location = "#!secDashboard";
	}else{
		$( "#Loader" ).modal("show");
	}
	
	$scope.enableCheckOut = false;
	$scope.enableCheckIn = false;
	if($rootScope.visitCheckin.meetingBooked.visitor.batchStatus == "submited"){
		$scope.enableCheckOut = true;
	}
	window.localStorage.setItem("pagePosition", "FromSecurityPage");
	$scope.addAssetArrayList = [];
	$scope.addCoVisitorAssetArrayList = [];
	$scope.showAddAsset = false;
	$scope.showAddCovisitorAsset = false;
	
	$scope.viewAllCoVisitor = function(){
		$scope.enableCheckIn = true;
		$scope.showAddAsset = false;
		$scope.showAddCovisitorAsset = false;
		$rootScope.visitCheckin.enableVisitorCheckOut = true;
		$http.post("/visitor-Management-System/Security/viewAllCoVisitor", $rootScope.visitCheckin).then(function mySuccess(response){
			console.log(response.data);
			$scope.allCoVisitor = response.data;
			if($scope.allCoVisitor.length > 0){
				angular.forEach($scope.allCoVisitor,function(coVisitor){
					coVisitor.allowCheckOut = true;
					if(coVisitor.coVisitorImage == null){
						$scope.enableCheckIn = false;
					}
					$http.post("/visitor-Management-System/Security/getAllAsset", coVisitor).then(function mySuccess(response){
						angular.forEach(response.data,function(asset){
							if(!asset.deliveredFlag){
								coVisitor.allowCheckOut = false;
								$rootScope.visitCheckin.enableVisitorCheckOut = false;
							};
						});
						$timeout(function() {
							$("#Loader").modal("hide");
						   }, 3000);
					}, function myError(data){
						console.log("some internal error");
						console.log(data);
					});
				});
			}else{
				$timeout(function() {
					$("#Loader").modal("hide");
				   }, 3000);
			}
		}, function myError(data){
			$timeout(function() {
				$("#Loader").modal("hide");
			   }, 3000);
			console.log("some internal error");
			console.log(data);
		});
		if($rootScope.visitCheckin.enableVisitorCheckOut){
			$http.post("/visitor-Management-System/Security/getVisitAllAsset", $scope.visitCheckin.meetingBooked.visitor).then(function mySuccess(response){
				var allAsset = response.data;
				angular.forEach(allAsset,function(value){
					if(!value.deliveredFlag){
						$rootScope.visitCheckin.enableVisitorCheckOut = false;
					};
				});
			}, function myError(data){
				console.log("some internal error");
				console.log(data);
			});
		}
		if($scope.enableCheckIn){
			if($rootScope.visitCheckin.meetingBooked.visitor.visitorImage == null){
				$scope.enableCheckIn = false;
			}
		}
	
	};
	$scope.viewAllCoVisitor();
	
	$scope.addCoVistor = function(){
		$scope.invalidMobile = false;
		if($scope.addForm.$valid){
			if(!isNaN($scope.newVisitor.coVisitorContact) && angular.isNumber(+$scope.newVisitor.coVisitorContact)){
				$scope.newVisitor.secCheckin = true;
				$scope.newVisitor.visitor = $rootScope.visitCheckin.meetingBooked.visitor;
				$scope.newVisitor.createdBy = $scope.UserID;
				$http.post("/visitor-Management-System/Security/addCoVisitor", $scope.newVisitor).then(function mySuccess(response){
					$('#addCoVisitorModal').modal('hide');
					$scope.viewAllCoVisitor();
					console.log(response.data);
				}, function myError(data){
					console.log("some internal error");
					console.log(data);
				});
			}else{
				$scope.invalidMobile = true;
			};
			
		}else{
			if(!isNaN($scope.newVisitor.coVisitorContact) && !angular.isNumber(+$scope.newVisitor.coVisitorContact)){
				$scope.invalidMobile = true;
			};
		};
	};
	
	
	
	$scope.getCovisitorAsset = function(selectedCoVisitor){
		$scope.selectedCoVisitor = selectedCoVisitor;
		$http.post("/visitor-Management-System/Security/getAllAsset", selectedCoVisitor).then(function mySuccess(response){
			$scope.allAsset = response.data;
			$scope.newAsset={};
			//$('#viewAssetModal').show();
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	}
	
	$scope.getVisitorAsset = function(){
		$http.post("/visitor-Management-System/Security/getVisitAllAsset", $scope.visitCheckin.meetingBooked.visitor).then(function mySuccess(response){
			$scope.allAsset = response.data;
			$scope.newVisitorAsset={};
			$('#viewVisitorAssetModal').modal('show');
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	}
	
	$scope.addAsset = function(asset){
		asset.assetStatus = "Checked";
		asset.deliveredFlag = false;
		asset.visitor = $scope.selectedCoVisitor;
		$http.post("/visitor-Management-System/Security/addCoVisitorAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getCovisitorAsset($scope.selectedCoVisitor);
				$scope.showAddCovisitorAsset = false;
				for(var i = 0; i < $scope.addCoVisitorAssetArrayList.length; i++){
					if($scope.addCoVisitorAssetArrayList[i].assetName == asset.assetName){
						$scope.addCoVisitorAssetArrayList.splice(i, 1);
					}
				};
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.addVisitorAsset = function(asset){
		asset.assetStatus = "Checked";
		asset.deliveredFlag = false;
		asset.mainVisitor = $scope.visitCheckin.meetingBooked.visitor;
		$http.post("/visitor-Management-System/Security/addCoVisitorAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.showAddAsset = false;
				$scope.getVisitorAsset();
				for(var i = 0; i < $scope.addAssetArrayList.length; i++){
					if($scope.addAssetArrayList[i].assetName == asset.assetName){
						$scope.addAssetArrayList.splice(i, 1);
					}
				};
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	
	$scope.addAssetArray = function(){
		if(($scope.newVisitorAsset.assetName != undefined && $scope.newVisitorAsset.assetCount != undefined) && 
				($scope.newVisitorAsset.assetName != "" && $scope.newVisitorAsset.assetCount != "")){
			$scope.addAssetArrayList.push($scope.newVisitorAsset);
		};
		$scope.newVisitorAsset={};
		$scope.showAddAsset = true;
	};
	
	$scope.addCovisitorAssetArray = function(){
		if(($scope.newAsset.assetName != undefined && $scope.newAsset.assetCount != undefined) && 
				($scope.newAsset.assetName != "" && $scope.newAsset.assetCount != "")){
			$scope.addCoVisitorAssetArrayList.push($scope.newAsset);
		};
		$scope.newAsset={};
		$scope.showAddCovisitorAsset = true;
	};
	
	$scope.deliverAsset = function(asset){
		asset.assetStatus = "Verified";
		asset.deliveredFlag = true;
		$http.post("/visitor-Management-System/Security/addCoVisitorAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getCovisitorAsset($scope.selectedCoVisitor);
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.deliverVisitorAsset = function(asset){
		asset.assetStatus = "Verified";
		asset.deliveredFlag = true;
		$http.post("/visitor-Management-System/Security/addCoVisitorAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getVisitorAsset();
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.selectedCoVisitorForCheckout = function(selectedCoVisitor){
		$scope.selectedCoVisitor = selectedCoVisitor;
		/*if($scope.selectedCoVisitor.seccheckout){
			alert('already checked out')
		}else{
			$('#checkoutModal').show();
		}*/
	}
	
	$scope.checkoutCoVisitor = function(){
		$scope.selectedCoVisitor.seccheckout = true;
		$http.post("/visitor-Management-System/Security/addCoVisitor", $scope.selectedCoVisitor).then(function mySuccess(response){
			$('#checkoutModal').modal('hide');
			$scope.viewAllCoVisitor();
			console.log(response.data);
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
		
	};
	
	$scope.take_snapshot = function() {
		 
		 // take snapshot and get image data
		 Webcam.snap( function(data_uri) {
		  // display results in page
			$scope.visitorImg = data_uri;
		  document.getElementById('results').innerHTML = 
		  '<img src="'+data_uri+'"/>';
		  } );
		};
		
		$scope.closeCaptureImage = function(){
			$scope.checkBatch = "";
			Webcam.reset();
		};
	
	$scope.saveVisitorImage = function(){
		
		if($scope.visitorImg != null && $scope.visitorImg != undefined){
			$scope.image = [];
			$scope.image = $scope.visitorImg.split(",");
			console.log("appInstalled:",$scope.appInstalled);
			console.log("batchNo: ",$scope.batchNo);
			
			if($scope.picOf == 'visitor'){
				$rootScope.visitCheckin.meetingBooked.visitor.batchNo = $scope.batchNo;
				$rootScope.visitCheckin.meetingBooked.visitor.batchStatus = "assigned";
				$rootScope.visitCheckin.meetingBooked.visitor.arogyaPresent = $scope.appInstalled;
				$rootScope.visitCheckin.meetingBooked.visitor.bodyTemperature = $scope.temperature;
				$rootScope.visitCheckin.meetingBooked.visitor.visitorImage = $scope.image[1];
				$http.post("/visitor-Management-System/Security/addVisitorImage", $rootScope.visitCheckin).then(function mySuccess(response){
					$scope.checkBatch = response.data.data;
					if(response.data.data != "BatchPresent"){
						$('#captureImageModal').modal('hide');
						$scope.viewAllCoVisitor();
						Webcam.reset();
					}
				}, function myError(data){
					console.log("some internal error");
					console.log(data);
				});
			}else{
				$scope.captureCoVisitor.batchNo = $scope.batchNo;
				$scope.captureCoVisitor.batchStatus = "assigned";
				$scope.captureCoVisitor.arogyaPresent = $scope.appInstalled;
				$scope.captureCoVisitor.bodyTemperature = $scope.temperature;
				$scope.captureCoVisitor.coVisitorImage = $scope.image[1];
				$http.post("/visitor-Management-System/Security/addCoVisitorImage", $scope.captureCoVisitor).then(function mySuccess(response){
					$scope.checkBatch = response.data.data;
					if(response.data.data != "BatchPresent"){
						$('#captureImageModal').modal('hide');
						$scope.viewAllCoVisitor();
						Webcam.reset();
					}
				}, function myError(data){
					console.log("some internal error");
					console.log(data);
				});
			}
		}
	};
	
	$scope.sendMail = function(){
		$rootScope.visitCheckin.secCheckinBy = $scope.UserName;
		$http.post("/visitor-Management-System/Employee/sendEmail", $rootScope.visitCheckin).then(function mySuccess(response){
			$('#emailModal').modal('show');
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.securityCheckout = function(){
		//$( "#Loader" ).modal("show");
		$rootScope.visitCheckin.secCheckoutBy = $scope.userName;
		$http.post("/visitor-Management-System/Security/securityCheckout", $rootScope.visitCheckin).then(function mySuccess(response){
			if(response.data.msg == 'SUCCESS'){
				$http.post("/visitor-Management-System/Employee/sendEmail", $rootScope.visitCheckin).then(function mySuccess(response){
					//$('#emailModal').modal('show');
				}, function myError(data){
					console.log("some internal error");
					console.log(data);
				});
				window.location = "#!secDashboard";
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.securityCheckin = function(){
		//$( "#Loader" ).modal("show");
		$rootScope.visitCheckin.secCheckinBy = $scope.userName;
		$http.post("/visitor-Management-System/Security/securityCheckin", $rootScope.visitCheckin).then(function mySuccess(response){
			if(response.data.msg == 'SUCCESS'){
				//$( "#Loader" ).modal("hide");
				//$rootScope.visitCheckin.secCheckinBy = $scope.UserName;
				$http.post("/visitor-Management-System/Employee/sendEmail", $rootScope.visitCheckin).then(function mySuccess(response){
					//$('#emailModal').modal('show');
				}, function myError(data){
					console.log("some internal error");
					console.log(data);
				});
				
				window.location = "#!secDashboard";
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.captureCoVisitorMethod = function(coVisitor){
		Webcam.attach( '#my_camera' );
		$scope.picOf = "coVisitor";
		$scope.batchNo = "";
		$scope.appInstalled = "";
		$scope.temperature = 0;
		$scope.captureCoVisitor = coVisitor;
		$scope.checkBatch = "";
		$( "#captureImageModal" ).modal("show");
	};
	
	$scope.captureVisitorMethod = function(){
		Webcam.attach( '#my_camera' );
		$scope.picOf = "visitor";
		$scope.batchNo = "";
		$scope.appInstalled = "";
		$scope.temperature = 0;
		$scope.checkBatch = "";
		$( "#captureImageModal" ).modal("show");
	};
	
	$scope.submitBatch = function(){
		$http.post("/visitor-Management-System/Security/submitBatch", $rootScope.visitCheckin).then(function mySuccess(response){
			if(response.data.msg == 'SUCCESS'){
				$scope.enableCheckOut = true;
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.deleteVisitorAsset = function(asset){
		$http.post("/visitor-Management-System/Security/deleteAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getVisitorAsset();
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
	$scope.deleteAsset = function(asset){
		$http.post("/visitor-Management-System/Security/deleteAsset", asset).then(function mySuccess(response){
			if(response.data.msg == "SUCCESS"){
				$scope.getCovisitorAsset($scope.selectedCoVisitor);
			}
		}, function myError(data){
			console.log("some internal error");
			console.log(data);
		});
	};
	
});