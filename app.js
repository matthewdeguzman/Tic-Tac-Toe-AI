'use strict'

// html elements that will be updated
const userSelection = document.querySelector('.user-selection');
const xButton = document.querySelector('#x-button');
const oButton = document.querySelector('#o-button');
const turnPrompt = document.querySelector('#turn-prompt');
const newGameBtn = document.querySelector('#new-game-btn');
const bestMoveBtn = document.querySelector('#best-move-btn');
const gameButtons = document.getElementsByClassName('board-buttons');

// variables
var playerLetter = null;    // the letter the player will choose
var compLetter = null;
var hasWon = false;     // has someone won
var isTie = false;      // has the game ended in a tie
var gameEnded = false;  // keeps track of if the game has ended
var playerTurn = null;  // determines whether or not it is the user's turn
var moves = 0;

// data structures
var clickedButtons = new Set(); // creates a set to hold clicked game buttons

// creates a 2d gameboard
var gameBoard = 
[
    [null, null, null],
    [null, null, null],
    [null, null, null]
];
var record = {};    // dictionary that will hold all of the evaluated positions

// handles what letter the player has chosen
function selectionChosen(button) 
{
    // determines the letter based off of which one the user chose
    if(button.textContent == "x")
    {
        playerLetter = "x";
        compLetter = "o";
        playerTurn = true;
    }
    else 
    {
        playerLetter = "o";
        compLetter = "x";
        playerTurn = false;
    }

    userSelection.style.visibility = "hidden";   // hides the selection prompt

    // if the user chose o, the computer must move first
    if(!playerTurn) computerMove(compLetter);
}

// defines the behavior of a clicked game button
function blockClicked(button) 
{

    // if playerLetter is null, we haven't started the game yet and we don't register the click
    // or if the button has been added, it's been clicked already and we exit the function
    // or if game ended, we don't register the click
    if(playerLetter == null || clickedButtons.has(button) || gameEnded)
        return;

    // determines what letter shall be displayed based on whose turn it is
    var letter = playerTurn ? playerLetter : compLetter;

    // displays the letter  
    button.style.backgroundImage = letter == "x" ? "url('images/x.png')" : "url('images/o.png')";

    // add button to the set
    addButton(button, letter);

    // checks if the game has been won
    hasWon = checkWin(gameBoard);

    // if all buttons have been clicked or the game has been won we end the game
    if(clickedButtons.size == 9 || hasWon) 
    {
        endGame(); 
        return;
    }

    moves++;    // increment the number of moves
    playerTurn = !playerTurn;   // we reverse the player turn now

    // if it's not the player's turn, the computer now thinks about its next move
    if(!playerTurn) computerMove(compLetter);
}

// adds the button into the game
function addButton(button, letter) 
{
    // adds button the the clicked button set
    // and puts it into the gameBoard array

    clickedButtons.add(button);
    switch(button.textContent) 
    {
        case "top-left":
            gameBoard[0][0] = letter;
            break;
        case "top-mid":
            gameBoard[0][1] = letter;
            break;
        case "top-right":
            gameBoard[0][2] = letter;
            break;
        case "mid-left":
            gameBoard[1][0] = letter;
            break;
        case "mid-mid":
            gameBoard[1][1] = letter;
            break;
        case "mid-right":
            gameBoard[1][2] = letter;
            break;
        case "bot-left":
            gameBoard[2][0] = letter;
            break;
        case "bot-mid":
            gameBoard[2][1] = letter;
            break;
        case "bot-right":
            gameBoard[2][2] = letter;
            break;
    }
}

// checks the board to see if anyone has won
function checkWin(gameBoard, letter = null) 
{
    var ltr;
    // check every row and column
    for(let i = 0; i < 3; i++) {

        // checks row
        ltr = letter == null ? gameBoard[i][0] : letter;
        if(ltr != null && gameBoard[i][0] == ltr && gameBoard[i][1] == ltr && gameBoard[i][2] == ltr) 
            return true;

        // checks column
        ltr = letter == null ? gameBoard[0][i] : letter;
        if(ltr != null && gameBoard[0][i] == ltr && gameBoard[1][i] == ltr && gameBoard[2][i] == ltr) 
            return true;
    }

    // checks the left diagonal
    ltr = letter == null ? gameBoard[0][0] : letter;
    if(ltr != null && gameBoard[0][0] == ltr && gameBoard[1][1] == ltr && gameBoard[2][2] == ltr) 
        return true;

    // checks right diagonal
    ltr = letter == null ? gameBoard[0][2] : letter;
    if(ltr != null && gameBoard[0][2] == ltr && gameBoard[1][1] == ltr && gameBoard[2][0] == ltr) 
        return true;

    // no on has won yet
    return false;
}

