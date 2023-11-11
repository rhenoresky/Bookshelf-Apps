const books = []
const RENDER_EVENT = 'render-book'
const SAVED_EVENT = 'saved-book'
const STORAGE_KEY = 'BOOK_APPS'
const statusModal = {paramBookId: null}

document.addEventListener('DOMContentLoaded', () => {
  const submitForm = document.getElementById('formContent')
  submitForm.addEventListener('submit', (event) => {
    event.preventDefault()
    addBook()
  })

  const searchForm = document.getElementById('searchForm')
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    document.dispatchEvent(new Event(RENDER_EVENT))
  })

  if (isStorageExist()) {
    loadDataFromStorage();
  }
})

document.addEventListener(RENDER_EVENT, () => {
  const listBook = document.getElementById('books')
  listBook.innerHTML = ''

  const listCompleteBook = document.getElementById('completeBooks')
  listCompleteBook.innerText = ''

  const data = filterBooks()

  for (const book of data) {
    const bookElement = makeBook(book)
    if (!book.isComplete) {
      listBook.append(bookElement)
    } else {
      listCompleteBook.append(bookElement)
    }
  }
})

function generateId() {
  return +new Date()
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  }
}

function addBook() {
  const title = document.getElementById('title').value
  const author = document.getElementById('author').value
  const year = document.getElementById('year').value
  const complete = document.getElementById('complete').checked
  const generatedID = generateId()
  const bookObject = generateBookObject(generatedID, title, author, parseInt(year), complete)

  books.push(bookObject)

  document.getElementById('searchTitle').value = ''
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h3')
  textTitle.innerText = bookObject.title

  const textAuthor = document.createElement('p')
  textAuthor.innerText = `Penulis: ${bookObject.author}`

  const textYear = document.createElement('p')
  textYear.innerText = `Tahun: ${bookObject.year}`

  const buttonChange = document.createElement('button')
  buttonChange.classList.add('green')

  const buttonDelete = document.createElement('button')
  buttonDelete.classList.add('red')
  buttonDelete.innerText = 'Hapus buku'
  buttonDelete.addEventListener('click', () => {
    showModal(bookObject.id)
  })

  if (!bookObject.isComplete) {
    buttonChange.innerText = 'Selesai dibaca'
    buttonChange.addEventListener('click', () => {
      addToComplete(bookObject.id)
    })
  } else {
    buttonChange.innerText = 'Belum selesai dibaca'
    buttonChange.addEventListener('click', () => {
      undoFromComplete(bookObject.id)
    })
  }

  const containerAction = document.createElement('div')
  containerAction.classList.add('action')
  containerAction.append(buttonChange, buttonDelete)

  const containerItem = document.createElement('article')
  containerItem.classList.add('book_item')
  containerItem.append(textTitle, textAuthor, textYear, containerAction)
  containerItem.setAttribute('id', `book-${bookObject.id}`)

  return containerItem
}

function addToComplete(bookId) {
  const bookTarget = findBook(bookId)

  if (bookTarget == null) return

  bookTarget.isComplete = true
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) return book
  }
  return null
}

function deleteBook() {
  const bookTarget = findbookIndex(statusModal.paramBookId)

  if (bookTarget === -1) return

  books.splice(bookTarget, 1)

  const modalContainer = document.getElementById('modalContainer')
  modalContainer.style.display = 'none'

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function undoFromComplete(bookId) {
  const bookTarget = findBook(bookId)
  if (bookTarget == null) return

  bookTarget.isComplete = false
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function findbookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index
    }
  }

  return -1
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, parsed)
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function filterBooks() {
  const searchTitle = document.getElementById('searchTitle').value

  if (searchTitle) {
    const searchValue = searchTitle.replace(/\s/g, '').toLowerCase()

    return books.filter(book => {
      const bookTitleValue = book.title.replace(/\s/g, '').toLowerCase()

      return bookTitleValue.includes(searchValue)
    })
  }

  return books
}

function showModal(bookId) {
  statusModal.paramBookId = bookId
  const modalContainer = document.getElementById('modalContainer')
  modalContainer.style.display = 'flex'
}

function cancelModal() {
  statusModal.paramBookId = null
  const modalContainer = document.getElementById('modalContainer')
  modalContainer.style.display = 'none'
}