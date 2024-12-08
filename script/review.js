// After language load
document.addEventListener("DOMContentLoaded", () => {
  changeLanguage();
  generateReviewBoard();
  fetchGames();
});

const strapiEndpoint = "https://odevzdavani.tourdeapp.cz/fishbush/api/amos-game-statistics?sort[0]=createdAt:desc&pagination[limit]=10"; 
// Adjust to match your Strapi setup. Example: https://your-strapi-site.com/api/amos-game-statistics
// Include sort & limit parameters according to Strapi docs.

const boardSize = 15;
let currentBoardState = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

let moves = [];
let currentMoveIndex = 0; // How many moves have been placed on the board
let playing = false;
let playInterval;

// Fetch the last 10 games
async function fetchGames() {
  try {
      const response = await fetch(strapiEndpoint, {
          headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer af312d2b769a633db7092ca1fa1c8235c07f07cd0399d2d3bfa931ac893551244e04801177e3b29f8ff256af264dad2135be75bc76b8a4156402e6d328cfac8e1c3f17d218ca43813b7402d502e7df9ec8cd85bee713de3523968bdc5d253b39b68af9df8842205f771a36650c15d561a8d6b8826cd3484ca8ff3cecc2f75ecf"
            }
      });
      const data = await response.json();
      populateGamesList(data.data);
  } catch (error) {
      console.error("Error fetching games:", error);
  }
}

function populateGamesList(games) {
  const gamesList = document.getElementById("games-list");
  gamesList.innerHTML = "";

  games.forEach((game, index) => {
      const gameEl = document.createElement("div");
      gameEl.className = "cursor-pointer bg-blue text-white rounded-lg px-3 py-2 flex items-center justify-between hover:bg-darkGray transition-colors";
      gameEl.innerHTML = `<span>Hra #${index + 1}</span><span class="text-sm">${new Date(game.attributes.createdAt).toLocaleString()}</span>`;
      gameEl.onclick = () => displayGame(game.attributes);
      gamesList.appendChild(gameEl);
  });
}

function generateReviewBoard() {
  const boardEl = document.getElementById("review-board");
  boardEl.innerHTML = "";

  // Create fragment for performance
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
          const boardBox = document.createElement('div');
          boardBox.className = 'board-box';
          fragment.appendChild(boardBox);
      }
  }
  boardEl.appendChild(fragment);
}

function displayGame(gameData) {
  // Hide menu, show game view
  document.getElementById("review-menu").classList.add("hidden");
  document.getElementById("review-game").classList.remove("hidden");
  document.getElementById("review-game").classList.add("flex");

  // Store moves
  moves = gameData.moves || [];
  currentMoveIndex = 0;
  stopPlay();

  // Clear board and render at currentMoveIndex = 0
  renderBoardState();

  const winnerText = document.getElementById("review-winner");
  if (gameData.winner === "x") {
      winnerText.innerHTML = config.elements.gameWinCross[config.selectedLanguage] || "Křížek vyhrál";
  } else if (gameData.winner === "o") {
      winnerText.innerHTML = config.elements.gameWinCircle[config.selectedLanguage] || "Kolečko vyhrálo";
  } else if (gameData.winner === "draw") {
      winnerText.innerHTML = config.elements.gameWinDraw[config.selectedLanguage] || "Remíza";
  } else {
      winnerText.innerHTML = "";
  }

  updateMoveCounter();
}

function renderBoardState() {
  // Clear board
  currentBoardState = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  const boardBoxes = document.querySelectorAll('#review-board .board-box');
  for (box of boardBoxes) {
      box.innerHTML = "";
  }

  // Place moves up to currentMoveIndex
  let player = true; // start with x
  for (let i = 0; i < currentMoveIndex; i++) {
      const move = moves[i];
      placeSymbolOnReviewBoard(move.x, move.y, player);
      player = !player;
  }

  updateMoveCounter();
}

function placeSymbolOnReviewBoard(x, y, player) {
  const linearCoords = 15 * y + x;
  const boardBoxes = document.querySelectorAll('#review-board .board-box');
  const img = document.createElement('img');
  img.src = `assets/img/${player ? "x" : "o"}.svg`;
  boardBoxes[linearCoords].appendChild(img);
}

function goToStart() {
  stopPlay();
  currentMoveIndex = 0;
  renderBoardState();
}

function stepBackward() {
  stopPlay();
  if (currentMoveIndex > 0) {
      currentMoveIndex--;
      renderBoardState();
  }
}

function stepForward() {
  stopPlay();
  if (currentMoveIndex < moves.length) {
      currentMoveIndex++;
      renderBoardState();
  }
}

function goToEnd() {
  stopPlay();
  currentMoveIndex = moves.length;
  renderBoardState();
}

function togglePlay() {
  if (playing) {
      stopPlay();
  } else {
      startPlay();
  }
}

function startPlay() {
  playing = true;
  document.getElementById("play-pause-btn").textContent = "Pauza";
  playInterval = setInterval(() => {
      if (currentMoveIndex < moves.length) {
          currentMoveIndex++;
          renderBoardState();
      } else {
          stopPlay();
      }
  }, 500); // autoplay speed
}

function stopPlay() {
  playing = false;
  document.getElementById("play-pause-btn").textContent = "Přehrát";
  clearInterval(playInterval);
}

function updateMoveCounter() {
  const counter = document.getElementById("move-counter");
  counter.textContent = `${currentMoveIndex}/${moves.length}`;
}

function showReviewMenu() {
  document.getElementById("review-menu").classList.remove("hidden");
  document.getElementById("review-game").classList.add("hidden");
  document.getElementById("review-game").classList.remove("flex");
  stopPlay();
}