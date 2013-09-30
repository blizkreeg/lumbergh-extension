Page = function Page(items) {
  this.items = typeof items !== 'undefined' ? items : [];
};

Page.prototype.html = function() {
  var results = '';
  for (var i = 0; i < this.items.length; i++) {
    results += this.items[i];
  }
  return results;
};

Pagination = function Pagination(current_page, num_tasks, per_page, items) {
  this.current_page = current_page;
  this.num_tasks = num_tasks;
  this.per_page = per_page;
  this.items = items;
};

Pagination.prototype.startNum = function() {
  return this.current_page * this.per_page + 1;
};

Pagination.prototype.endNum = function() {
  return this.startNum() + 10 - 1;
};

Pagination.prototype.numPages = function() {
  return Math.ceil(this.num_tasks/this.per_page);
}

Pagination.prototype.nav = function() {
  return $('<div>', {
    class: 'pagination-nav',
    html: this.startNum() + '-' + this.endNum() + ' of ' + this.num_tasks + ' tasks' + ' ' + this.navLeft() + ' ' + this.navRight()
  })[0].outerHTML;
};

Pagination.prototype.navArrow = function(dir, active) {
  active = typeof active !== 'undefined' ? active : true;
  var is_inactive = active == true ? '' : 'inactive';
  var elClass = 'arrow-' + dir + ' ' + is_inactive;
  var arrow = $('<span>', {
    class: elClass
  });
  return arrow[0].outerHTML;
};

Pagination.prototype.navLeft = function() {
  var active = this.current_page == 0 ? false : true;
  return this.navArrow('left', active);
};

Pagination.prototype.navRight = function() {
  var active = (this.current_page == this.numPages() - 1) ? false: true;
  return this.navArrow('right', active);
};

Pagination.prototype.pages = function() {
  var results = [];

  for(var i = 0; i < this.numPages(); i++) { // page
    var page = new Page();
    var start_page = i * this.per_page;
    var end_page = start_page + this.per_page;

    for (var j = start_page; j < end_page; j++) { // items per page
      page.items.push(this.items[j]);
    }
    results.push(page);
  }
  return results;
};

Pagination.prototype.pageHtml = function(index) {
  var results = '';
  var page_items = this.page(index).items;
  for (var i = 0; i < page_items.length; i++) {
    results += page_items[i].outerHTML;
  }
  return '<div class="page">' + results + '</div>';
};

Pagination.prototype.page = function(index) {
  index = typeof index !== 'undefined' ? index : this.current_page;
  return this.pages()[index];
};

function applyPagination(pagination) {
  // insert the pagination nav
  if ($('#todo .pagination-nav').length > 0) {
    $('#todo .pagination-nav').replaceWith(paginationNav(pagination));
  } else {
    $('#todo .table').before(paginationNav(pagination));
  }
  // set the page
  $('#todo .table').html(pagination.pageHtml());
  addNavHandlers(pagination);
}

function paginationNav(pagination) {
  return pagination.nav();
}

function addNavHandlers(pagination) {
  // TODO handlers should be added as part of the Pagination class object
  // here to attach to elements after page loads
  $('.arrow-left').click(function() {
    if (pagination.current_page != 0) {
      pagination.current_page -= 1;
      applyPagination(pagination); // refresh page
    }
  });

  $('.arrow-right').click(function() {
    if (pagination.current_page < pagination.numPages() - 1) {
      pagination.current_page += 1;
      applyPagination(pagination); // refresh page
    }
  });
}