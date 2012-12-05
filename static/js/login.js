$(document).ready( function() {
   $('#paul').click(function(e) {
       $.ajax({
           url: '/login',
           data: {username:'paulw@cmu.edu',
           password:'hi'},
           type: 'POST',
           success:function(res) {
               window.location.href = '/home';
           }
       });
   });
   
   $('#tim').click(function(e) {
       $.ajax({
           url: '/login',
           data:{username:'tim@tim.com',
           password:'hi'},
           type:"POST",
           success:function(res) {
               window.location.href = "/home";
           }
       })
   }) 
});