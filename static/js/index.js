$(document).ready(function() {
   
   function ajaxFormJSON(json, url, onSuccess, onError){
       var data = new FormData();
       for (var key in json){
           data.append(key, json[key]);
       }
       
       $.ajax({
           url: url,
           data: data,
           cache: false,
           contentType: false,
           processData: false,
           type: 'POST',
           success: onSuccess,
           error: onError
       });
   }
   /**
   $('#register').click(function(e) {
       e.preventDefault();
       var username = $('#regUsername').val();
       var password = $('#regPassword').val();
       var passwordConfirm = $('#regPassConfirm').val();
       
       this.submit();
       
       /**
       ajaxFormJSON(
           {
               username: username,
               password: password,
               passwordConfirm: passwordConfirm
           },
           '/register',
           function success(data){
               alert(JSON.stringify(data));
           },
           function error(xhr, status, err){
               alert(JSON.stringify(err));
           });
           **/
});