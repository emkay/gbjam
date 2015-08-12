var PF = require('pathfinding')
var grid = new PF.Grid(1920, 1200)
var finder = new PF.AStarFinder();

module.exports = function (self) {
  function mobMove(ax, ay, bx, by) {
    var gridB = grid.clone()
    var movements = finder.findPath(ax, ay, bx, by, gridB)
    return movements
  }

  self.addEventListener('message', function (ev) {
    var data = ev.data
    var msg = mobMove(data.ax, data.ay, data.bx, data.by)
    self.postMessage(msg)
  })
}
