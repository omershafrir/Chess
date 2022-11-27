const numToPiece = {        0:"none" ,
                            1:"wP" ,
                            2:"wR" , 
                            3:"wN" , 
                            4:"wB" ,
                            5:"wQ" , 
                            6:"wK" , 
                            7:"bP" , 
                            8:"bR" , 
                            9:"bN" , 
                            10:"bB" , 
                            11:"bQ" , 
                            12:"bK"         };
const pieceToNum = {
                        "none":0 ,
                        "wP":1 ,
                        "wR":2, 
                        "wN":3 , 
                        "wB":4 ,
                        "wQ":5 , 
                        "wK":6 , 
                        "bP":7 , 
                        "bR":8 , 
                        "bN":9 , 
                        "bB":10 , 
                        "bQ":11 , 
                        "bK":12        };

let board = [   [8,9,10,11,12,10,9,8],
                [7,7,7 ,7, 7 ,7 ,7,7],
                [0,0,0 ,0 ,0 ,0 ,0,0],
                [0,0,0 ,0 ,0 ,0 ,0,0],
                [0,0,0 ,0 ,0 ,0 ,0,0],
                [0,0,0 ,0 ,0 ,0 ,0,0],
                [1,1,1 ,1 ,1 ,1 ,1,1],
                [2,3,4 ,5 ,6 ,4 ,3,2]
            ];
let boardElements;
let cellToElement , elementToCell;
let chosenCell = null;
let movesToHighlight = null;
let highlightedSquares = []
let whiteTurn
let wKCell , bKCell
//functions:
function init(){
    boardElements = document.querySelectorAll(".cell:not(.nums)")
    boardElements.forEach( cell => cell.addEventListener('click' , e => handleClick(cell)) )
    document.querySelector("button").addEventListener('click' , e => toggleNums())
    initMaps();
    toggleNums();
    whiteTurn = true;
    wKCell = [8,5] ;
    bKCell = [1,5] ;
}

