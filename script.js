document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const booksContainer = document.getElementById('books-container');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            booksContainer.innerHTML = '<p>Loading...</p>';
            const books = await fetchBooks(query);
            displayBooks(books);
        }
    });

    async function fetchBooks(query) {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.docs;
        } catch (error) {
            console.error('Fetch error:', error);
            booksContainer.innerHTML = '<p>There was an error fetching the data.</p>';
            return [];
        }
    }

    function displayBooks(books) {
        if (books.length === 0) {
            booksContainer.innerHTML = '<p>No books found.</p>';
            return;
        }

        booksContainer.innerHTML = '';
        books.slice(0, 20).forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.dataset.key = book.key; // Save book key for fetching details

            // Book Cover
            const coverImg = document.createElement('img');
            if (book.cover_i) {
                coverImg.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
            } else {
                coverImg.src = 'assets/no-cover.png'; // Placeholder image
            }
            bookItem.appendChild(coverImg);

            // Book Title
            const title = document.createElement('h3');
            title.textContent = book.title;
            bookItem.appendChild(title);

            // Book Author
            const author = document.createElement('p');
            author.textContent = `Author: ${book.author_name ? book.author_name.join(', ') : 'N/A'}`;
            bookItem.appendChild(author);

            // Book First Published Year
            const year = document.createElement('p');
            year.textContent = `First Published: ${book.first_publish_year || 'N/A'}`;
            bookItem.appendChild(year);

            // Add click event to show details
            bookItem.addEventListener('click', () => showBookDetails(book.key));

            booksContainer.appendChild(bookItem);
        });
    }

    // Modal Elements
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    async function showBookDetails(bookKey) {
        modalBody.innerHTML = '<p>Loading...</p>';
        modal.style.display = 'block';
        try {
            const response = await fetch(`https://openlibrary.org${bookKey}.json`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const book = await response.json();
            displayBookDetails(book);
        } catch (error) {
            console.error('Fetch error:', error);
            modalBody.innerHTML = '<p>There was an error fetching the book details.</p>';
        }
    }

    function displayBookDetails(book) {
        modalBody.innerHTML = `
            <h2>${book.title}</h2>
            <p><strong>Description:</strong> ${book.description ? (typeof book.description === 'string' ? book.description : book.description.value) : 'N/A'}</p>
            <p><strong>Number of Pages:</strong> ${book.number_of_pages || 'N/A'}</p>
            <p><strong>Publish Date:</strong> ${book.publish_date || 'N/A'}</p>
            <p><strong>Subjects:</strong> ${book.subjects ? book.subjects.join(', ') : 'N/A'}</p>
        `;
    }
});
