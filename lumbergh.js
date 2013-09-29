$ = jQuery.noConflict();

SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvEUg7kVFrl8yi4rrAY1LbPheX3peFBbustx5D0LM60etf02Mg/exec'
METHOD_TASKS = '?method=tasks'
METHOD_PROCESS = '?method=process'
METHOD_STATUS = '?method=status'
TRAIN_PROCESS = '?method=train'

SESSION_CHECK_TIMEOUT = 60000

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
  console.log("check login status");
  if(response != undefined && response.status != undefined) {
    if(response.status == "false") {
      console.log("...not logged in");
      show_login_link(true);
      fire_login_link();
    } else {
      console.log("...is logged in");
      show_login_link(false);
      ping_for_tasks();
    }
  } else {

  }
}

function ping_for_login_status() {
  if(login_status_timeout_id != "undefined") {
    window.clearTimeout(login_status_timeout_id);
  }

  console.log(email_address);
  chrome.runtime.sendMessage({greeting: "gimmeloginstatus", email: email_address}, process_login_status);
  login_status_timeout_id = window.setTimeout(ping_for_login_status, SESSION_CHECK_TIMEOUT);
}

function get_tasks(response) {
  if(response != undefined && response.data != undefined) {
    console.log("got tasks. painting the window now.");
    window.tasks = response.data;
    paint_tasks();
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
    task_button_timeout_id = window.setTimeout(show_task_button_in_message, 1000);
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
    $('button#gbqfb').after('<div id="lumbergh_dash"><img id="lumbergh_logo"><div class="message"></div></img><div id="lumbergh_menu"><i class="icon-sort-down icon-1x"></i></div><div class="box"><div id="lumbergh_login_link"></div></div></div>');
    var img_url = chrome.extension.getURL("images/icon48.png");
    document.getElementById("lumbergh_logo").src = img_url;

    // UNCOMMENT TO ENABLE DROPDOWN

    // $('#lumbergh_menu .icon-sort-down').on('click', function(e) {
    //   $('#lumbergh_dash > .box').toggle();
    // });

    // $('#lumbergh_dash #lumbergh_logo').on('click', function(e) {
    //   $('#lumbergh_dash > .box').toggle();
    // });
  }
}

function show_login_link(login) {
  // if(!window.has_lumbergh_login_link) {
  if(login) {
    show_login("Signin to Lumbergh");
    // window.has_lumbergh_login_link = true;
  } else {
    console.log(window.tasks);
    if(window.tasks == null) {
      show_message('Loading tasks...');
    } else {
      show_logout();
    }
    // window.has_lumbergh_login_link = true;
  }
}

function show_task_button_in_message() {
  window.clearTimeout(task_button_timeout_id);

  var mid = document.location.hash.replace(/.+\/(.+)$/gi, "\$1")

  var $h1len = $('h1.ha');
  if($h1len.length == 0) {
    // task_button_timeout_id = window.setTimeout(show_task_button_in_message, 1000);
  } else {
    var task_msg = '';
    var identified_as_task = 0;
    if(window.tasks != null && window.tasks.length != 0) {
      for(i = 0;i < window.tasks.length;i++) {
        if(window.tasks[i].id == mid && (window.tasks[i].is_task == "True" || window.tasks[i].is_task == "true")) {
          identified_as_task = 1;
          break;
        }
      }
    }
    if(identified_as_task == 1) {
      task_msg = '<div id="addtask"><i class="icon-flag-alt"></i> <div class="task">Marked as ToDo</div></div>';
    } else {
      task_msg = '<div id="addtask"><div class="task"><input type="checkbox" id="' + mid + '" value=""> Mark as ToDo' + '</div></div>';
    }
    $('#addtask').remove();
    $('div.ade').prepend(task_msg);
    add_task_event();
  }
}

function show_message(msg) {
  $('#lumbergh_dash > .message').html(msg);
}

function show_login(msg) {
  $('#lumbergh_dash > .message').html('<a href="" id="lumbergh_login">' + msg + '</a>');
}

function show_logout() {
  $('#lumbergh_login_link').html('<a href="" id="lumbergh_login"><i class="icon-off"></i> Signout of Lumbergh</a>');
}

function paint_tasks() {
  $(document).ready(function(){
    if(window.tasks == null || window.tasks.length == 0) {
      return;
    }

    show_logout();
    message = '<strong>' + window.tasks.length + '</strong>' + ' tasks';
    show_message(message);

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
                        '<small><a style="color:inherit;text-decoration:none;" href="' + document.URL + '/' + window.tasks[i].id +'" title="' + window.tasks[i].subject + '">' + window.tasks[i].subject.substring(0,30) + '..</a></small>' +
                        '</label>';
          task_list += '<span style="float:right;margin-right:8px;"><small><a href="" id="' + window.tasks[i].id + '" class="not_task" title="not a task" style="padding:2px 2px;color:black;text-decoration:none;"><i class="icon-remove"></i></a></small></span>';
          task_list += '</p>';
        }
        if(cnt == -1) {
          return '<h4>You win. No tasks for you!</h4>';
        } else {
          return task_list;
        }
      });

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

      $('#lumbergh_login').on('click', function() {
        window.open(SCRIPT_URL + METHOD_AUTH, $(this).attr('id'), 'width=640,height=480');
        window.focus();
      });
    });
}