function printBoard(){S
    let out = ``;
    for (let line of board){
        for (let cell of line){
            let p = numToPiece[cell];
            out += cell == 0 ? `${p}  ` : `${p}     `;
        }
        console.log(out)
        out = ``;
    }
}
function movePiece(pieceString , originCell, destCell){
    //TODO::: check why it is okay to get to the cells of board withour getting them to be numbers
    board[getRow(originCell)-1][getCol(originCell)-1] = 0;
    board[getRow(destCell)-1][getCol(destCell)-1] = pieceToNum[pieceString];

    let eatenPiece = null;
    const img = originCell.removeChild(originCell.firstElementChild);   //removing image from origin
    if (destCell.childElementCount != 0){
        destCell.removeChild(destCell.firstElementChild);
        eatenPiece = destCell.dataset.piece;
    }
    destCell.appendChild(img);                                          //adding image to dest cell
    originCell.dataset.piece = "none";              //updatine data of cells
    destCell.dataset.piece = pieceString;
    if (pieceString == "wK")                        //keeping track of kings locations
        wKCell = [getRow(destCell),getCol(destCell)]
    if (pieceString == "bK")
        bKCell = [getRow(destCell),getCol(destCell)]
    return eatenPiece;
}
function handleClick(cell) {
    const piece = cell.dataset.piece
    if (chosenCell == null){   //this is the first touch
        if (piece == "none")    //first touch is on empty cell -> return
            return;
        else{                   //no empty cell -> remember this choose
            chosenCell = cell;
            markLegalMoves(piece);
        }
    }
    else{
        const movingPiece = chosenCell.dataset.piece
        const chosenCellArray = elementToCell.get(chosenCell)
        const legal = legalMoves(movingPiece , chosenCellArray);
        if ( arrayIncludes(legal , elementToCell.get(cell) ) ){
            movePiece(chosenCell.dataset.piece , chosenCell , cell)
            whiteTurn = !whiteTurn
        }
        unmarkLegalMoves();
        chosenCell = null;
    }
}
function markLegalMoves(piece) {
    const legalTurn = whiteTurn & getColor(piece)=='w' || !whiteTurn && getColor(piece)=='b'
    chosenCell.style.backgroundColor = "rgb(138, 204, 31)"
    movesToHighlight = !legalTurn? [] :  legalMoves(chosenCell.dataset.piece ,
                                         elementToCell.get(chosenCell) )
    movesToHighlight.forEach( move => highlightedSquares.push(document.querySelector(`.row${move[0]} .col${move[1]}`)) )
    highlightedSquares.forEach( cell => { cell.style.backgroundColor = 'rgb(247,234,150)';
                                        //   cell.style.opacity = '70%';
                                        //   cell.style.boxShadow = 'rgba(50, 50, 93, 0.25)' ;
                                                 } )
}
function unmarkLegalMoves() {
    chosenCell.style = ""
    highlightedSquares.forEach( cell => cell.style = "" )
    highlightedSquares = [];
}
function possibleMoves(pieceString , cell){
    //TODO: Pion reaches end line
    switch (pieceString){
        case "wP":
            return calculatePionMoves(pieceString , cell).filter(inBoard)
        case "bP":
            return calculatePionMoves(pieceString , cell).filter(inBoard)
        case "wN":
            return calculateKnightMoves(cell).filter(inBoard)
        case "bN":
            return calculateKnightMoves(cell).filter(inBoard)
        case "wB":
            return calculateBishopMoves(pieceString , cell)
        case "bB":
            return calculateBishopMoves(pieceString , cell)
        case "wR":
            return calculateRookMoves(pieceString , cell)
        case "bR":
            return calculateRookMoves(pieceString , cell)
        case "wQ":
            return calculateQueenMoves(pieceString,cell)
        case "bQ":
            return calculateQueenMoves(pieceString,cell)
        case "wK":
            return calculateKingMoves(cell).filter(inBoard)
        case "bK":
            return calculateKingMoves(cell).filter(inBoard)
    }
    return null;            
}
function legalMoves(pieceString , cell){
    //check if the player who's turn is tries to make a move
    if (   !(whiteTurn & getColor(pieceString)=='w' || !whiteTurn && getColor(pieceString)=='b')  ) 
        return [];

    const possMoves = possibleMoves(pieceString , cell);
    switch (pieceString){
        case "wP":
            return possMoves.filter( move => [0,7,8,9,10,11,12].includes(board[move[0]-1][move[1]-1])).
                             filter( move => !checkForChess("wP" , cell , move))
        case "bP":
            return possMoves.filter( move => [0,1,2,3,4,5,6].includes(board[move[0]-1][move[1]-1])).
                             filter( move => !checkForChess("bP" , cell , move))
        case "wN":
            return possMoves.filter( move => [0,7,8,9,10,11,12].includes(board[move[0]-1][move[1]-1])).
                             filter (move => !checkForChess("wN" , cell , move))
        case "bN":
            return possMoves.filter( move => [0,1,2,3,4,5,6].includes(board[move[0]-1][move[1]-1])).
                             filter (move => !checkForChess("bN" , cell , move))
        case "wR":
            return possMoves.filter (move => !checkForChess("wR" , cell , move) )
        case "bR":
            return possMoves.filter (move => !checkForChess("bR" , cell , move) )
        case "wQ":
            return possMoves
        case "bQ":
            return possMoves
        case "wK":
            // return possMoves.filter( move => [0,7,8,9,10,11,12].includes(board[move[0]-1][move[1]-1])).
            //                  filter (move => !checkForChess("wK" , cell , move) ) 
            let x = possMoves.filter( move => [0,7,8,9,10,11,12].includes(board[move[0]-1][move[1]-1])).
                              filter( move => !checkForChess("wK" , cell , move) ) 
            console.log("possmoves after:" , x)
            return x
        case "bK":
            return possMoves.filter( move => [0,1,2,3,4,5,6].includes(board[move[0]-1][move[1]-1])).
                             filter (move => !checkForChess("bK" , cell , move) )                             
        case "wB":
            return possMoves
        case "bB":
            return possMoves

    }
}
function calculatePionMoves(pieceString , cell){
    const row = cell[0] , col = cell[1];
    let moves = pieceString == "wP" && row == 7 ? [[5,col]] : pieceString == "bP" && row == 2 ? [[4,col]] : [] ;  
    if (pieceString == "wP"){
        if (board[row-2][col-1] == 0)               
            moves.push([row-1,col]);
        if ([7,8,9,10,11,12].includes(board[row-2][col-2]))
            moves.push([row-1,col-1]);
        if ([7,8,9,10,11,12].includes(board[row-2][col]))
            moves.push([row-1,col+1]);
    }
    else{
        if (board[row][col-1] == 0)
            moves.push([row+1,col]);
        if ([1,2,3,4,5,6].includes(board[row][col-2]))
            moves.push([row+1,col-1])
        if ([1,2,3,4,5,6].includes(board[row][col]))
            moves.push([row+1,col+1])
    }
    return moves;
}
function calculateKnightMoves(cell){
    const row = cell[0] , col = cell[1];
    return  [[row-1,col-2],[row-1,col+2],[row+1,col-2],[row+1,col+2],
             [row-2,col-1],[row-2,col+1],[row+2,col-1],[row+2,col+1]].
             filter( pair => (1<=pair[0] && pair[0]<=8 && 1<=pair[0] && pair[1]<=8) );
}
function calculateRookMoves(pieceString , cell){
    const row = cell[0]-1 , col = cell[1]-1 , color = getColor(pieceString);
    const moves = [];
    for (let i=col+1 ; i<8; i++){      //getting the cells to the right of the rook
        if (board[row][i] == 0)
            moves.push([row+1,i+1]);
        else {
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[row][i])) ||  (color == 'b' && ![7,8,9,10,11,12].includes(board[row][i])) )
                moves.push([row+1,i+1]); 
            break;
        }
    }
    for (let i=col-1 ; i>=0 ; i--){      //getting the cells to the left of the rook
        if (board[row][i] == 0)
            moves.push([row+1,i+1]);
        else {
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[row][i])) ||  (color == 'b' && ![7,8,9,10,11,12].includes(board[row][i])) )
                moves.push([row+1,i+1]); 
            break;
        }
    }
    for (let i=row+1 ; i<8 ; i++){      //getting the cells to the bottom of the rook
        if (board[i][col] == 0)
            moves.push([i+1,col+1]);
        else {
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][col])) ||  (color == 'b' && ![7,8,9,10,11,12].includes(board[i][col])) )
                moves.push([i+1,col+1]); 
            break;
        }
    }
    for (let i=row-1 ; i>=0 ; i--){      //getting the cells to the top of the rook
        if (board[i][col] == 0)
            moves.push([i+1,col+1])
        else {
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][col])) ||  (color == 'b' && ![7,8,9,10,11,12].includes(board[i][col])) ){
                moves.push([i+1,col+1]); 
            }
            break;
        }
    }
    return moves;
}
function calculateBishopMoves(pieceString , cell){
    const row = cell[0]-1 , col = cell[1]-1 , color = getColor(pieceString);
    const moves = [];
    let i=row-1 , j=col-1;
    while (0<=i && i<=7 && 0<=j && j<=7){
        if (board[i][j] == 0)
            moves.push([i+1,j+1]);
        else{
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][j])) || (color == 'b' && ![7,8,9,10,11,12].includes(board[i][j])) )
                moves.push([i+1,j+1]);
            break;
        }
        i--;
        j--;
    }
    i = row-1;
    j = col+1;
    while (0<=i && i<=7 && 0<=j && j<=7){
        if (board[i][j] == 0)
            moves.push([i+1,j+1]);
        else{
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][j])) || (color == 'b' && ![7,8,9,10,11,12].includes(board[i][j])) )
                moves.push([i+1,j+1]);
            break;
        }
        i--;
        j++;
    }
    i = row+1;
    j = col+1;
    while (0<=i && i<=7 && 0<=j && j<=7){
        if (board[i][j] == 0)
            moves.push([i+1,j+1]);
        else{
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][j])) || (color == 'b' && ![7,8,9,10,11,12].includes(board[i][j])) )
                moves.push([i+1,j+1]);
            break;
        }
        i++;
        j++;
    }
    i = row+1;
    j = col-1;
    while (0<=i && i<=7 && 0<=j && j<=7){
        if (board[i][j] == 0)
            moves.push([i+1,j+1]);
        else{
            if ( (color == 'w' && ![1,2,3,4,5,6].includes(board[i][j])) || (color == 'b' && ![7,8,9,10,11,12].includes(board[i][j])) )
                moves.push([i+1,j+1]);
            break;
        }
        i++;
        j--;
    }
    return moves;
}
function calculateQueenMoves(pieceString,cell){
    return calculateRookMoves(pieceString , cell).concat(calculateBishopMoves(pieceString , cell));
}
function calculateKingMoves(cell){
    const row = cell[0] , col = cell[1] ;
    return [[row-1,col] ,[row+1,col] ,[row,col-1] ,[row,col+1] ,[row-1,col-1] ,[row+1,col+1] ,[row-1,col+1] ,[row+1,col-1]];
}


