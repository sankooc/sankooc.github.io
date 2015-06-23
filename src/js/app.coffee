angular.module("app",['ui.router','angular-loading-bar'])
.config ($stateProvider, $urlRouterProvider,cfpLoadingBarProvider,$anchorScrollProvider)->
  # $anchorScrollProvider.disableAutoScrolling()
  cfpLoadingBarProvider.includeBar = true
  prefix = 'src/'
  $stateProvider
  .state 'blogs', {
    url: '/blogs/:page'
    controller:'BlogsController'
    templateUrl: prefix+'view/blogs.html'
  }
  .state 'blog', {
    url: '/blog/:id'
    controller:'BlogController'
    templateUrl: prefix+'view/blog.html'
  }
  .state 'archives', {
    url: '/archives'
    controller:'ArchivesController'
    templateUrl: prefix+'view/archives.html'
  }
  $urlRouterProvider.otherwise('/blogs/1');
.run ($rootScope,$http)->
  $rootScope.title = 'Sankooc'
.service 'IssueService',($q,cfpLoadingBar)->
  cache = null
  _load = ()->
    cfpLoadingBar.start()
    user = new Gh3.User('sankooc')
    repo = new Gh3.Repository('sankooc.github.io',user)
    q = $q.defer()
    repo.fetchIssues (err,data)->
      cfpLoadingBar.complete()
      if err 
        q.reject err
      else
        cache = data
        q.resolve(data)
    q.promise
  @load = (force)->
    if force
      return _load()
    else if cache
      q = $q.defer()
      q.resolve(cache)
      q.promise
    else
      return _load()
  this
.controller 'BlogsController',($scope,IssueService,$stateParams)->
  $scope.blogs = []
  $scope.page = parseInt($stateParams.page)
  per = 2
  inx = ($scope.page-1)*per
  converter = new showdown.Converter()
  IssueService.load(true).then (data)->
    _.each data.issues, (issue,index,arr)->
      if $scope.blogs.length >= per
        return
      if issue.milestone.title is 'blog'
        if inx > 0
          inx--
          return
        body = issue.body
        content = converter.makeHtml body
        issue.trim = trimHtml(content,{limit:200})
        $scope.blogs.push issue
        if arr.length-1 > index
          $scope.hasMore = true
        else
          $scope.hasMore = false
    
  $scope.toHtml = (body)->
    content = converter.makeHtml body
    trimHtml(content,{limit:200})
.controller 'BlogController',($scope,IssueService,$stateParams,$window)->
  $window.scrollTo(0, 0)
  converter = new showdown.Converter()
  id = $stateParams.id
  issues = null
  IssueService.load().then (data)->
    issues = data
    _.each data.issues, (issue,index,arr)->
      if issue.milestone.title is 'blog'
        if issue.id is parseInt id
          $scope.blog = issue
          $scope.body = converter.makeHtml issue.body
          if arr.length >= index+2
            $scope.next = arr[index+1]
          return
.controller 'ArchivesController',($scope,IssueService)->
  $scope.blogs = []
  map = $scope.map = {}
  IssueService.load(true).then (data)->
    _.each data.issues, (issue)->
      if issue.milestone.title is 'blog'
        $scope.blogs.push issue
    _.each $scope.blogs,(blog)->
      _date = moment(blog.updated_at)
      y = _date.format('YYYY')
      if not map[y]
        map[y] = []
      _s1 = map[y]
      _s1.push blog
    $scope.years = Object.keys map
    
.filter 'htmlSafe',($sce)->
  (text)->
    $sce.trustAsHtml(text)