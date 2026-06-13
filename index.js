const layouts = [
  { size: 5, max: 25, label: '5x5, 1-25' },
  { size: 7, max: 49, label: '7x7, 1-49' },
  { size: 10, max: 100, label: '10x10, 1-100' }
];

let current = 0;
let pendingIndex = null;
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
  board.style.gridTemplateColumns = `repeat(${layout.size}, 1fr)`;
  board.innerHTML = '';
  marked = new Set();
  cellsGrid = [];
  completedLines = 0;
  gameOver = false;

  document.querySelectorAll('#bingoDisplay span').forEach(s => s.classList.remove('lit'));
  document.getElementById('winMessage').style.display = 'none';

  const cellSize = layout.size <= 5 ? 50 : (layout.size === 7 ? 40 : 32);
  const fontSize = layout.size <= 5 ? 18 : (layout.size === 7 ? 14 : 12);
  board.style.width = (cellSize * layout.size + 4 * layout.size) + 'px';

  const nums = shuffle(Array.from({ length: layout.max }, (_, i) => i + 1));
  const size = layout.size;

  for (let r = 0; r < size; r++) {
    cellsGrid.push([]);
    for (let c = 0; c < size; c++) {
      const n = nums[r * size + c];
      const cell = document.createElement('div');
      cell.textContent = n;
      cell.className = 'cell';
      cell.style.height = cellSize + 'px';
      cell.style.fontSize = fontSize + 'px';
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('click', () => {
        if (gameOver || cell.classList.contains('locked')) return;
        marked.add(n);
        cell.classList.add('marked');
        checkLines(size);
      });

      cellsGrid[r].push(cell);
      board.appendChild(cell);
    }
  }

  document.querySelectorAll('.layoutBtn').forEach((btn, i) => {
    btn.classList.toggle('active', i === current);
  });
}

function checkLines(size) {
  let newlyCompleted = [];

  // rows
  for (let r = 0; r < size; r++) {
    const cells = cellsGrid[r];
    if (cells.every(c => marked.has(parseInt(c.textContent))) && !cells[0].classList.contains('lineDone')) {
      newlyCompleted.push(cells);
    }
  }
  // columns
  for (let c = 0; c < size; c++) {
    const cells = cellsGrid.map(row => row[c]);
    if (cells.every(cell => marked.has(parseInt(cell.textContent))) && !cells[0].classList.contains('lineDone')) {
      newlyCompleted.push(cells);
    }
  }
  // diagonals
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
      cell.classList.add('glow');
    });

    const letters = document.querySelectorAll('#bingoDisplay span');
    const idx = completedLines - 1;
    if (idx < letters.length) {
      letters[idx].classList.add('lit');
    }

    if (completedLines >= 5) {
      gameOver = true;
      document.getElementById('winMessage').style.display = 'block';
    }
  });
}

document.querySelectorAll('.layoutBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    pendingIndex = parseInt(btn.dataset.index);
    document.getElementById('confirmBox').style.display = 'block';
  });
});

document.getElementById('confirmNo').addEventListener('click', () => {
  pendingIndex = null;
  document.getElementById('confirmBox').style.display = 'none';
});

document.getElementById('confirmYes').addEventListener('click', () => {
  current = pendingIndex;
  pendingIndex = null;
  document.getElementById('confirmBox').style.display = 'none';
  render();
});

render();
