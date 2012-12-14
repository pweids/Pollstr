$(document).ready(function() {    
        $( "#sortable" ).sortable({
        }).addTouch();
        $( "#sortable" ).disableSelection();
        
        
        
        ajaxFormJSON = function(data) {
            $.ajax({
                url: '/vote',
                async: false,
                cache: false,
                data: data,
                statusCode: {
                    401: function(){alert('You have already voted');}
                },
                type: 'POST',
                success:function(res) {
                    alert("Vote successful");
                }
             });
        }
        
        $('#submit').click(function(e) {
            var vote = $('#isChecked').attr('checked') ? ['_abstain_'] : $("#sortable").sortable('toArray');
            var data = {
                uid:$('#uid').html(),
                pid:$('#pid').html(),
                candidate: vote
                };
            $("#sortable").sortable("disable");
            $('#sortable li').css('color', '#ccc');
            $('#isChecked').attr('disabled', 'true');
            $(this).attr("disabled", 'true');
            $(this).attr('value', "Vote Received");
            $(this).unbind("click");
            
            ajaxFormJSON(data);
        });
        
        $("form").submit(function(e){
            e.preventDefault();
            var data = $(this).serialize();
            console.log(data);
            ajaxFormJSON(data);
           
    });
});
