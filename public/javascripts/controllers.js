(function(angular){
angular.element(document).ready(function() {
  var app = angular.module('stockGraph', []);
  var monk = {};
  app.currentPrices = [];
  app.count = 0;
  app.points = [];

  app.calcMax = function() {
    console.log(app.currentPrices)
    var lowestSoFar = (app.currentPrices[0] || 0);
    var highest = (app.currentPrices[0] || 0);
    var maxProfit = 0;
    var profitObj = {buy: lowestSoFar, sell: highest, profit: maxProfit};
    app.currentPrices.forEach(function(price){
      if (price < lowestSoFar){
        lowestSoFar = price;
      }
      if (price > highest){
        highest = price;
      }
      if ((price - lowestSoFar) > maxProfit){
        maxProfit = price - lowestSoFar;
        profitObj = {buy: lowestSoFar, sell: price, profit: maxProfit};
      }
    });
    return [{low: (lowestSoFar||0), high: (highest||0)}, profitObj];
  };

  app.fillGraph = function(){
    var myObj= {'x': parseInt(app.count, 10), 'y': (app.currentPrices[app.count])};
    app.points.push(myObj);
  };

  app.controller('StockCtrl', function($scope) {
    this.graph = {'width': 550, 'height': 350};
    this.name = "hidden secret";
    this.profit = app.calcMax();
    this.prices = app.currentPrices;
    this.points = app.points;
    var x = d3.time.scale().range([0, this.graph.width]);
    var y = d3.scale.linear().range([this.graph.height, 0]);
    
    this.renderGraph = function(){
      console.log("rendering");
      this.profit = app.calcMax();
      x.domain(d3.extent(this.points, function(d) {return d.x}));
      y.domain(d3.extent(this.points, function(d) {return d.y}));

      this.line = d3.svg.line()
        .x(function(d) {return x(d.x);})
        .y(function(d) {return y(d.y);});
    };
    this.clearPrices = function(){
      console.log("clearing");
      app.currentPrices = [];
      this.prices = app.currentPrices;
      app.points = [];
      this.points = app.points;
      app.count = 0;
      this.renderGraph();
    };
  });

  app.controller('PriceCtrl', function($scope) {
    this.price = null;
    this.addPrice = function(){
      app.currentPrices.push(this.price);
      app.fillGraph();
      app.count++;
      this.price = null;
    };
    this.validated = function(){
      if (null !== this.price && !isNaN(parseInt(this.price, 10)) ){
        return true;
      } else {
        return false;
      }
    };
  });
  monk.pyramid = {};
  //used for object hack to convert Array of Arrays into Object (Angular necessity)
  monk.pyrInfo = {len: 0, most: 0};
  app.controller('MonkeyCtrl', function($scope) {
    this.uncutPyramid = "5\n9    6\n4    6      8\n0    18     1     5\n3    6     21     5      9\n3    6      7     5      9       31";
    this.pyramid = monk.pyramid;
    this.pyrInfo = monk.pyrInfo;
    
    this.clear = function() {
      monk.pyramid = {};
      monk.pyrInfo = {len: 0};
      this.validated();
    };

    this.validated = function() {
      if(null == this.uncutPyramid || !this.uncutPyramid || this.uncutPyramid.trim().length < 1) return false;
      var lines = this.uncutPyramid.trim().split('\n');
      if(lines.length< 1) return false;
      for(var i = 0; i < lines.length; i++){
        var nums = lines[i].trim().split(/\s+/);
        monk.pyramid[i] = [];
        monk.pyrInfo.len += 1;
        for (var n = 0; n < nums.length; n++){
          var neededExclusions = 2;
          if (n == 0 || n == nums.length - 1){
            neededExclusions = 1;
          }
          this.pyramid[i].push({
            'num': parseInt(nums[n], 10),
            'neededExclusions': neededExclusions,
            'excludedBy': {}
          });

        }
      }
    };

    this.showMaxBananas = function() {
      var interval = 800, waitFor = 0, stayFor = 200;
      //Using pyramidLength to get length of Object
      for(var level = this.pyrInfo.len-1; level > 0; level--){
        for(var position = 0; position < this.pyramid[level].length - 1; position++){
          console.log(position)
          waitFor += interval;
          monk.temporarilyClassify(monk.getBlock(level, position), "blue", waitFor, stayFor);
          monk.temporarilyClassify(monk.getBlock(level, position+1), "blue", waitFor, stayFor);
          var chosenPosition = position;
          var excludedPosition = position + 1;
          if (this.pyramid[level][position].num < this.pyramid[level][position+1].num){
            chosenPosition = position + 1;
            excludedPosition = position;
          }
          var bananasSoFar = this.pyramid[level-1][position].num + this.pyramid[level][chosenPosition].num;
          this.pyramid[level-1][position].num = bananasSoFar;
          //monk.setMaxBananas(monk.getBlock(level-1, position), bananasSoFar, waitFor);
          monk.classify(monk.getBlock(level, chosenPosition), 'cyan', waitFor+stayFor);
          monk.exclude(monk.getBlock(level-1, position), level, excludedPosition, this.pyramid, waitFor+stayFor*2);
        }
      }
    };
  });

  monk.getBlock = function(level, position){
    var block = document.getElementsByClassName("pyramidLines")[level].children[position];
    console.log(block);
    return block;
  };

  monk.temporarilyClassify = function(elem, mark, waitFor, stayFor) {
    monk.classify(elem, mark, waitFor);
    setTimeout(
      function() {
        elem.classList.remove(mark);
        },
      waitFor+stayFor);
  };

  monk.exclude = function(parentEl, level, position, pyramid, waitFor) {
    maxLevels = pyramid.length;
    curBlock = monk.getBlock(level, position);
    var excludingTime = 500;
    pyramid[level][position].excludedBy[parentEl] = true;
    monk.temporarilyClassify(monk.getBlock(level, position), 'pink', waitFor, excludingTime);
    if (Object.keys(pyramid[level][position].excludedBy).length === pyramid[level][position]["neededExclusions"]) {
        monk.classify(monk.getBlock(level, position), 'pink', waitFor+excludingTime);
        if (level+1 < pyramid.length){
          monk.exclude(curBlock, level+1, position, pyramid, waitFor);
          monk.exclude(curBlock, level+1, position+1, pyramid, waitFor);
        }
    }
  };

  monk.classify = function(elem, mark, waitFor){
    setTimeout(
      function() {
        console.log(elem);
        elem.classList.add(mark);
      },
      waitFor);
  };



  angular.bootstrap(document, ['stockGraph']);
});
})(angular);