//TODO TOTOTOTODODODODODO
//TODO pion 2 moves 
function checkForChess(movingPiece , originCell , destCell){
    const color = getColor(movingPiece)
    const attackingPlayer = color == "w" ? "b" : "w" ;
    
    //simulating  the move
    const eatenPiece = numToPiece[board[destCell[0]-1][destCell[1]-1]];
    board[destCell[0]-1][destCell[1]-1] = pieceToNum[movingPiece]   // dest   <= movingPiece
    board[originCell[0]-1][originCell[1]-1] = 0  
    
    const defenderKingCell = findKingCell(color)
    let checkP = false;
    let checkN = false;
    let checkR = false;
    let checkB = false;
    let checkK = false;

    //attack from a pion
    checkP = attackingPlayer == "w" ? [board[defenderKingCell[0]+1-1][defenderKingCell[1]-1-1] , board[defenderKingCell[0]+1-1][defenderKingCell[1]+1-1]].includes(1) :  
                                              [board[defenderKingCell[0]-1-1][defenderKingCell[1]-1-1] , board[defenderKingCell[0]-1-1][defenderKingCell[1]+1-1]].includes(7) ;
    
    // attack from a knight
    checkN = attackingPlayer == "w" ? calculateKnightMoves(defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == 3) :
                                              calculateKnightMoves(defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == 9) ;
    //attack from a rook
    checkR =  attackingPlayer == "w" ? calculateRookMoves("bR",defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["wR"]) :
                                              calculateRookMoves("wR",defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["bR"]) ;
    //attack from a bishop
    checkB = attackingPlayer == "w" ? calculateBishopMoves("bB",defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["wB"]) :
                                              calculateBishopMoves("wB",defenderKingCell).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["bB"]) ;

    //attack from a king
    checkK  = attackingPlayer == "w" ? calculateKingMoves(defenderKingCell).filter(inBoard).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["wK"]) :
                                       calculateKingMoves(defenderKingCell).filter(inBoard).some( cell => board[cell[0]-1][cell[1]-1] == pieceToNum["bK"])


    board[originCell[0]-1][originCell[1]-1] = pieceToNum[movingPiece]
    board[destCell[0]-1][destCell[1]-1] = pieceToNum[eatenPiece]
    return checkP || checkN || checkR || checkB || checkK ;                                          
    }


