$(document).ready(function() {
   window.deletePoll = function(pid) {
       if (confirm('Are you sure you want to delete this poll?'))
       $.ajax({
           url: '/delete',
           async: false,
           cache: false,
           data: {pid:pid},
           statusCode: {
               401: function(){alert('Unauthorized');},
               400: function(){alert('Error!');}
           },
           type: 'GET',
           success:function(res) {
                   setTimeout(window.location.href = res.redirect, 2000);
               }
       });
   }; 
   
   window.endPoll = function(pid) {
       if (confirm("Are you sure you want to end this poll? " +
       "Users will no longer be able to vote.")) {
           $.ajax({
               url: '/end',
               async: true,
               cache: false,
               data: {pid:pid},
               type: 'GET',
               success:function(res) {
                   alert(res);
                   document.location.replace("http://localhost:8080/myPolls")
               }
           });
       }
   };
   
   function saveText(elem) {
       var savetxt = elem.siblings('.candidate').children().val();
       elem.siblings('.candidate').html(savetxt);
       elem.html('Rename');
       elem.unbind('click');
       elem.click(function(e) {
           editText(elem);
       });
   }
   
   function editText(elem) {
       var txt = elem.siblings('.candidate').html();
       
       elem.siblings('.candidate').html("<input type='text' value='"+txt+"' />");
       elem.html("Save");
       elem.unbind('click');
       elem.click(function(e) {
           saveText(elem);
       });
   }
   
    $('.rename').click(function(e) {
        editText($(this));
    });
});