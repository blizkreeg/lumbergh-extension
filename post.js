console.log("background script ready");

var refresh_bg_page_timeout_id = "undefined";
refresh_bg_page_timeout_id = window.setTimeout(refresh_bg_page, 50000);

document.addEventListener('DOMContentLoaded', function() {
  // document.querySelector('#testRequest').addEventListener('click', testRequest);
  // document.querySelector('#testConnect').addEventListener('click', testConnect);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

    switch(request.greeting) {
      case "gimmetasks":
        console.log("got a request for tasks.");
        if(last_task_update) {
          sendResponse({data: window.tasks});
          last_task_update = false;
        } else {
          sendResponse({data: undefined});
        }
        return true;
        break;
      case "gimmeloginstatus":
        console.log("got a request for login status");
        cookie = initialize_email_cookie();
        chrome.cookies.get(cookie, function(c) {
          console.log(c);
          if(c == null) {
            sendResponse({status: "false"});
          } else {
            if(c.value.indexOf(request.email) == -1) {
              sendResponse({status: "false"});
            } else {
              console.log("got email cookie");
              sendResponse({status: "true"});
            }
          }
        });
        return true;
        break;
      case "gimmetabid":
        sendResponse({status: sender.tab.id});
        return true;
        break;
    }
});

// chrome.tabs.getSelected(null, function(tab) {
//   chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });

function set_window_cookie_status() {
  console.log("setting cookie");
  cookie = {};
  cookie.name = "lumbergh_email";
  cookie.url = "https://mail.google.com";
  if(chrome.cookies.get(cookie, function(c){
    if(c == null) {
      window.task_status = "Your tasks are being processed...";
    }
  }));
}

function refresh_bg_page() {
  // set_window_cookie_status();
  window.clearTimeout(refresh_bg_page_timeout_id);
  refresh_bg_page_timeout_id = window.setTimeout(refresh_bg_page, 30000);
  document.location.reload();
}
