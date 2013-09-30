$ = jQuery.noConflict();

SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvEUg7kVFrl8yi4rrAY1LbPheX3peFBbustx5D0LM60etf02Mg/exec'
METHOD_TASKS = '?method=tasks'
METHOD_PROCESS = '?method=process'
METHOD_STATUS = '?method=status'
TRAIN_PROCESS = '?method=train'

var get_tasks_timeout_id = "undefined";
var login_status_timeout_id = "undefined";
var tab_id_timeout_id = "undefined";
var task_button_timeout_id = "undefined";
var upper_nav_timeout_id = "undefined";
var last_update_time;
var email_address;

var tab_id;

function get_email_address() {
  email_address = $('span.gbps2:first').text();
}

function show_message_top(msg) {
  $('#lumbergh_dash').text(msg);
}

/* NOT USED

// function get_tab_id(response) {
//   console.log("tab id" + response.status);
//   if(response.status != undefined) {
//     if(response.status == "false") {
//     } else {
//       tab_id = response.status;
//       window.clearTimeout(tab_id_timeout_id);
//     }
//   } else {

//   }
// }

// function ping_for_tab_id() {
//   if(tab_id_timeout_id != "undefined") {
//     window.clearTimeout(tab_id_timeout_id);
//   }

//   console.log("asking for tab id");
//   chrome.runtime.sendMessage({greeting: "gimmetabid"}, get_tab_id);
//   console.log("pinging for tab id again in 30s...");
//   tab_id_timeout_id = window.setTimeout(ping_for_tab_id, 30000);
// }

*/

function process_login_status(response) {
  if(response != undefined && response.status != undefined) {
    if(response.status == "false") {
      show_login_link();
      fire_login_link();
    } else {
      console.log("is logged in");
      // $('button#gbqfb').after('<div id="lumbergh_dash" style="position:absolute;float:left;background-color:#ff7400;text-align:center;margin-left:25px;padding:1px 3px;">Lumbergh</div>');
      ping_for_tasks();
    }
  } else {

  }
}

function ping_for_login_status() {
  if(login_status_timeout_id != "undefined") {
    window.clearTimeout(login_status_timeout_id);
  }

  console.log("pinging for login status");
  console.log(email_address);
  chrome.runtime.sendMessage({greeting: "gimmeloginstatus", email: email_address}, process_login_status);
  console.log("pinging for login status again in 30s...");
  login_status_timeout_id = window.setTimeout(ping_for_login_status, 10000);
}

function get_tasks(response) {
  if(response != undefined && response.data != undefined) {
    console.log("got tasks. painting the window now.");
    window.tasks = response.data;
    paint_tasks();
    // show_message_top("");
  } else {
    // show_message_top("Your tasks are loading...");
  }
}

function ping_for_tasks() {
  if(get_tasks_timeout_id != "undefined") {
    window.clearTimeout(get_tasks_timeout_id);
  }

  console.log("asking for tasks");
  chrome.runtime.sendMessage({greeting: "gimmetasks"}, get_tasks);
  console.log("pinging for tasks again in 90s...");
  get_tasks_timeout_id = window.setTimeout(ping_for_tasks, 5000);
}

function add_task_event() {
  $('#addtask input[type="checkbox"]').on('click', function() {
    var $this = $(this);
    var mid = $this.attr("id");

    $.ajax({
      url: SCRIPT_URL + TRAIN_PROCESS + '&id=' + mid + '&is_task=' + 'true',
      type: 'GET',
      dataType: "script"
    });
  });
}

function add_onclick_event() {
  $('#todo input[type="checkbox"]').on('click', function() {
    var $this = $(this);
    var mid = $this.attr("id");

    $.ajax({
      url: SCRIPT_URL + METHOD_STATUS + '&id=' + mid + '&status=' + 'true',
      type: 'GET',
      dataType: "script"
    });

    $this.closest('p').hide();
  });
}

function add_nontask_event() {
  $('a.not_task').on('click', function(e) {
    e.preventDefault();
    var $this = $(this);
    var mid = $this.attr("id");

    $.ajax({
      url: SCRIPT_URL + TRAIN_PROCESS + '&id=' + mid + '&is_task=' + 'false',
      type: 'GET',
      dataType: "script"
    });

    $this.closest('p').hide();
  });
}

$(document).ready(function (){
  get_email_address();
  add_lumbergh_dash();
  ping_for_login_status();
  // ping_for_tab_id();
  $(window).hashchange(function(){
    task_button_timeout_id = window.setTimeout(show_task_button_in_message, 3000);
    ping_for_tasks();
    $messages_table = $('div.UI');
    $messages_table.css({"width": "80%", "float": "left"});
  });
});

