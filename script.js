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

            booksContainer.appendChild(bookItem);
        });
    }
});