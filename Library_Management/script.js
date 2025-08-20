if (!localStorage.getItem("books")) {
  let sampleBooks = [];
  for (let i = 1; i <= 35; i++) {
    sampleBooks.push({ id: i, title: `Book ${i}`, author: `Author ${i}`, available: true });
  }
  localStorage.setItem("books", JSON.stringify(sampleBooks));
}
function getBooks() {
  return JSON.parse(localStorage.getItem("books")) || [];
}
function saveBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}
function renderAdminBooks() {
  const list = document.getElementById("adminBookList");
  if (!list) return;
  list.innerHTML = "";
  let books = getBooks();
  books.forEach(book => {
    let li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${book.id} - ${book.title}</strong> by ${book.author} 
      <span class="${book.available ? 'available' : 'issued'}">
        ${book.available ? "(Available)" : "(Issued)"}
      </span></span>
      <div>
        <button onclick="editBook(${book.id})">✏ Edit</button>
        <button onclick="deleteBook(${book.id})">🗑 Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}
function addOrUpdateBook() {
  let books = getBooks();
  let editId = document.getElementById("editId").value;
  let title = document.getElementById("title").value.trim();
  let author = document.getElementById("author").value.trim();
  if (!title || !author) {
    alert("Please enter book details.");
    return;
  }
  if (editId) {
    let book = books.find(b => b.id == editId);
    book.title = title;
    book.author = author;
    document.getElementById("editId").value = "";
  } else {
    let newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
    books.push({ id: newId, title, author, available: true });
  }
  saveBooks(books);
  renderAdminBooks();
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
}
function editBook(id) {
  let book = getBooks().find(b => b.id === id);
  document.getElementById("editId").value = book.id;
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
}
function deleteBook(id) {
  let books = getBooks().filter(b => b.id !== id);
  saveBooks(books);
  renderAdminBooks();
}
function renderUserBooks() {
  const list = document.getElementById("userBookList");
  if (!list) return;
  list.innerHTML = "";
  let books = getBooks();
  books.forEach(book => {
    let li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${book.id} - ${book.title}</strong> by ${book.author} 
      <span class="${book.available ? 'available' : 'issued'}">
        ${book.available ? "(Available)" : "(Issued)"}
      </span></span>
      <div>
        <button onclick="toggleIssue(${book.id})">${book.available ? "Issue" : "Return"}</button>
      </div>
    `;
    list.appendChild(li);
  });
}
function toggleIssue(id) {
  let books = getBooks();
  let book = books.find(b => b.id === id);
  book.available = !book.available;
  saveBooks(books);
  renderUserBooks();
}
renderAdminBooks();
renderUserBooks();
