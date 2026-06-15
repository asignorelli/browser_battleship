import { useState } from 'react'

function App() {

  //grid definitions 
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]


  //my united states of battleshiplandia--------------------

  //player info states
  const [screen, setScreen] = useState('player1Info')
  const [currPlayer, setCurrPlayer] = useState('1')

  const [player1Name, setPlayer1Name] = useState('')
  const [player1Ships, setPlayer1Ships] = useState('')

  const [player2Name, setPlayer2Name] = useState('')
  const [player2Ships, setPlayer2Ships] = useState('')


  //shooting states
  const [player1Shots, setPlayer1Shots] = useState({})
  const [player2Shots, setPlayer2Shots] = useState({})

  const [dialogMessage, setDialogMessage] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [invalidShot, setInvalidShot] = useState(false)


  //end game states
  const [winner, setWinner] = useState('')
  const [pendingScreen, setPendingScreen] = useState('startGame')


  //----------------------------PLACING SHIPS LOGIC--------------------------------
  //these two are used to convert between letters and numbers for ship placement on the grid
  function columnToNumber(col) {
    return columns.indexOf(col)
  }
  function numberToColumn(num) {
    return columns[num]
  }

  //convert the string into a coordinate
  function parseCoord(str) {
    const col = str[0]
    const row = parseInt(str.slice(1))
    return [columnToNumber(col), row]
  }

  //return object with the ships type and coords
  function placeShip(coordStr) {
    const type = coordStr[0];
    const coords = coordStr.substring(2, coordStr.length - 1);
    const [start, end] = coords.split('-');
    const [startColNum, startRow] = parseCoord(start);
    const [endColNum, endRow] = parseCoord(end);

    const positions = {};

    //check for verticality
    if (startColNum === endColNum) {
      const col = start[0]

      for (let row = startRow; row <= endRow; row++) {
        positions[col + row] = type
      }
    }
    //horizontal
    else {
      for (let colNum = startColNum; colNum <= endColNum; colNum++) {
        const col = numberToColumn(colNum)
        positions[col + startRow] = type
      }
    }
    return positions;
  }

  //place the ships for both players
  function placeAllShips(shipString) {
    const shipPlacements = shipString.split(';').filter(s => s.length > 0)
    const allPositions = {}

    for (const placement of shipPlacements) {
      const shipPositions = placeShip(placement)

      for (const key in shipPositions) {
        allPositions[key] = shipPositions[key]
      }
    }
    return allPositions
  }

  //--------------------------END GAME LOGIC-------------------------------------------
  //check for sinking of ship type
  function isShipSunk(shipType, shipPositions, shots) {

    //keep track of how many boxes the ship type has
    let shipCellCount = 0

    //keep track of how many been hit
    let hitCount = 0

    //loop thru positions
    for (const coord in shipPositions) {

      //see if its the correct ship type
      if (shipPositions[coord] === shipType) {
        shipCellCount = shipCellCount + 1

        //check for hit
        if (shots[coord] === 'hit') {
          hitCount = hitCount + 1
        }
      }
    }
    //ship is sunk if true
    return hitCount === shipCellCount
  }

  //check if player lost
  function hasLost(shipPositions, shots) {
    const aircraftSunk = isShipSunk('A', shipPositions, shots)
    const battleshipSunk = isShipSunk('B', shipPositions, shots)
    const submarineSunk = isShipSunk('S', shipPositions, shots)

    return aircraftSunk && battleshipSunk && submarineSunk
  }

  //get ending scores
  function calculateScore(oppShots) {
    
    let score = 24
    //count the total hits
    let hitCount = 0
    for (const coord in oppShots) {
      if (oppShots[coord] === 'hit') {
        hitCount++
      }
    }
    //then subtract by 2 for each hit
    score -= (hitCount * 2)
    return score
  }

  //------------screens--------------------------------------------------------

  //------------------------INTRO LOGIC-------------------------------------------
  //get player 1 name, make the screen
  if (screen === 'player1Info') {
    return (
      //make it look slightly nicer
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to my sweet Battleship Game!</h1>
        <h2>Player 1, enter your name:</h2>

        <label htmlFor="player1-name">Name:</label>
        <input id="player1-name" value={player1Name} onChange={(e) => setPlayer1Name(e.target.value)} placeholder="Enter name here" />

        <h2>Enter your ship locations:</h2>
        <p>EXAMPLE: A(A1-A5);B(B6-E6);S(H3-J3);</p>
        <label htmlFor="player1-ships">Ship placements:</label>
        <input id="player1-ships" value={player1Ships} onChange={(e) => setPlayer1Ships(e.target.value)} placeholder="Enter ship coords" />

        <button onClick={() => setScreen('player2Info')}>
          Continue
        </button>
      </div>
    )
  }

  //player 2 name screen
  if (screen === 'player2Info') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to my sweet Battleship Game!</h1>
        <h2>Player 2, enter your name:</h2>

        <label htmlFor="player2-name">Name:</label>
        <input id="player2-name" value={player2Name} onChange={(e) => setPlayer2Name(e.target.value)} placeholder="Enter name here" />

        <h2>Enter your ship locations:</h2>
        <p>EXAMPLE: A(A1-A5);B(B6-E6);S(H3-J3);</p>
        <label htmlFor="player2-ships">Ship placements:</label>
        <input id="player2-ships" value={player2Ships} onChange={(e) => setPlayer2Ships(e.target.value)} placeholder="Enter ship coords" />

        <button aria-label="Start Game" onClick={() => setScreen('startGame')}>
          Start Game
        </button>
      </div>
    )
  }

  //-------------------CHANGE TURNS SCREEN LOGIC----------------------------
  if (screen === 'startGame') {
    let playerName

    if (currPlayer === '1') {
      playerName = player1Name
    }
    else {
      playerName = player2Name
    }

    return (
      <dialog open role="dialog" aria-label={"Click OK to begin " + playerName + "'s turn"}
        style={{ position: 'fixed', top: '50%', left: '20%', transform: 'translate(-50%, -50%)', padding: '20px', border: '2px solid black', fontSize: '20px', zIndex: 1000, backgroundColor: 'white' }}>
        <p>Click OK to begin {playerName}'s turn</p>
        <button onClick={() => setScreen('playGame')}>
          OK
        </button>
      </dialog>
    )
  }


  //-------------------GAME OVER LOGIC----------------------------
  if (screen === 'gameOver') {

    //find ending scores
    const player1ShipPositions = placeAllShips(player1Ships)
    const player2ShipPositions = placeAllShips(player2Ships)

    const player1Score = calculateScore(player1ShipPositions, player2Shots)
    const player2Score = calculateScore(player2ShipPositions, player1Shots)

    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Game Over</h1>
        <div style={{ marginTop: '30px' }}>
          <h3>Final Scores:</h3>
          <p>{player1Name}: {player1Score} pts</p>
          <p>{player2Name}: {player2Score} pts</p>
        </div>
      </div>
    )
  }

  //--------------------GAME LOGIC---------------------------------
  if (screen === 'playGame') {
    //determine the names for things
    let playerName
    let currPlayerShips

    if (currPlayer === '1') {
      playerName = player1Name
      currPlayerShips = player1Ships
    }
    else {
      playerName = player2Name
      currPlayerShips = player2Ships
    }
    //place the current players ships
    const ships = placeAllShips(currPlayerShips)

    let opponentShips
    let opponentShipPositions
    let currentShots
    let setCurrentShots

    if (currPlayer === '1') {
      opponentShips = player2Ships
      currentShots = player1Shots
      setCurrentShots = setPlayer1Shots
    }
    else {
      opponentShips = player1Ships
      currentShots = player2Shots
      setCurrentShots = setPlayer2Shots
    }
    //then opponents ships
    opponentShipPositions = placeAllShips(opponentShips)

    //----------shooting functions-----------------
    function isFired(coord) {
      return currentShots[coord] !== undefined
    }
    function isHit(coord) {
      return opponentShipPositions[coord] !== undefined
    }

    function shootAt(coord) {
      //ensure it wasnt fire before shooting at it
      if (isFired(coord)) {
        setInvalidShot(true)
        setDialogMessage('Invalid Selection. Try Again.')
        setShowDialog(true)
        return
      }

      //decide hit or miss
      const hit = isHit(coord)
      let result
      if (hit) {
        result = 'hit'
      }
      else {
        result = 'miss'
      }

      //copy currentshots
      const updatedShots = {}
      for (const key in currentShots) {
        updatedShots[key] = currentShots[key]
      }

      //add new one
      updatedShots[coord] = result
      setCurrentShots(updatedShots)

      //check for any sinkage
      let message = ''
      if (hit) {
        const hitShipType = opponentShipPositions[coord]

        //using updated shots for sinking so any current shots r counted
        if (isShipSunk(hitShipType, opponentShipPositions, updatedShots)) {
          let shipName = ''
          if (hitShipType === 'A') {
            shipName = 'Aircraft Carrier'
          }
          else if (hitShipType === 'B') {
            shipName = 'Battleship'
          }
          else if (hitShipType === 'S') {
            shipName = 'Submarine'
          }
          message = 'Hit! You sunk the ' + shipName + '!'

          //check if opponent lost
          if (hasLost(opponentShipPositions, updatedShots)) {
            setWinner(playerName)
            setPendingScreen('gameOver')
            message = 'Hit! You sunk the ' + shipName + '! ' + playerName + ' wins!'
          }
        }
        else {
          message = 'Hit!'
        }
      }
      else {
        message = 'Miss!'
      }
      setDialogMessage(message)
      setShowDialog(true)
    }


    //--------------------DISPLAYIN THE GRIDS----------------------------
    return (
      <div>
        <h1 style={{ textAlign: 'center' }}>{playerName}'s Turn</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px' }}>
          <div>
            <h2>{playerName}'s Board</h2>
            <div style={{ display: 'flex', marginLeft: '40px' }}>
              {columns.map(col => (
                <div key={col} style={{ width: '41px', textAlign: 'center' }}>
                  {col}
                </div>
              ))}
            </div>

            <div role="grid" aria-label={playerName + "'s Ships"}>
              <div style={{ display: 'none' }}>
                {columns.map(col => <span key={col}>{col}</span>)}
                {rows.map(row => <span key={row}>{row}</span>)}
              </div>
              {rows.map(row => (
                <div key={row} style={{ display: 'flex' }}>
                  <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {row}
                  </div>

                  {columns.map(col => {
                    const coord = col + row
                    const shipType = ships[coord]

                    //check for a hit
                    let oppShots
                    if (currPlayer === '1') {
                      oppShots = player2Shots
                    }
                    else {
                      oppShots = player1Shots
                    }

                    const isHit = oppShots[coord]

                    //change the color based on hit/miss
                    let bgColor = 'lightblue'
                    if (isHit === 'hit') {
                      bgColor = 'red'
                    }
                    if (isHit === 'miss') {
                      bgColor = 'white'
                    }

                    return (
                      <div key={coord} aria-label={coord}
                        style={{ width: '40px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor }}>
                        {shipType}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>


          <div>
            <h2>{playerName}'s Enemy Board</h2>

            <div style={{ display: 'flex', marginLeft: '40px' }}>
              {columns.map(col => (
                <div key={col} style={{ width: '41px', textAlign: 'center' }}>
                  {col}
                </div>
              ))}
            </div>

            <div role="grid" aria-label={playerName + "'s Enemy"}>
              <div style={{ display: 'none' }}>
                {columns.map(col => <span key={col}>{col}</span>)}
                {rows.map(row => <span key={row}>{row}</span>)}
              </div>
              {rows.map(row => (
                <div key={row} style={{ display: 'flex' }}>
                  <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {row}
                  </div>

                  {columns.map(col => {
                    const coord = col + row
                    const shotResult = currentShots[coord]

                    //change the color based on hit/miss
                    let bgColor = 'lightblue'
                    if (shotResult === 'hit') {
                      bgColor = 'red'
                    }
                    if (shotResult === 'miss') {
                      bgColor = 'white'
                    }

                    let cellClass = 'cell--interactive'
                    if (shotResult === 'hit') {
                      cellClass = 'cell--hit'
                    }
                    if (shotResult === 'miss') {
                      cellClass = 'cell--miss'
                    }

                    return (
                      <button key={coord} onClick={() => shootAt(coord)} aria-label={"Fire at " + coord} className={cellClass}
                        style={{ width: '40px', height: '40px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor }}>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>

        {showDialog && (<dialog open role="dialog" aria-label={dialogMessage}
          style={{ position: 'fixed', top: '50%', padding: '5%', paddingLeft: '10%', paddingRight: '10%', border: '2px solid black', fontSize: '25px', zIndex: 1000, backgroundColor: 'white' }}>
          <p>{dialogMessage}</p>
          <button onClick={() => {
            setShowDialog(false)
            if (invalidShot) {
              setInvalidShot(false)
              return
            }
            if (pendingScreen === 'gameOver') {
              setScreen('gameOver')
            }
            else {
              setPendingScreen('startGame')
              if (currPlayer === '1') {
                setCurrPlayer('2')
              }
              else {
                setCurrPlayer('1')
              }
              setScreen('startGame')
            }
          }}>
            OK
          </button>
        </dialog>
        )}
      </div>
    )
  }
}
export default App