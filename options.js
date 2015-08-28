$("form").on('submit', function (e)
{
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var params =
    {
        username: username,
        password: password
    };

    //connect to online php file and obtain token, decode and store using chrome.storage.sync.set

    $.ajax({
        type: "POST",
        url: "https://www.cryptmate.com/processing/rest.php",
        data: params,
        success: function(data, status){
            var returndata = JSON.parse(data);
            switch (returndata.returntype)
            {
                case "error":
                    alert(returndata.error);
                    break;
                case "token":
                    chrome.storage.sync.set({'token': returndata.token}, function()
                    {
                        alert ("Logged in successfully");
                    });
                    break;
                case "subscriptionended":
                    chrome.storage.sync.set({'subscriptionended': true}, function(){});
                    break;
            }
        },
        error: function(){}
    });

    return false;
});

function logout()
{
    chrome.storage.sync.remove('token', function(){});
}

document.getElementById("logout").onclick = logout;

$(document).ready(function() {
    chrome.storage.sync.get('token', function(data)
    {
        if (typeof data.token == 'undefined')
        {
            $("#logout").hide();
            $("#login").show();
        }
        else
        {
            $("#login").hide();
            $("#logout").show();
        }
    });
});