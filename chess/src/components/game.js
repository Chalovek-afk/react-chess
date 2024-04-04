import React from 'react';
import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallen_pieces_block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import King from '../pieces/king.js';
import ReactModal from 'react-modal';
import Piece from '../pieces/piece.js';


export default class Game extends React.Component {
  constructor(){
    super();
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white',
      win: false,
      showModal: false
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  };

  handleOpenModal () {
    this.setState({ showModal: true });
  }
  
  handleCloseModal () {
    this.setState({ 
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white',
      win: false,
      showModal: false
     });
  } 
 
  handleClick(i){
    if (!this.state.win){
      const squares = this.state.squares.slice();
      
      if(this.state.sourceSelection === -1){
        if(!squares[i] || squares[i].player !== this.state.player){
          this.setState({status: "Wrong selection. Choose player " + this.state.player + " pieces."});
        }
        else{
          squares[i].style = {...squares[i].style, backgroundColor: "RGB(70, 130, 180)"};
          const showPath = squares[i].getPossiblePos(i)
          for (let j of showPath) {

            squares[j] = new Piece(this.state.player)
            squares[j].style = {...squares[j].style, backgroundColor: "RGB(255, 228, 181)"};
          };
          this.setState({
            status: "Choose destination for the selected piece",
            sourceSelection: i,
            squares: squares,
          });
        }
      }

      else if(this.state.sourceSelection > -1){ 
        if(squares[i] && squares[i].player === this.state.player && squares[i].constructor.name !== 'Piece'){
          squares[this.state.sourceSelection].style = {...squares[this.state.sourceSelection].style, backgroundColor: ""};
          this.setState({
            status: "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1,
          });

        }
        else{
          const squares = this.state.squares.slice();
          const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
          const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
          const isDestEnemyOccupied = squares[i] && squares[i].constructor.name !== "Piece"? true : false; 
          const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
          const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
          const isMoveLegal = this.isMoveLegal(srcToDestPath);
          if(isMovePossible && isMoveLegal){
            if(squares[i] !== null){
              if(squares[i].player === 1 && squares[i].constructor.name !== "Piece"){
                whiteFallenSoldiers.push(squares[i]);
              }
              else if (squares[i].player === 2 && squares[i].constructor.name !== "Piece"){
                blackFallenSoldiers.push(squares[i]);
              }
            }
            console.log("whiteFallenSoldiers", whiteFallenSoldiers) ;
            console.log("blackFallenSoldiers", blackFallenSoldiers);
            if (squares[i] instanceof King) {
              squares[i] = squares[this.state.sourceSelection];
              squares[i].style = {...squares[i].style, backgroundColor: ""}
              squares[this.state.sourceSelection] = null;
              this.setState({
                sourceSelection: -1,
                squares: squares,
                whiteFallenSoldiers: whiteFallenSoldiers,
                blackFallenSoldiers: blackFallenSoldiers,
                win: true,
                status: `Player ${this.state.player} won the game!`,
                showModal: true
              });
              return
            }
            const showPath = squares[this.state.sourceSelection].getPossiblePos(this.state.sourceSelection)
            squares[i] = squares[this.state.sourceSelection];
            squares[i].style = {...squares[i].style, backgroundColor: ""}
            squares[this.state.sourceSelection] = null;
            let player = this.state.player === 1? 2: 1;
            let turn = this.state.turn === 'white'? 'black' : 'white';
            console.log(squares)
            console.log(srcToDestPath)
            for (let j of srcToDestPath) {
              console.log(j)
            }
            for (let j of showPath) {
              squares[j].style = {...squares[j].style, backgroundColor: ""};
              if (squares[j].constructor.name === 'Piece'){
                console.log(squares[j])
                squares[j] = null
              };
            }
            console.log(squares)
            this.setState({
              sourceSelection: -1,
              squares: squares,
              whiteFallenSoldiers: whiteFallenSoldiers,
              blackFallenSoldiers: blackFallenSoldiers,
              player: player,
              status: '',
              turn: turn
            });
          }
          else { 
            squares[this.state.sourceSelection].style = {...squares[this.state.sourceSelection].style, backgroundColor: ""};
            this.setState({
              status: "Wrong selection. Choose valid source and destination again.",
              sourceSelection: -1,
            });
          }
        }
      }
    }
  }

  isMoveLegal(srcToDestPath){
    let isLegal = true;
    for(let i = 0; i < srcToDestPath.length; i++){
      if(this.state.squares[srcToDestPath[i]] !== null && this.state.squares[srcToDestPath[i]].constructor.name !== "Piece" ){
        isLegal = false;
      }
    }
    return isLegal;
  }

  render() {

    return (
      <div>
          <div className="game-board">
            <Board 
            squares = {this.state.squares}
            onClick = {(i) => this.handleClick(i)}
            />
          </div>
        <div className="game-info">
            <h3>Turn</h3>
            <div id="player-turn-box" style={{backgroundColor: this.state.turn}}>
  
            </div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">
              
              {<FallenSoldierBlock
              whiteFallenSoldiers = {this.state.whiteFallenSoldiers}
              blackFallenSoldiers = {this.state.blackFallenSoldiers}
              />
            }
            </div>    
        </div>
        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Modal Window"
           className="Modal"
           overlayClassName="Overlay">
              <div>
                <h3>End of the Game!</h3>
                <p>
                {this.state.turn.charAt(0).toUpperCase() + this.state.turn.slice(1)} side won!
                </p>
            </div>
            <button class="btn" onClick={this.handleCloseModal}>Restart</button>
        </ReactModal>
    </div>
      );
  }
}