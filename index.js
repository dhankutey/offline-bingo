const layouts = [
  { size: 5, max: 25, label: '5x5, 1-25', class: 'board-5x5' },
  { size: 7, max: 49, label: '7x7, 1-49', class: 'board-7x7' },
  { size: 10, max: 100, label: '10x10, 1-100', class: 'board-10x10' }
];

let current = 0;
let marked = new Set();
let cellsGrid = [];
let completedLines = 0;
let gameOver = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function render() {
  const layout = layouts[current];
  const board = document.getElementById('board');
  
  // Clean classes and apply correct sizing scale variables from CSS
  board.className = 'bingo-board ' + layout.class;
  board.style.gridTemplateColumns = `repeat(${layout.size}, 1fr)`;
  board.innerHTML = '';
  
  // Reset engine states
  marked = new Set();
  cellsGrid = [];
  completedLines = 0;
  gameOver = false;

  // Clear visual highlights from tracker and message displays
  document.querySelectorAll('#bingoDisplay .letter').forEach(s => s.classList.remove('active'));
  document.getElementById('winMessage').style.display = 'none';

  const nums = shuffle(Array.from({ length: layout.max }, (_, i) => i + 1));
  const size = layout.size;

  for (let r = 0; r < size; r++) {
    cellsGrid.push([]);
    for (let c = 0; c < size; c++) {
      const n = nums[r * size + c];
      const cell = document.createElement('div');
      cell.textContent = n;
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('click', () => {
        if (gameOver || cell.classList.contains('locked') || cell.classList.contains('marked')) return;
        marked.add(n);
        cell.classList.add('marked');
        checkLines(size);
      });

      cellsGrid[r].push(cell);
      board.appendChild(cell);
    }
  }

  // Handle active button state classes
  document.querySelectorAll('.layoutBtn').forEach((btn, i) => {
    btn.classList.toggle('active', i === current);
  });
}

function checkLines(size) {
  let newlyCompleted = [];

  // Check Rows
  for (let r = 0; r < size; r++) {
    const cells = cellsGrid[r];
    if (cells.every(c => marked.has(parseInt(c.textContent))) && !cells[0].classList.contains('lineDone')) {
      newlyCompleted.push(cells);
    }
  }
  
  // Check Columns
  for (let c = 0; c < size; c++) {
    const cells = cellsGrid.map(row => row[c]);
    if (cells.every(cell => marked.has(parseInt(cell.textContent))) && !cells[0].classList.contains('lineDone')) {
      newlyCompleted.push(cells);
    }
  }
  
  // Check Diagonals
  const diag1 = cellsGrid.map((row, i) => row[i]);
  if (diag1.every(cell => marked.has(parseInt(cell.textContent))) && !diag1[0].classList.contains('lineDone')) {
    newlyCompleted.push(diag1);
  }
  
  const diag2 = cellsGrid.map((row, i) => row[size - 1 - i]);
  if (diag2.every(cell => marked.has(parseInt(cell.textContent))) && !diag2[0].classList.contains('lineDone')) {
    newlyCompleted.push(diag2);
  }

  newlyCompleted.forEach(line => {
    completedLines++;
    line.forEach(cell => {
      cell.classList.add('lineDone', 'locked');
      cell.classList.remove('marked');
    });

    const letters = document.querySelectorAll('#bingoDisplay .letter');
    const idx = completedLines - 1;
    if (idx < letters.length) {
      letters[idx].classList.add('active');
    }

    if (completedLines >= 5) {
      gameOver = true;
      document.getElementById('winMessage').style.display = 'block';
    }
  });
}

// Intercept layouts button click handlers and append native confirmation prompts
document.querySelectorAll('.layoutBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetIndex = parseInt(btn.dataset.index);
    const selectedLayout = layouts[targetIndex];
    
    // Choose confirmation wording dynamically based on whether you're selecting the active size
    const message = (targetIndex === current)
      ? `Are you sure you want to reset the current ${selectedLayout.size}x${selectedLayout.size} board? This removes all marked circles.`
      : `Are you sure you want to change to a ${selectedLayout.size}x${selectedLayout.size} board? This will clear your current game.`;

    if (confirm(message)) {
      current = targetIndex;
      render();
    }
  });
});

// Run immediate execution render initialization on page startup
render();