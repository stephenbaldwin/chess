var App = SC.Application.create();

App.Chess = new Chess();
App.LetterIndex = ['a','b','c','d','e','f','g','h'];

App.AlertView = SC.View.extend();

App.Tile = SC.Object.extend({
  row: 0,
  column: 0,
  isSelected: NO,

  columnName: function(){
    return App.LetterIndex[this.get('column')];
  }.property('column').cacheable(),

  rowName: function(){
    return this.get('row') + 1;
  }.property('row').cacheable(),

  square: function(){
    return [this.get('columnName'), this.get('rowName')].join('');
  }.property('rowName','columnName').cacheable(),

  background: function(){
    var square = App.Chess.square_color(this.get('square'));
    return (this.get('isSelected')) ? square + ' ' + 'is-selected' : square;
  }.property('square', 'isSelected').cacheable(),

  color: function(){
    var square = this.get('square');

    if(tile = App.Chess.get(square)){ 
      return tile.color;
    }

    return null;
  }.property('square').cacheable(),

  piece: function(){
    var square = this.get('square'),
        type, piece;
    if(tile = App.Chess.get(square)){ 
      if(tile.color === 'w'){
        tile.type = 'w' + tile.type;
      }
      piece = 'images/' + tile.type + '.png';
    } else {
      piece = 'images/pixel.gif'   
    }
    return piece;
  }.property('square').cacheable()

  /*
  piece: function(){
    var square = this.get('square'),
        type;
    return (tile = chess.get(square)) ? tile.color+tile.type : null;
  }.property()
  */

});

App.boardController = SC.Object.create({
  from: null,
  color: 'w',

  select: function(tile){
    var from = this.get('from'),
        square = tile.get('square');

    if(from === square){
      this.set('from', null);
      tile.set('isSelected', NO);
    }
    else if(from !== null){
      App.tilesController.move(from, square);
      this.set('from', null);
    }
    else {
      this.set('from', square);
      tile.set('isSelected', YES);
    }
  }
});

App.tilesController = SC.ArrayController.create({
  content: [],

  move: function(from, to){
    var fromSquare = from.split(''),
        toSquare = to.split(''),
        content = this.get('content'),
        fromIndex, toIndex;

    fromSquare[0] = App.LetterIndex.indexOf(fromSquare[0])
    fromSquare[1] = fromSquare[1] - 1;

    fromIndex = (fromSquare[1] * 8) + (fromSquare[0] + 0);

    toSquare[0] = App.LetterIndex.indexOf(toSquare[0])
    toSquare[1] = toSquare[1] - 1;

    toIndex = (toSquare[1] * 8) + (toSquare[0] + 0);

    if(App.Chess.move({ from: from, to: to })){
      
      content[fromIndex].set('square', App.Chess.get(from));
      content[toIndex].set('square', App.Chess.get(to));
      
      content.filterProperty('isSelected', YES).setEach('isSelected', NO);
    }

    return;
  }
});

App.BoardView = SC.CollectionView.extend({
  contentBinding: 'App.tilesController',
  tagName: 'ul',
  classNames: 'board clearfix'.w()
});

App.PieceView = SC.View.extend({
  contentBinding: '.parentView.content',
  mouseDown: function(){
    App.boardController.select(this.get('content'));
  }
});

var content = [];

for(row = 0; row <= 7; row++){
  for(column = 0; column <= 7; column++){
    content.pushObject(App.Tile.create({ row: row, column: column }));
  }
}

App.tilesController.set('content', content);