// checks if there is a tie
function checkTie(gameBoard) 
{ 

    // checks if the game has won with the current positin
    if(checkWin(gameBoard)) return false;

    // if there is an empty space within the board, it cannot be a tie yet
    for(let i = 0; i < gameBoard.length; i++) 
    {
        for(let j = 0; j < gameBoard[0].length; j++) 
            if(gameBoard[i][j] == null) return false;
    }

    // it's a tie bc the board seems to be filled and the game has not been won
    return true;
}

// ends the game once the board has been filled
function endGame() 
{
    gameEnded = true;

    // if the game is over but there is no winner, the game is a tie
    if(!hasWon) 
    {
        isTie = true;
        turnPrompt.textContent = "It's a tie!"
    }
    
    // check if the user has won
    if(hasWon && playerTurn) turnPrompt.textContent = "Player Wins!"
    else if(hasWon && !playerTurn) turnPrompt.textContent = "Player lost!";
}

// restarts the game
function newGame() 
{
    // removes picture from every button
    for(let i = 0; i < gameButtons.length; i++)
        gameButtons[i].style.backgroundImage = "none";
    
    // clears all data structures and variables
    clickedButtons.clear();
    record = {};
    for(let i = 0; i < gameBoard.length; i++) { gameBoard[i].fill(null); }
    playerTurn = null;
    hasWon = false;
    isTie = false;
    playerLetter = null;
    gameEnded = false;
    moves = 0;
    
    turnPrompt.textContent = "";    // removes text from the player turn prompt
    userSelection.style.visibility = "visible"; // makes the user selection prompt visible again
}

// minimax algorithm to compute the best move
function minimax(position, depth, alpha, beta, maximizingPlayer)
{
    // if we've already evaluated this position, we return the evaluation
    if(record[position] != null)
        return record[position];

    // if we are at the minimum depth or the game has ended, we return the evaluation
    if(depth == 0 || checkWin(position) || checkTie(position)) 
    {

        // the evaluation number
        let evl = 0;

        // if x has won, we add 10 to the evaluation
        // if o has won, we subtract 10 from the evaluation
        // these operations should tip the algorithm to choose the moves
        // that lead to these outcomes
        if(checkWin(position, "x")) evl += 20;
        else if(checkWin(position, "o")) evl -= 20;

        // encourages placing in center
        if(position[1][1] != null)
            evl = position[1][1] == "x" ? evl + 5 : evl - 5;

        // encourages placing in corners
        if(position[0][0] != null)
            evl = position[0][0] == "x" ? evl + 1 : evl - 1;
        if(position[0][2] != null)
            evl = position[0][2] == "x" ? evl + 1 : evl - 1;
        if(position[2][0] != null) 
            evl = position[2][0] == "x" ? evl + 1 : evl - 1;
        if(position[2][2] != null)
            evl = position[2][2] == "x" ? evl + 1 : evl - 1;

        // encourage blocking two in a row
        for(let i = 0; i < 3; i++) 
        {

            // blocks two letters that are connected horizontally on the right
            if(position[i][0] == "x" && position[i][1] == "o") 
            {
                evl++;
                if(position[i][2] == "o") evl += 5;
            }
            else if(position[i][0] == "o" && position[i][1] == "x") 
            {
                evl--;
                if(position[i][2] == "x") evl -= 5;
            }

            // blocks two letters that are connected horizontally on the left
            if(position[i][2] == "x" && position[i][1] == "o") 
            {
                evl++;
                if(position[i][0] == "o") evl += 5;
            }
            else if(position[i][2] == "o" && position[i][1] == "x") 
            {
                evl--;
                if(position[i][0] == "x") evl -= 5;
            }

            // blocks two letters that are connected vertically from the top
            if(position[2][i] == "x" && position[1][i] == "o") 
            {
                evl++;
                if(position[0][i] == "o") evl += 5;
            }
            else if(position[2][i] == "o" && position[1][i] == "x") 
            {
                evl--;
                if(position[0][i] == "x") evl -= 5;
            }

            // blocks two letters that are connected vertically from the bottom
            if(position[0][i] == "x" && position[1][i] == "o") 
            {
                evl++;
                if(position[2][i] == "o") evl += 5;
            }
            else if(position[0][i] == "o" && position[1][i] == "x") 
            {
                evl--;
                if(position[2][i] == "x") evl -= 5;
            }
        }

        // blocks from top right corner
        if(position[0][0] == "x" && position[1][1] == "o")
        {
            evl++;
            if(position[2][2] == "o") evl += 5;
        }
        else if(position[0][0] == "o" && position[1][1] == "x")
        {
            evl--;
            if(position[2][2] == "x") evl -= 5;
        }

        // blocks from top left corner
        if(position[0][2] == "x" && position[1][1] == "o") {
            evl++;
            if(position[2][0] == "o") evl -= 5;
        }
        else if(position[0][2] == "o" && position[1][1] == "x") {
            evl--;
            if(position[2][0] == "x") evl -= 5;
        }

        // blocks from bottom left corner
        if(position[2][0] == "x" && position[1][1] == "o") {
            evl--;
            if(position[0][2] == "o") evl -= 5;
        }
        else if(position[2][0] == "o" && position[1][1] == "x") {
            evl--;
            if(position[0][2] == "x") evl -= 5;
        }

        // blocks from bottom right corner
        if(position[2][2] == "x" && position[1][1] == "o") {
            evl--;
            if(position[0][0] == "o") evl -= 5;
        }
        else if(position[2][2] == "o" && position[1][1] == "x") {
            evl--;
            if(position[0][0] == "x") evl -= 5;
        }
        // insert position and evl into dictionary
        record[position] = evl;
        return evl;
    }

    // we are checking if we need to maximize the player score
    // this means we are evaluating x's position
    if(maximizingPlayer) 
    {
        let maxEval = -Infinity;
        
        // loop through the position array and insert an x in any free space
        for(let i = 0; i < position.length; i++) 
        {
            for(let j = 0; j < position[0].length; j++) 
            {
                if(position[i][j] == null) 
                {
                    // if there is an empty space, we fill it with an x
                    position[i][j] = "x"

                    // get the evaluation at the position
                    let evl = minimax(position, depth-1, alpha, beta, false);

                    maxEval = Math.max(maxEval, evl); // finds the max between the maxEval and the current evl
                    alpha = Math.max(alpha, evl);

                    // take away move after evaluation
                    position[i][j] = null;

                    // alpha beta pruning
                    if (beta <= alpha) break;
                }
            }
        }

        return maxEval;
    }

    else 
    {
        // if we are not maximizing the evaluation, we are evaluation o's position
        let minEval = Infinity;
        for(let i = 0; i < position.length; i++) 
        {
            for(let j = 0; j < position[0].length; j++) 
            {
                if(position[i][j] == null) 
                {
                    position[i][j] = "o";

                    // get evaluation at new position
                    let evl = minimax(position, depth-1, alpha, beta, true);

                    minEval = Math.min(minEval, evl);   // we want the lowest evaluation
                    beta = Math.min(beta, evl);

                    position[i][j] = null;

                    if(beta <= alpha) break;
                }
            }
        }
        return minEval;
    }

}

