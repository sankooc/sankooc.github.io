(function() {
  angular.module("app", ['ui.router', 'angular-loading-bar']).config(function($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, $anchorScrollProvider) {
    var prefix;
    cfpLoadingBarProvider.includeBar = true;
    prefix = 'src/';
    $stateProvider.state('blogs', {
      url: '/blogs/:page',
      controller: 'BlogsController',
      templateUrl: prefix + 'view/blogs.html'
    }).state('blog', {
      url: '/blog/:id',
      controller: 'BlogController',
      templateUrl: prefix + 'view/blog.html'
    }).state('archives', {
      url: '/archives',
      controller: 'ArchivesController',
      templateUrl: prefix + 'view/archives.html'
    });
    return $urlRouterProvider.otherwise('/blogs/1');
  }).run(function($rootScope, $http) {
    return $rootScope.title = 'Sankooc';
  }).service('IssueService', function($q, cfpLoadingBar) {
    var cache, _load;
    cache = null;
    _load = function() {
      var q, repo, user;
      cfpLoadingBar.start();
      user = new Gh3.User('sankooc');
      repo = new Gh3.Repository('sankooc.github.io', user);
      q = $q.defer();
      repo.fetchIssues(function(err, data) {
        cfpLoadingBar.complete();
        if (err) {
          return q.reject(err);
        } else {
          cache = data;
          return q.resolve(data);
        }
      });
      return q.promise;
    };
    this.load = function(force) {
      var q;
      if (force) {
        return _load();
      } else if (cache) {
        q = $q.defer();
        q.resolve(cache);
        return q.promise;
      } else {
        return _load();
      }
    };
    return this;
  }).controller('BlogsController', function($scope, IssueService, $stateParams) {
    var converter, inx, per;
    $scope.blogs = [];
    $scope.page = parseInt($stateParams.page);
    per = 2;
    inx = ($scope.page - 1) * per;
    converter = new showdown.Converter();
    IssueService.load(true).then(function(data) {
      return _.each(data.issues, function(issue, index, arr) {
        var body, content;
        if ($scope.blogs.length >= per) {
          return;
        }
        if (issue.milestone.title === 'blog') {
          if (inx > 0) {
            inx--;
            return;
          }
          body = issue.body;
          content = converter.makeHtml(body);
          issue.trim = trimHtml(content, {
            limit: 200
          });
          $scope.blogs.push(issue);
          if (arr.length - 1 > index) {
            return $scope.hasMore = true;
          } else {
            return $scope.hasMore = false;
          }
        }
      });
    });
    return $scope.toHtml = function(body) {
      var content;
      content = converter.makeHtml(body);
      return trimHtml(content, {
        limit: 200
      });
    };
  }).controller('BlogController', function($scope, IssueService, $stateParams, $window) {
    var converter, id, issues;
    $window.scrollTo(0, 0);
    converter = new showdown.Converter();
    id = $stateParams.id;
    issues = null;
    return IssueService.load().then(function(data) {
      issues = data;
      return _.each(data.issues, function(issue, index, arr) {
        if (issue.milestone.title === 'blog') {
          if (issue.id === parseInt(id)) {
            $scope.blog = issue;
            $scope.body = converter.makeHtml(issue.body);
            if (arr.length >= index + 2) {
              $scope.next = arr[index + 1];
            }
          }
        }
      });
    });
  }).controller('ArchivesController', function($scope, IssueService) {
    var map;
    $scope.blogs = [];
    map = $scope.map = {};
    return IssueService.load(true).then(function(data) {
      _.each(data.issues, function(issue) {
        if (issue.milestone.title === 'blog') {
          return $scope.blogs.push(issue);
        }
      });
      _.each($scope.blogs, function(blog) {
        var y, _date, _s1;
        _date = moment(blog.updated_at);
        y = _date.format('YYYY');
        if (!map[y]) {
          map[y] = [];
        }
        _s1 = map[y];
        return _s1.push(blog);
      });
      return $scope.years = Object.keys(map);
    });
  }).filter('htmlSafe', [
    '$sce', function($sce) {
      return function(text) {
        return $sce.trustAsHtml(text);
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=app.js.map
