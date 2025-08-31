// Custom Modal Functions
const myModal = document.getElementById('myModal');
const closeButton = document.querySelector('.close-button');
const modalMessage = document.getElementById('modal-message');

function showModal(message) {
  modalMessage.innerText = message;
  myModal.style.display = 'flex'; // Use flex to center
}

function closeModal() {
  myModal.style.display = 'none';
}

closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
  if (event.target === myModal) {
    closeModal();
  }
});

// TAB SWITCHING LOGIC
const tabDeterminan = document.getElementById('tab-determinan');
const tabOperasi = document.getElementById('tab-operasi');
const menuDeterminan = document.getElementById('menu-determinan');
const menuOperasi = document.getElementById('menu-operasi');

function activateMenu(menu) {
  if (menu === 'determinan') {
    tabDeterminan.classList.add('active');
    tabDeterminan.setAttribute('aria-selected', 'true');
    tabDeterminan.tabIndex = 0;
    tabOperasi.classList.remove('active');
    tabOperasi.setAttribute('aria-selected', 'false');
    tabOperasi.tabIndex = -1;
    menuDeterminan.classList.remove('hidden');
    menuOperasi.classList.add('hidden');
    menuDeterminan.focus();
  } else {
    tabOperasi.classList.add('active');
    tabOperasi.setAttribute('aria-selected', 'true');
    tabOperasi.tabIndex = 0;
    tabDeterminan.classList.remove('active');
    tabDeterminan.setAttribute('aria-selected', 'false');
    tabDeterminan.tabIndex = -1;
    menuOperasi.classList.remove('hidden');
    menuDeterminan.classList.add('hidden');
    menuOperasi.focus();
  }
}

tabDeterminan.addEventListener('click', () => activateMenu('determinan'));
tabOperasi.addEventListener('click', () => activateMenu('operasi'));

// Keyboard navigation for tabs
const tabs = [tabDeterminan, tabOperasi];
tabs.forEach((tab, idx) => {
  tab.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      tabs[(idx+1) % tabs.length].focus();
    }
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      tabs[(idx-1 + tabs.length) % tabs.length].focus();
    }
    else if(e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateMenu(tab.id === 'tab-determinan' ? 'determinan' : 'operasi');
    }
  });
});

// Generate inputs for determinant matrix after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  const detTbody = document.getElementById('det5x5-inputs');
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 5; j++) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.id = `cell-${i}-${j}`;
      // Set a default value to make it easier to test, e.g., 0
      input.value = '0';
      td.appendChild(input);
      tr.appendChild(td);
    }
    detTbody.appendChild(tr);
  }
  generateOperationMatrices();
  activateMenu('determinan');
});

// DETERMINANT CALCULATOR FUNCTIONS
function getMinor(matrix, row, col) {
  // Filters out the specified row and then filters out the specified column from each remaining row
  return matrix.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col));
}

function sarrus3x3(m) {
  // Applies the Sarrus rule for a 3x3 matrix
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, i] = m[2];
  return a*e*i + b*f*g + c*d*h - c*e*g - b*d*i - a*f*h;
}

function printMatrix(m) {
  // Converts a matrix (array of arrays) into a string representation
  return m.map(row => row.join(' ')).join('\n');
}

function computeDet3x3(m3, label = '') {
  // Computes the determinant of a 3x3 matrix using Sarrus rule and generates step-by-step text
  const det = sarrus3x3(m3);
  let text = `Submatriks ${label} =\n${printMatrix(m3)}\nMenggunakan metode Sarrus:\n`;
  text += `Determinannya sementara adalah:\n`;
  text += `[(${m3[0][0]}×${m3[1][1]}×${m3[2][2]}) + (${m3[0][1]}×${m3[1][2]}×${m3[2][0]}) + (${m3[0][2]}×${m3[1][0]}×${m3[2][1]})] - `;
  text += `[(${m3[0][2]}×${m3[1][1]}×${m3[2][0]}) + (${m3[0][1]}×${m3[1][0]}×${m3[2][2]}) + (${m3[0][0]}×${m3[1][2]}×${m3[2][1]})]\n`;
  text += `= ${det}\n`;
  return {det, text};
}

