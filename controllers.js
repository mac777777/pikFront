var apka = angular.module('apka', ['ngRoute','ngCookies','uiGmapgoogle-maps']);

apka.config(
    ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
        GoogleMapApiProviders.configure({
            key: 'AIzaSyDX1wDnU65Eq_WKGLh7EbzBP4lNvg5iIKQ'
        });
        }
    ]);


/////////////////////////////////////////////////////////////////////////////////
//KONTROLER SAMEJ MAPY
/////////////////////////////////////////////////////////////////////////////////



apka.controller('mainCtrl', function($scope, $cookies,$http) {
  $scope.map = {center: {latitude: 52.23, longitude: 21.01 }, zoom: 12 };
  $scope.lati="Punkt";
  $scope.long="nieznany - nie udostępniono informacji o położeniu";
  $scope.buttonDisabled=1;
  
  var obj;
  
  //$scope.msg="";
  $scope.msgload="";
  $scope.point="-";
    
  $scope.marker = [ //jakies pierwsze przykladowe punkty
    {
      id: 0,
      name: "Punkt0",
      coords: {
        latitude: 52.235,
        longitude: 21.012
      },
      options: { draggable: false },
    },
    {
          id: 1,
          name: "Punkt2",
      coords: {
        latitude: 52.238,
        longitude: 21.012
      },
      options: { draggable: false },
    }
  ];
  
  $scope.marker2 = [];
  
  function loadPoints() {
 
  
   var result = $http.get("http://45.76.87.200/get/points");
    result.then(function successCallback(response) {

      //$scope.msgload=response;
     
      for (i = 0; i < response.data.length; i++) {
      
        $scope.marker2[i]={
          id:response.data[i].id,
          name:response.data[i].name,
          coords: {
            latitude: response.data[i].latitude,
            longitude: response.data[i].longitude
          },
          events: {
            click: function(marker, eventName, model) {
              var txt=model.name + " (" + model.coords.latitude + "," + model.coords.longitude + ")";
              $scope.point=txt;
            }
          },
          options: {
          draggable:false,
          }
        };
        
      }
      
      $scope.$apply();
      
    
      }, function errorCallback(response) {
        $scope.msgload="Problem z polaczeniem z serwerem.";
      });
    
    }
    
    window.onload = loadPoints();

  

       
  if (navigator.geolocation) { //proba geolokalizacji
    navigator.geolocation.getCurrentPosition(showPosition); //jesli sie udalo - uruchamia funkcje showPosition
  }      
    
  function showPosition(position) { //zmienna position ma w sobie wspolrzedne
    $scope.buttonDisabled=0;
    $scope.lati=position.coords.latitude;
    $scope.long=position.coords.longitude;
    
      var newid=$scope.marker2.length;
      
    $scope.marker2[newid]= {
      id:newid+1,
      name: "Aktualna lokalizacja",
      coords: {
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
      },
      //icon: "http://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", //na razie nie dziala
      options: {draggable:false,
      icon:'marker.png'
      },
        
    };
      
    $scope.$apply(); //odswiezenie angulara
  }
    
  $scope.msg="";  

    
  $scope.dodaj = function() {
    var url3="http://45.76.87.200/add/user/points?latitude="+$scope.lati+"&longitude="+$scope.long+"&name="+ $scope.nazwa+"&login="+$cookies.login+"&jsonp=JSON_CALLBACK";
        $http({
      method: 'GET',
      url: url3,
      withCredentials: true
      }).then(function successCallback(response) { //sukces
          $scope.msg="Punkt zostal dodany!";
          loadPoints();
      }, function errorCallback(response) { //porazka
        $scope.msg="Wystapil blad!";
    });
  
  
  }
 
        
});








/////////////////////////////////////////////////////////////////////////////////
//KONTROLER LOGOWANIA
/////////////////////////////////////////////////////////////////////////////////


apka.controller('kontrolerZaloguj',fKontrolerZaloguj);
function fKontrolerZaloguj($scope,$http,$cookies,$location) {

  if($cookies.log==1) $scope.zalogowany="Jesteś już zalogowany! Przejdź do <a href='#!'>mapy</a>";
  
  $scope.zaloguj = function() { //proba zalogowania
  
    var url2="http://45.76.87.200/login/user?login="+$scope.login+"&passhash="+ $scope.pswd+"&jsonp=JSON_CALLBACK";

    $http({
      method: 'GET',
      url: url2,
      withCredentials: true
      }).then(function successCallback(response) { //sukces
          var logCookie = $cookies.log; //zmienna ciasteczkowa
          $cookies.log = 1;
          $cookies.login=$scope.login;
          $location.path('mapa'); //przeniesienie do podstrony mapy
      }, function errorCallback(response) { //porazka
        $scope.msg="Niepoprawny login lub haslo.";
        $scope.col="red";
    });

  }
}

/////////////////////////////////////////////////////////////////////////////////
//KONTROLER REJESTRACJI
/////////////////////////////////////////////////////////////////////////////////

