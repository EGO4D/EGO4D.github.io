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
                'email': email,
                'rerequest': rerequest
            });

            console.log(data);

            $.ajax({
                type: 'POST',
                url: 'https://s08dq85nfd.execute-api.eu-west-1.amazonaws.com/RequestHandler/request-document',
                contentType: 'application/json',
                data: data,
                success: function(res) {
                    var requestStatus = res.headers["Request-Status"];
                    if (requestStatus === "New" || requestStatus === "RejectionCleared") {                   
                        responseTextElement.html('<div class="mt-3 alert alert-success" role="alert">Document request successful! Please check your email including your Junk mail.</div>');
                        $('#submit-btn').text('Didn\'t receive an email? Request Again.');
                    } else if (requestStatus === "Requested") {                   
                        responseTextElement.html('<div class="mt-3 alert alert-success" role="alert">Rerequest for this email has been sent. Please ensure you are also checking your Junk mail.</div>');
                        $('#submit-btn').text('Didn\'t receive an email? Request Again.');
                    } else if (requestStatus === "Pending") {                    
                        responseTextElement.html('<div class="mt-3 alert alert-success" role="alert">This licenses for this email have already been signed and are currently being processed. Please allow for up to 3 days from when the licenses were signed to hear back regarding your requests status</div>');
                        $('#submit-btn').text('Request Form.');
                    } else if (requestStatus === "Approved") {                    
                        responseTextElement.html('<div class="mt-3 alert alert-success" role="alert">This licenses for this email have already been approved. There is no need for another request.</div>');
                        $('#submit-btn').text('Request Form.');
                    } else if (requestStatus === "Rejected") {                    
                        responseTextElement.html('<div class="mt-3 alert alert-danger" role="alert">This licenses for this email were recently rejected. Please allow up to 7 days since notifcation of the rejection to request again.</div>');
                        $('#submit-btn').text('Request Form.');
                    } else if (requestStatus === "Bounced") {                    
                        responseTextElement.html('<div class="mt-3 alert alert-danger" role="alert">We are unable to succesfully deliver to this email address. Please try again with another email address.</div>');
                        $('#submit-btn').text('Request using a new email.');
                    } else if (requestStatus === "RequestDenied") {                    
                        responseTextElement.html('<div class="mt-3 alert alert-danger" role="alert">Too many requests have been made for this email. If you have still not received a link for the licenses, please contact uob-ego4d-info@bristol.ac.uk to resolve the issue.</div>');
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