function computeDet4x4(m4, label = '') {
  // Computes the determinant of a 4x4 matrix using cofactor expansion and generates step-by-step text
  let det = 0;
  let stepText = '';
  for (let col = 0; col < 4; col++) {
    const sign = (col % 2 === 0 ? 1 : -1); // Alternating sign for cofactor expansion
    const minor3 = getMinor(m4, 0, col); // Get 3x3 minor matrix
    const {det: det3, text} = computeDet3x3(minor3, `tanpa kolom ${col + 1} & baris 1`); // Compute determinant of minor
    const contrib = sign * m4[0][col] * det3; // Calculate contribution of current element
    stepText += `Kofaktor dari a1${col + 1}: (-1)^${col} × ${m4[0][col]} × ${det3} = ${contrib}\n\n`;
    stepText += text + '\n';
    det += contrib;
  }
  return {det, stepText};
}

async function computeDet5x5() {
  // Reads the matrix values from the input fields
  const matrix = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      // Parses float value, defaults to 0 if not a valid number
      row.push(parseFloat(document.getElementById(`cell-${i}-${j}`).value) || 0);
    }
    matrix.push(row);
  }

  // Displays the input matrix
  let matrixHTML = '<h3>Matriks:</h3><table>';
  for (let i = 0; i < 5; i++) {
    matrixHTML += '<tr>';
    for (let j = 0; j < 5; j++) {
      matrixHTML += `<td style="border:1px solid #ccc; padding:4px;">${matrix[i][j]}</td>`;
    }
    matrixHTML += '</tr>';
  }
  matrixHTML += '</table>';
  document.getElementById("matrixDisplay").innerHTML = matrixHTML;

  let det = 0;
  let stepLogs = '';

  // Computes the determinant of a 5x5 matrix using cofactor expansion along the first row
  for (let col = 0; col < 5; col++) {
    highlightCell(0, col); // Highlight the current cell being processed
    const sign = (col % 2 === 0 ? 1 : -1); // Alternating sign
    const minor4 = getMinor(matrix, 0, col); // Get 4x4 minor matrix

    stepLogs += `<div class="highlight-step"><strong>Langkah ${col + 1}:</strong><br>`;
    stepLogs += `Elemen a1${col + 1} = ${matrix[0][col]}<br>`;
    stepLogs += `Submatriks (tanpa kolom ${col + 1} & baris 1):<br><pre>${printMatrix(minor4)}</pre>`;

    const { det: det4, stepText } = computeDet4x4(minor4); // Compute determinant of 4x4 minor
    const contrib = sign * matrix[0][col] * det4; // Calculate contribution
    det += contrib;

    stepLogs += stepText.replace(/\n/g, "<br>"); // Replace newlines with <br> for HTML display
    stepLogs += `<strong>Kontribusi ke determinan:</strong> ${sign} × ${matrix[0][col]} × ${det4} = <strong>${contrib}</strong><br></div><br>`;

    // Delay to allow user to see the highlight
    await new Promise(r => setTimeout(r, 400));
    removeHighlight(0, col); // Remove highlight after processing
  }

  stepLogs += `<div class="highlight-step"><strong>Determinan akhir: ${det}</strong></div>`;
  document.getElementById("steps").innerHTML = stepLogs;
  document.getElementById("result").innerText = `Determinan akhir: ${det}`;
}

function highlightCell(row, col) {
  // Adds 'active-cell' class to highlight a specific input cell
  const cell = document.getElementById(`cell-${row}-${col}`);
  if (cell) cell.classList.add('active-cell');
}

function removeHighlight(row, col) {
  // Removes 'active-cell' class from a specific input cell
  const cell = document.getElementById(`cell-${row}-${col}`);
  if (cell) cell.classList.remove('active-cell');
}

function copyResult() {
  // Copies the result text to the clipboard using document.execCommand for broader compatibility
  const result = document.getElementById("result").innerText;
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = result;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  try {
    document.execCommand('copy');
    showModal("Hasil berhasil disalin!");
  } catch (err) {
    showModal("Gagal menyalin hasil.");
  }
  document.body.removeChild(tempTextArea);
}

function resetForm() {
  // Resets all input fields and result displays for the determinant calculator
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      document.getElementById(`cell-${i}-${j}`).value = '0'; // Reset to 0
    }
  }
  document.getElementById("result").innerText = '';
  document.getElementById("steps").innerHTML = '';
  document.getElementById("matrixDisplay").innerHTML = '';
}

// BIND BUTTONS FOR DETERMINANT MENU after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnComputeDet').addEventListener('click', computeDet5x5);
  document.getElementById('btnResetDet').addEventListener('click', resetForm);
  document.getElementById('btnCopyResult').addEventListener('click', copyResult);
});

// MATRIX OPERATIONS SECTION