// function checkForChess(movingPiece , originCell , destCell){
//     const color = getColor(movingPiece)
//     const attackingPlayer = color == "w" ? "b" : "w" ;
//     const defenerKingCell = color == "w" ? wKCell : bKCell;
//     if (["wK" , "bK"].includes(movePiece)) {            //king has moved  => king is now in chess 

//         return arrayIncludes( possibleMoves(`${attackingPlayer}K` , attackingPlayer == "w" ? wKCell : bKCell) , defenerKingCell)  

//     }
//     // <color> player has made the move. check if he is now in check from the other player.
//     // if so , move is not legal

//     //simulating  the move
//     const eatenPiece = board[destCell[0]-1][destCell[1]-1];
//     board[destCell[0]-1][destCell[1]-1] = pieceToNum[movingPiece]   // dest   <= movingPiece
//     board[originCell[0]-1][originCell[1]-1] = 0                     // origin <= 0
//     // if (movingPiece == 'wK') wKCell = destCell
//     // if (movingPiece == 'bK') bKCell = destCell
//     let check = false;
//     //check if there is an attack on the king now

//     //attack from a pion TODO!!!
//     check = check || attackingPlayer == "w" ? [board[bKCell[0]+1-1][bKCell[1]-1-1] , board[bKCell[0]+1-1][bKCell[1]+1-1]].includes(7) :  
//                                               [board[wKCell[0]-1-1][wKCell[1]-1-1] , board[wKCell[0]-1-1][wKCell[1]+1-1]].includes(1) ;
//       //attack from a knight
//     check = check || attackingPlayer == "w" ? possibleMoves("wN" , bKCell).some( cell => board[cell[0]-1][cell[1]-1] == "wN") :
//                                               possibleMoves("bN" , wKCell).some( cell => board[cell[0]-1][cell[1]-1] == "bN") ;
//     //attack from a bishop
//     //TODO
//     //attack from a rook
//     //TODO
//     //attack from a queen : no attack from bishop & no attack from rook => no attack from queen
    
