$ = jQuery.noConflict();

var PROCESS_TIMEOUT = 300; // 5 minutes

var last_task_update = false;

function initialize_email_cookie() {
  cookie = {};
  cookie.name = "lumbergh_email";
  cookie.url = "https://mail.google.com";

  return cookie;
}

function save_todos(obj) {
  last_task_update = true;
  window.tasks = obj.data;
}

function dontcare(obj) { }

function login_health_check(obj) {
  console.log(obj.email);
  chrome.cookies.remove({"url": "https://mail.google.com", "name": "lumbergh_email"});
  cookie = initialize_email_cookie();
  cookie.value = obj.email;
  chrome.cookies.set(cookie, check_cookie_status);
}

function check_cookie_status(cookie) {
  if(chrome.runtime.lastError != undefined) {
    console.log(chrome.runtime.lastError);
  }
}