function add_lumbergh_dash() {
  if(upper_nav_timeout_id != "undefined") {
    window.clearTimeout(upper_nav_timeout_id);
  }

  console.log("add_lumbergh_dash");
  if($('button#gbqfb').length == 0) {
    console.log('didnt find button#gbqfb');
    upper_nav_timeout_id = window.setTimeout(add_lumbergh_dash, 10000);
  } else {
    $('button#gbqfb').after('<div id="lumbergh_dash" style="width:200px;text-align:center;float:right;margin-left:25px;color:black;padding:3px 5px;text-decoration:none;"></div>');
  }
}

function show_login_link() {
  if(!window.has_lumbergh_login_link) {
    $('#lumbergh_dash').html('<a href="" id="lumbergh_login" style="background-color:#ff7400;color:white;text-decoration:none;padding:2px 3px;">Login to Lumbergh</a>');
    window.has_lumbergh_login_link = true;
  }
}

function show_task_button_in_message() {
  window.clearTimeout(task_button_timeout_id);

  var mid = document.location.hash.replace(/.+\/(.+)$/gi, "\$1")

  var $h1len = $('h1.ha');
  if($h1len.length == 0) {
    task_button_timeout_id = window.setTimeout(show_task_button_in_message, 3000);
  } else {
    var task_msg = '';
    task_msg = '<div id="addtask" style="margin-right:8px;float:left;background-color:#ff7400;color:white;text-decoration:none;padding:2px 3px;"><input type="checkbox" id="' + mid + '" value=""> Is this a task?' + '</div>';
    $('#addtask').remove();
    $('div.ade').prepend(task_msg);
    add_task_event();
  }
}

function paint_tasks() {
  $(document).ready(function(){
    if(window.tasks == null || window.tasks.length == 0) {
      return;
    }
    // $messages_table = $('table.F');
    // $messages_table_first = $('table.F:first');
    var $main_div = $('div.UI');
    todo_page_url = chrome.extension.getURL("todo.html");
    $.get(todo_page_url, function(data) {
      // $messages_table.each(function(){
      //   $(this).css({"width": "80%", "float": "left"});
      // });
      $main_div.css({"width": "80%", "float": "left"});
      $('div#todo').remove();
      $main_div.after(data);
      // if($('div#todo').length == 0) {
      //   $messages_table.after(data);
      // } else {
      //   $('div#todo').replaceWith(data);
      // }
      $('div#todo div.table').html(function(){
        var task_list = '';
        var cnt = -1;
        for(i = 0;i < window.tasks.length;i++) {
          if(window.tasks[i].is_task == "False" || window.tasks[i].is_task == "false" || window.tasks[i].is_done == "True" || window.tasks[i].is_done == "true") {
            continue;
          }

          cnt += 1;

          if(cnt%2 == 0) {
            style = "background-color:#F3F3F3;"
          } else {
            style = "background-color:#FFFFFF;"
          }
          task_list += '<p style="width:100%;padding:2px 2px 2px 3px;' + style + '">';
          task_list += '<label class="checkbox inline"> <input type="checkbox" id="' +
                        window.tasks[i].id + '" value="">&nbsp; ' +
                        '<small><a style="color:inherit;text-decoration:none;" href="' + document.URL + '/' + window.tasks[i].id +'" title="' + window.tasks[i].subject + '">' + window.tasks[i].subject.substring(0,35) + '..</a></small>' +
                        '</label>';
          task_list += '<span style="float:right;margin-right:8px;"><small><a href="" id="' + window.tasks[i].id + '" class="not_task" title="not a task" style="padding:2px 2px;color:black;text-decoration:none;">x</a></small></span>';
          task_list += '</p>';
        }
        if(cnt == -1) {
          return '<h4>You win. No tasks for you!</h4>';
        } else {
          return task_list;
        }
      });

      var pagination = new Pagination(0, window.tasks.length, 10, window.tasks);
      applyPagination(pagination);
      add_nontask_event();
      add_onclick_event();
    });
  });
}

// var port = chrome.runtime.connect({name: "knockknock"});
// port.postMessage({joke: "Knock knock"});
// port.onMessage.addListener(function(msg) {
//   if (msg.question == "Who's there?")
//     port.postMessage({answer: "Madame"});
//   else if (msg.question == "Madame who?")
//     port.postMessage({answer: "Madame... Bovary"});
// });

// chrome.runtime.onConnect.addListener(function(port) {
//   console.assert(port.name == "knockknock");
//   port.onMessage.addListener(function(msg) {
//     if (msg.joke == "Knock knock")
//       port.postMessage({question: "Who's there?"});
//     else if (msg.answer == "Madame")
//       port.postMessage({question: "Madame who?"});
//     else if (msg.answer == "Madame... Bovary")
//       port.postMessage({question: "I don't get it."});
//   });
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
});


function fire_login_link() {
  $(function() {
      SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvEUg7kVFrl8yi4rrAY1LbPheX3peFBbustx5D0LM60etf02Mg/exec';
      METHOD_AUTH = '?method=auth';

      $('body #lumbergh_login').on('click', function() {
        window.open(SCRIPT_URL + METHOD_AUTH, $(this).attr('id'), 'width=640,height=480');
        window.focus();
      });
    });
}