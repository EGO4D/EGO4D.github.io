function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
  
$(document).ready(function() {     
    var rerequest = false;

    // Handle form submission.
    $("#submit-btn").click(function(e) {

        var email = $("#email").val(),
            responseTextElement = $('#form-response');

        e.preventDefault();

        $('#submit-btn').prop('disabled', true);
        $('#submit-btn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Document requested.</button>');

        if (validateEmail(email)) {            
            responseTextElement.removeClass('hidden');
                                
            var data = JSON.stringify({
                'email': email
            });

            console.log(data);

            $.ajax({
                type: 'POST',
                url: 'https://s08dq85nfd.execute-api.eu-west-1.amazonaws.com/RequestHandler/request-document',
                contentType: 'application/json',
                data: data,
                success: function(res) {
                    var requestStatus = res.headers["Request-Status"];
                    if (requestStatus === "new" || requestStatus === "requested") {
                        responseTextElement.html(`<div class="mt-3 alert alert-success" role="alert">${res.body}</div>`);
                        $('#submit-btn').text('Didn\'t receive an email? Request Again.');
                    } else if (requestStatus === "pending" || requestStatus === "approved") {                   
                        responseTextElement.html(`<div class="mt-3 alert alert-success" role="alert">${res.body}</div>`);
                        $('#submit-btn').text('Request Form.');
                    } else {                    
                        responseTextElement.html(`<div class="mt-3 alert alert-danger" role="alert">${res.body}</div>`);
                        $('#submit-btn').text('Request Form.');
                    } 
                    $('#submit-btn').prop('disabled', false);
                    console.log(res);
                },
                error: function(res, status, exception) {
                    responseTextElement.html('<div class="mt-3 alert alert-danger" role="alert">An error occurred. Please try again later.</div>');
                    $('#submit-btn').text('Request Form');
                    $('#submit-btn').prop('disabled', false);
                    console.log(res);
                }
            });
        } else {
            responseTextElement.removeClass('hidden');
            responseTextElement.html('<div class="mt-3 alert alert-danger" role="alert">Invalid email, please enter a valid email.</div>');
            $('#submit-btn').text('Request Form');
            $('#submit-btn').prop('disabled', false);
        }
        return false;
    });
});
