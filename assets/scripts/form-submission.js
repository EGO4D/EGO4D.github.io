function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
  
$(document).ready(function() {

    // Handle form submission.
    $("#submit-btn").click(function(e) {

        var email = $("#email").val(),
            utcSeconds = Date.now() / 1000,
            timestamp = new Date(0);

        e.preventDefault();

        $('#submit-btn').prop('disabled', true);
        $('#submit-btn').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>  Document requested.</button>');

        if (validateEmail(email)) {
            timestamp.setUTCSeconds(utcSeconds);
        
            var data = JSON.stringify({
            'email': email,
            'type': "FORM REQUEST",
            'optTimestamp': timestamp.toString()
            });

            console.log(data);
        
            $.ajax({
                type: 'POST',
                url: 'https://s08dq85nfd.execute-api.eu-west-1.amazonaws.com/Development/request-document',
                contentType: 'application/json',
                data: data,
                success: function(res) {
                    $('#form-response').html('<div class="mt-3 alert alert-success" role="alert">Document request successful. Please check your email.</div>');
                    $('#submit-btn').text('Didn\'t receive an email? Request Again.');
                    $('#submit-btn').prop('disabled', false);
                    console.log(res);
                },
                error: function(res, status, exception) {
                    $('#form-response').html('<div class="mt-3 alert alert-danger" role="alert">An error occurred. Please try again later.</div>');
                    $('#submit-btn').text('Request Form');
                    $('#submit-btn').prop('disabled', false);
                    console.log(res);
                }
            });
        } else {
            $('#form-response').html('<div class="mt-3 alert alert-danger" role="alert">Invalid email, please enter a valid email.</div>');
            $('#submit-btn').text('Request Form');
            $('#submit-btn').prop('disabled', false);
        }
        return false;
    });
});