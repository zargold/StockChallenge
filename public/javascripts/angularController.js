(function(angular){
angular.element(document).ready(function() {
  var app = angular.module('stockGraph', []);
  
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
      app.currentPices = [];
      this.prices = app.currentPices;
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

  angular.bootstrap(document, ['stockGraph']);
});
})(angular);