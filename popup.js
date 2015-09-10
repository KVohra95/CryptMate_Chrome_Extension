var url = "";
var domain = "";
var token = "";
var newpassword = "";
var subscriptionended = false;
var params = {};
var passwordform = $("#password");
var newpasswordform = $("#newpassword");
var confirmpasswordform = $("#confirmpassword");
var generatedpasswordform = $("#generatedpassword");
var createnewpassworddiv = $("#createnewpassword");
var generatepassworddiv = $("#generatepassword");
var showpassworddiv = $("#showpassword");
var errordiv = $("#error");
var formsdiv = $("#forms");
var linkdomains = $("#linkdomains");

$(document).ready(function() {

    $("form").on('submit', function (e) {
        switch (e.target.id) {
            case "createnewpassword":
                var newpassword = newpasswordform.val();
                var confirmpassword = confirmpasswordform.val();
                var linkeddomain = linkdomains.find("option:selected").text();

                if (newpassword == confirmpassword) {
                    params =
                    {
                        token: token,
                        password: newpassword,
                        domain: domain,
                        newpassword: 1,
                        linkeddomain: linkeddomain
                    };

                    $.ajax({
                        type: "POST",
                        url: "https://www.cryptmate.com/processing/rest.php",
                        data: params,
                        success: function (data, status) {
                            var returndata = JSON.parse(data);
                            switch (returndata.returntype) {
                                case "error":
                                    error(returndata.error);
                                    break;
                                case "password":
                                    clearAll();
                                    createnewpassworddiv.hide();
                                    generatepassworddiv.hide();
                                    showpassworddiv.show();
                                    generatedpasswordform.val(returndata.hash);
                                    break;
                            }
                        },
                        error: function () {
                            error("Internet connection failure, please try again when internet connection is active")
                        }
                    });
                }
                else {
                    error("Passwords do not match");
                }
                break;
            case "generatepassword":
                var password = passwordform.val();
                params =
                {
                    token: token,
                    password: password,
                    domain: domain,
                    newpassword: 0
                };

                $.ajax({
                    type: "POST",
                    url: "https://www.cryptmate.com/processing/rest.php",
                    data: params,
                    success: function (data, status) {
                        var returndata = JSON.parse(data);
                        switch (returndata.returntype) {
                            case "error":
                                error(returndata.error);
                                break;
                            case "password":
                                clearAll();
                                createnewpassworddiv.hide();
                                generatepassworddiv.hide();
                                showpassworddiv.show();
                                generatedpasswordform.val(returndata.hash);
                                break;
                        }
                    },
                    error: function () {
                        error("Internet connection failure, please try again when internet connection is active")
                    }
                });

                break;
        }
        return false;
    });

});


document.getElementById("copy").addEventListener("click", function ()
{
    var copyDiv = generatedpasswordform.val();
    copyDiv.focus();
    document.execCommand("SelectAll");
    document.execCommand("Copy", false, null);
});

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
                        error("Subscription has ended, please extend subscription to continue using the app");
                    }
                    else if (typeof token == 'undefined')
                    {
                        clearAll();
                        error("Not logged in, please log in from the addon options menu");
                    }
                    else
                    {
                        clearAll();
                        $("#forms").show();
                        showForms();
                    }
                });
});

function showForms()
{
    params =
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
                            error("Logged in account not recognised, please log in again from the addon options menu");
                        });
                    }
                    else
                    {
                        error(returndata.error);
                    }
                    break;

                case "newpassword":
                    if (returndata.newpassword)
                    {
                        clearAll();
                        errordiv.hide();
                        generatepassworddiv.hide();
                        showpassworddiv.hide();
                        createnewpassworddiv.show();

                        linkdomains.append($('<option></option>').val("").html(""));

                        var keyeddomains = returndata.keyeddomains;

                        $.each(keyeddomains, function(i)
                        {
                            linkdomains.append
                            (
                                $('<option></option>').val(keyeddomains[i]).html(keyeddomains[i])
                            );
                        });
                    }
                    else
                    {
                        clearAll();
                        errordiv.hide();
                        createnewpassworddiv.hide();
                        showpassworddiv.hide();
                        generatepassworddiv.show();
                    }
                    break;
            }
        },
        error: function(){}
    });
}

function clearAll()
{
    passwordform.value = "";
    newpasswordform.value = "";
    confirmpasswordform.value = "";
    generatedpasswordform.value = "";
}

function error(message)
{
    clearAll();
    errordiv.html(message);
    formsdiv.hide();
    errordiv.show();
}