//     //attack from king
//     check = check || arrayIncludes( possibleMoves(`${attackingPlayer}K` , attackingPlayer == "w" ? wKCell : bKCell) , defenerKingCell)  
    
//     board[originCell[0]-1][originCell[1]-1] = movingPiece
//     board[destCell[0]-1][destCell[1]-1] = eatenPiece
//     return check;
// }
function initMaps(){
    cellToElement = new Map();
    elementToCell = new Map();
    for (let row=1 ; row<=8 ; row++){
        for (let col=1 ; col<=8 ; col++){
            let elem = document.querySelector(`.row${row} .col${col}`)
            cellToElement.set( [row,col] , elem )
            elementToCell.set( elem , [row,col] )
        }
    }
}
function findKingCell(color) {
    const target = color == "w" ? 6 : 12;
    for (let i=0 ;i<=7 ; i++){
        for (let j=0 ;j<=7 ; j++){
            if (target == board[i][j])
                return [i+1,j+1];
        }
    }
    return -1;
}



//utils
function getRow(cell) {
    return Number(cell.parentElement.className.substring(7));
}
function getCol(cell) {
    return Number(cell.className.substring(8));
}
function getColor(pieceString){
    return pieceString.substring(0,1)
}
function arrayIncludes(bigger , smaller){
    return bigger.some(elem => JSON.stringify(elem)==JSON.stringify(smaller) )
}
function getPieceFromCell(cell){
    return cell.dataset.piece
}
function toggleNums (){
    const nums = document.querySelectorAll(".nums")
    const hidden = nums[0].style.display == "none" ? true : false ;
    nums.forEach (num  => num.style.display = hidden ? "flex" : "none" );
}
const inBoard = (pair) => (1<=pair[0] && pair[0]<=8 && 1<=pair[1] && pair[1]<=8) ;




init()