// finds the best move using the minimax algorithm
function computeBestMove(letter) 
{
    // the position and evalution of the best move
    let row = null;
    let col = null;
    let evaluation = null;

    // places the letter into the board and evaluates
    // the best possible outcome
    for(let i = 0; i < gameBoard.length; i++) 
    {
        for(let j = 0; j < gameBoard[0].length; j++) 
        {
            if(gameBoard[i][j] == null) 
            {
                gameBoard[i][j] = letter;

                // we find the evl at the current position
                // !(letter == "x") - if we have just put in x, we want to find the best possible
                // move for o, so we set maximizing player to false
                // the depth we go depends on how far in the game we are, 9-moves always goes until the
                // board is filled up because there are 9 tiles on the board
                var ev = minimax(gameBoard, 9-moves, -Infinity, Infinity, !(letter == "x"));

                // we update the variables if we find a better positionor we find the first evaluation
                if(evaluation == null || (letter == "x" && ev > evaluation) || (letter == "o" && ev < evaluation)) 
                {
                    row = i;
                    col = j;
                    evaluation = ev;
                }

                // remove placed letter from board
                gameBoard[i][j] = null;
            }
        }
    }

    // print evaluation
    console.log(evaluation);

    // show the best move
    gameButtons[(row * 3) + col].style.backgroundImage = letter == "x" ? "url('images/x-shadow.png')" : "url('images/o-shadow.png')";

    return (row * 3) + col;   // returns the position of the best move
}

// finds and executes the best computer move
function computerMove(letter) 
{
    blockClicked(gameButtons[computeBestMove(letter)]);   // simulates the block being clicked on the position
}

xButton.addEventListener('click', () => {selectionChosen(xButton);});
oButton.addEventListener('click', () => {selectionChosen(oButton);});
newGameBtn.addEventListener('click', () => {newGame();});
bestMoveBtn.addEventListener('click', () => {computeBestMove(playerLetter);});

// adds an event listener to every game button
for(let i = 0; i < gameButtons.length; i++)
    gameButtons[i].addEventListener('click', () => {blockClicked(gameButtons[i]);});