const matrixSizeSelect = document.getElementById('matrix-size');
const matrixAContainer = document.getElementById('matrixA');
const matrixBContainer = document.getElementById('matrixB');
const opResult = document.getElementById('op-result');

function generateOperationMatrices() {
  // Generates input fields for Matrix A and Matrix B based on selected size
  const size = parseInt(matrixSizeSelect.value);
  matrixAContainer.innerHTML = '';
  matrixBContainer.innerHTML = '';

  for(let i = 0; i < size; i++) {
    const rowA = document.createElement('tr');
    const rowB = document.createElement('tr');
    for(let j = 0; j < size; j++) {
      const cellA = document.createElement('td');
      const inputA = document.createElement('input');
      inputA.type = 'number';
      inputA.id = `A-${i}-${j}`;
      inputA.value = '0'; // Default value for operation matrices
      inputA.setAttribute('aria-label', `Matriks A baris ${i+1} kolom ${j+1}`);
      cellA.appendChild(inputA);
      rowA.appendChild(cellA);

      const cellB = document.createElement('td');
      const inputB = document.createElement('input');
      inputB.type = 'number';
      inputB.id = `B-${i}-${j}`;
      inputB.value = '0'; // Default value for operation matrices
      inputB.setAttribute('aria-label', `Matriks B baris ${i+1} kolom ${j+1}`);
      cellB.appendChild(inputB);
      rowB.appendChild(cellB);
    }
    matrixAContainer.appendChild(rowA);
    matrixBContainer.appendChild(rowB);
  }
  opResult.innerText = ''; // Clear previous operation result
}

function readMatrix(prefix) {
  // Reads matrix values from input fields based on prefix (A or B)
  const size = parseInt(matrixSizeSelect.value);
  const matrix = [];
  for(let i = 0; i < size; i++) {
    const row = [];
    for(let j = 0; j < size; j++) {
      let val = parseFloat(document.getElementById(`${prefix}-${i}-${j}`).value);
      if (isNaN(val)) val = 0; // Default to 0 if input is not a number
      row.push(val);
    }
    matrix.push(row);
  }
  return matrix;
}

function matrixAdd() {
  // Performs matrix addition
  const size = parseInt(matrixSizeSelect.value);
  const A = readMatrix('A');
  const B = readMatrix('B');
  const result = [];

  for(let i = 0; i < size; i++) {
    const row = [];
    for(let j = 0; j < size; j++) {
      row.push(A[i][j] + B[i][j]);
    }
    result.push(row);
  }
  displayOperationResult(result, "Penjumlahan Matriks (A + B):");
}

function matrixSubtract() {
  // Performs matrix subtraction
  const size = parseInt(matrixSizeSelect.value);
  const A = readMatrix('A');
  const B = readMatrix('B');
  const result = [];

  for(let i = 0; i < size; i++) {
    const row = [];
    for(let j = 0; j < size; j++) {
      row.push(A[i][j] - B[i][j]);
    }
    result.push(row);
  }
  displayOperationResult(result, "Pengurangan Matriks (A - B):");
}

function matrixMultiply() {
  // Performs matrix multiplication
  const size = parseInt(matrixSizeSelect.value);
  const A = readMatrix('A');
  const B = readMatrix('B');
  const result = [];

  for(let i = 0; i < size; i++) {
    const row = [];
    for(let j = 0; j < size; j++) {
      let sum = 0;
      for(let k = 0; k < size; k++) {
        sum += A[i][k] * B[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  displayOperationResult(result, "Perkalian Matriks (A × B):");
}

function displayOperationResult(matrix, title) {
  // Displays the result of matrix operations
  let text = `${title}\n`;
  text += matrix.map(row => row.join(' ')).join('\n');
  opResult.innerText = text;
}

function resetOperation() {
  // Resets all input fields and result display for matrix operations
  const size = parseInt(matrixSizeSelect.value);
  ['A','B'].forEach(prefix => {
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const input = document.getElementById(`${prefix}-${i}-${j}`);
        if(input) input.value = '0'; // Reset to 0
      }
    }
  });
  opResult.innerText = '';
}

// Event listeners for matrix operations
matrixSizeSelect.addEventListener('change', () => {
  generateOperationMatrices();
});

document.getElementById('btnAdd').addEventListener('click', matrixAdd);
document.getElementById('btnSubtract').addEventListener('click', matrixSubtract);
document.getElementById('btnMultiply').addEventListener('click', matrixMultiply);
document.getElementById('btnResetOp').addEventListener('click', resetOperation);