apka.controller('kontrolerRejestracja',fKontrolerRejestracja);
function fKontrolerRejestracja($scope,$http,$cookies) {

  if($cookies.log==1) $scope.zalogowany="Jesteś już zalogowany! Przejdź do <a href='#!'>mapy</a>";
  
  $scope.zarejestruj = function() {
  
    if($scope.pswd1==$scope.pswd2) {

      var url="http://45.76.87.200/add/user?login="+$scope.login+"&passhash="+ $scope.pswd1;
      var res = $http.get(url);
      res.then(function successCallback(response) {
        $scope.msg="Dodano uzytkownika. Mozesz sie teraz zalogowac.";
        $scope.col="green";
      
      }, function errorCallback(response) {
        $scope.msg="Taki uzytkownik juz istnieje w bazie!";
        $scope.col="red";
      });
  
    }
    else {
      $scope.msg="Hasla nie sa zgodne.";
      $scope.col="red";
    }
      
  }

}



/////////////////////////////////////////////////////////////////////////////////
//KONTROLER MAPY (PODSTRONY)
/////////////////////////////////////////////////////////////////////////////////


apka.controller('kontrolerMapa',fKontrolerMapa);
function fKontrolerMapa($scope,$http,$cookies,$location) {


  if($cookies.log==1) $scope.login=$cookies.login;
  else $location.path('zaloguj');
  

  $scope.wyloguj = function() {
    var url="http://45.76.87.200/logout/user?login="+$scope.login;
    var res = $http.get(url);
    $cookies.log = 0;
    $cookies.login="";
    $location.path('zaloguj');
  }

}





/////////////////////////////////////////////////////////////////////////////////
//KONTROLER PROFILU
/////////////////////////////////////////////////////////////////////////////////


apka.controller('kontrolerProfil',fKontrolerProfil);
function fKontrolerProfil($scope,$http,$cookies,$location) {


  if($cookies.log==1) $scope.login=$cookies.login;
  else $location.path('zaloguj');
  
    $scope.msg="";
  
  
    $scope.marker2 = [];
  
  function loadPoints() {
 
  
   var result = $http.get("http://45.76.87.200/get/user/points"); //get/user/points
    result.then(function successCallback(response) {

      //$scope.msgload=response;
     
      for (i = 0; i < response.data.length; i++) {
      
        $scope.marker2[i]={
          id:response.data[i].id,
          name:response.data[i].name,
          coords: {
            latitude: response.data[i].latitude,
            longitude: response.data[i].longitude
          },
          events: {
            click: function(marker, eventName, model) {
              var txt=model.name + " (" + model.coords.latitude + "," + model.coords.longitude + ")";
              $scope.point=txt;
            }
          },
          options: {
          draggable:false,
          }
        };
        
      }
      
      $scope.marker2.splice(i, 1);
      
      $scope.$apply();
      
    
      }, function errorCallback(response) {
        //$scope.msgload="Problem z polaczeniem z serwerem.";
        $scope.msgload=response;
      });
    
    }
    
    window.onload = loadPoints();
  
    $scope.usun = function(a) {
    
      var url="http://45.76.87.200/delete/user/points?id="+a;
      var res = $http.get(url);
      res.then(function successCallback(response) {
        $scope.msg="Usunięto punkt";
        loadPoints();
      
      }, function errorCallback(response) {
        $scope.msg="Problem z połączeniem z serwerem";
      });
      
    }
    
    $scope.usunkonto = function() {
    
      //sprawdzenie hasla!
      var url2="http://45.76.87.200/login/user?login="+$scope.login+"&passhash="+ $scope.pass+"&jsonp=JSON_CALLBACK";

      $http({
        method: 'GET',
        url: url2,
        withCredentials: true
        }).then(function successCallback(response) { //sukces
        $scope.usunpunkty();
        }, function errorCallback(response) { //porazka
        $scope.msgdelprofil="Niepoprawne haslo!";
      });
    
    } //usunkonto
    
    $scope.usunpunkty = function() {
      var i;
      var res;
      
      //najpierw usuwamy punkty
      for (i = 0; i < $scope.marker2.length; ++i) {
        var url="http://45.76.87.200/delete/user/points?id="+$scope.marker2[i].id;
        res = $http.get(url);
      }
      
      res.then(function successCallback(response) {
        $scope.usunsamokonto();
      }, function errorCallback(response) { //porazka
      
     
      });
    
    }    
    
    
    $scope.usunsamokonto = function() {
      var url="http://45.76.87.200/delete/user?login="+$scope.login + "&passhash=" + $scope.pass;
      var res2 = $http.get(url);
      
      res2.then(function successCallback(response) {
      $cookies.log = 0;
      $cookies.login="";
      $location.path('zaloguj');
      
      }, function errorCallback(response) {
        $scope.msgdelprofil="Blad. Upewnij sie, czy masz polaczenie z internetem!";
      });
        
    }
    
        




}