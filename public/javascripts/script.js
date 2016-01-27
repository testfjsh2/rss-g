var engine = {

  posts : [],
  target : null,
  busy : false,
  count : 5,

  render : function(obj) {
    var xhtml = '<div class="row news-item post" id=post_'+obj.id+'>' +
      '<a href="'+obj.href+'" class="navbar-brand">' +
        '<span class="icon"><img src="http://vendevor.com/img/features2/Website_Icon_Blue.png" alt="" class="img-responsive"></span>' +
        '<span class="news-title">'+obj.title+'</span>' +
      '</a>' +
    '</div>;'
    return xhtml;
  },

  init : function(posts, target){
    if (!target)
      return;
    
    this.target = $(target);
    
    this.append(posts);

    var that = this;
    $(window).scroll(function(){
      if ($(document).height() - $(window).height() <= $(window).scrollTop() + 50) {
        that.scrollPosition = $(window).scrollTop();
        that.get();
      }
    });
  },

  append : function(posts){
    posts = (posts instanceof Array) ? posts : [];
    this.posts = this.posts.concat(posts);

    for (var i=0, len = posts.length; i<len; i++) {
      this.target.append(this.render(posts[i]));
    }

    if (this.scrollPosition !== undefined && this.scrollPosition !== null) {
      $(window).scrollTop(this.scrollPosition);
    }
  },

  get : function() {

    if (!this.target || this.busy) return;

    if (this.posts && this.posts.length) {
      var lastId = this.posts[this.posts.length-1].id;
    } else {
      var lastId = new Date();
    }
    var checkedInputs = $('.checkbox').find('input:checked');
    var urls = [];
    if (checkedInputs && checkedInputs.length >0) {
      for (var i = 0; i < checkedInputs.length; i++) {
        urls.push($(checkedInputs[i]).attr('data-url'));
      };
    }
    this.setBusy(true);
    var that = this;
    if($('.js_filter-storage').attr('data-active') === 'all')
    $.post('/updateNews', {
      "type":location.pathname.slice(1).split('#').join('') || "main",
      "urls": urls,
      "last":lastId
    }, function(data) {
        if (data.length > 0) {
          that.append(data);
        }
        that.setBusy(false);
      }
    );
  },

  showLoading : function(bState){
    var loading = $('#loading');

    if (bState) {
      $(this.target).append(loading);
      loading.show('slow');
    } else {
      $('#loading').hide();
    }
  },

  setBusy : function(bState){
    this.showLoading(this.busy = bState);
  }
};

function closeNewUrlModal() {
  $('#addRSSUrlModalLabel').modal('hide')
}

// init scripts
$(document).ready(function(){
  engine.init(null, $(".news"));
  engine.get();
});

// show modal window for loading url to database
$(document).on('click','.js_show-add-url',function() {
  $('.js_input-add-url').val('');
  $('.js_input-add-title').val('');
  $('.js_input-add-icon').val('');
  $('.js_input-add-type').val('main');
  $('.js_button-selector').text('Выберите тип RSS...');
  $('#addRSSUrlModalLabel').modal('show');
});

// load url to database
$(document).on('click', '.js_submit-add-url', function() {
  var data = {
    url: $('.js_input-add-url').val(),
    title: $('.js_input-add-title').val(),
    icon: $('.js_input-add-icon').val(),
    type: $('.js_input-add-type').val(),
  };
  $.post('/save', data, function() {
    location.reload();
  });
  closeNewUrlModal();
});

// helpfull script for selecting type of RSS url
$(document).on('click', '.js_select-add-url-type', function() {
  var $self = $(this);
  var typeText = $self.text();
  var typeValue = $self.find('a').attr('data-type');
  $('.js_button-selector').text(typeText);
  $('.js_input-add-type').val(typeValue);
});

// load url to database
$(document).on('click', '.js_set-filter', function() {
  var $self = $(this);
  var data = {
    val: $self.attr('data-filter')
  };
  $.post('/saveFilter', data, function() {
    location.reload();
  });
});

$(document).on('click', '.js_show-about', function() {
  $('#aboutModal').modal('show');
});

$(document).on('click', '.js_check-url', function() {
  var $self = $(this);
  var data = {
    type: location.pathname.slice(1).split('#').join('') || "main",
    state: ($self.find('input:checked').length >0) ? "checked": "unchecked",
    url: $self.find('input').attr('data-url'),
  }
  $.post('/checkUrl', data, function() {
    location.reload();
  });
})