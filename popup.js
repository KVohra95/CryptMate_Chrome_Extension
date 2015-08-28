var url = "";
var domain = "";
var token = "";
var newpassword = "";
var passwordform = document.getElementById('password');
var newpasswordform = document.getElementById('newpassword');
var confirmpasswordform = document.getElementById('confirmpassword');
var generatedpasswordform = document.getElementById('generatedpassword');

chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function (tabs)
{
    url = tabs[0].url;
    domain = url.match(/[^\/,\s\?#]+?\.[^\/,\s]+?(?=\/|\s|$|\?|#)/)[0];

    chrome.storage.sync.get(['token', 'subscriptionended'], function(data)
                {
                    token = data.token;
                    if (data.subscriptionended == true)
                    {
                        clearAll();
                        $("#forms").hide();
                        $("#loginprompt").hide();
                        $("#subscriptionended").show();

                    }
                    else if (typeof token == 'undefined')
                    {
                        clearAll();
                        $("#subscriptionended").hide();
                        $("#forms").hide();
                        $("#loginprompt").show();
                    }
                    else
                    {
                        clearAll();
                        $("#subscriptionended").hide();
                        $("#loginprompt").hide();
                        $("#forms").show();
                        showForms();
                    }
                });
});

function showForms()
{
    var params =
    {
        token: token,
        domain: domain
    };

    $.ajax({
        type: "POST",
        url: "https://www.cryptmate.com/processing/rest.php",
        data: params,
        success: function(data, status)
        {
            var returndata = JSON.parse(data);
            switch (returndata.returntype)
            {
                case "error":
                    if(returndata.error == "invalidtoken")
                    {
                        chrome.storage.sync.remove('token', function()
                        {
                            clearAll();
                            $("#forms").hide();
                            $("#loginprompt").show();
                        });
                    }
                    else
                    {
                        alert(returndata.error);
                    }
                    break;

                case "newpassword":
                    newpassword = returndata.newpassword;
                    if (newpassword)
                    {
                        clearAll();
                        $("#generatepassword").hide();
                        $("#showpassword").hide();
                        $("#createnewpassword").show();
                    }
                    else
                    {
                        clearAll();
                        $("#createnewpassword").hide();
                        $("#showpassword").hide();
                        $("#generatepassword").show();
                    }
                    break;
            }
        },
        error: function(){}
    });
}

$("form").on('submit', function (e)
{
    switch (e.target.id)
    {
        case "createnewpassword":
            var newpassword = document.getElementById('newpassword').value;
            var confirmpassword = document.getElementById('confirmpassword').value;
            if (newpassword == confirmpassword)
            {
                var params =
                {
                    token: token,
                    password: newpassword,
                    domain: domain,
                    newpassword: true
                };

                console.log(params);
                $.ajax({
                    type: "POST",
                    url: "https://www.cryptmate.com/processing/rest.php",
                    data: params,
                    success: function(data, status)
                    {
                        var returndata = JSON.parse(data);
                        switch (returndata.returntype)
                        {
                            case "error":
                                alert(returndata.error);
                                break;
                            case "password":
                                clearAll();
                                $("#createnewpassword").hide();
                                $("#generatepassword").hide();
                                $("#showpassword").show();
                                $("#generatedpassword").val(returndata.hash);
                                break;
                        }
                    },
                    error: function(){
                    }
                });
            }
            else
            {
                alert("Passwords do not match");
            }
            break;
        case "generatepassword":
            var password = document.getElementById('password').value;
            var params =
            {
                token: token,
                password: password,
                domain: domain,
                newpassword: false
            };

            $.ajax({
                type: "POST",
                url: "https://www.cryptmate.com/processing/rest.php",
                data: params,
                success: function(data, status)
                {
                    var returndata = JSON.parse(data);
                    switch (returndata.returntype)
                    {
                        case "error":
                            alert(returndata.error);
                            break;
                        case "password":
                            clearAll();
                            $("#createnewpassword").hide();
                            $("#generatepassword").hide();
                            $("#showpassword").show();
                            $("#generatedpassword").val(returndata.hash);
                            break;
                    }
                },
                error: function(){}
            });

            break;
    }
    return false;
});

function clearAll()
{
    passwordform.value = "";
    newpasswordform.value = "";
    confirmpasswordform.value = "";
    generatedpasswordform.value = "";
}