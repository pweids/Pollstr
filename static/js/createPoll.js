$(document).ready(function() {
    var numCandidates = 2;
   $('#newCandidate').click(function(e) {
       e.preventDefault();
       numCandidates += 1;
       $('#candidates').append('<p><input type="text" name="candidates" placeholder="Candidate '+numCandidates+'" /></p>')
       $('#numWinners').append('<option value="'+numCandidates+'">'+numCandidates+'</option>');
   }); 
   
   
   //AJAX METHOD BELOW -- NOT NECESSARY THOUGH
   $('form').submit(function(e) {
       e.preventDefault();
       
       
       var o = {};
       var a = $(this).serializeArray();
       $.each(a, function() {
           if (o[this.name] !== undefined) {
               if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        
        console.log(o);
        /*
        $.ajax({
           url: '/createPoll',
           data: o,
           cache: false,
           type: 'POST',
           success: function(data){alert(JSON.stringify(data));},
           error: function(xhr, status, err){alert(JSON.stringify(data))}
           }); 
       */
       return false;
   });
});