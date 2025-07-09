// This script handles the quiz category selection and redirects to the quiz page.
document.addEventListener('DOMContentLoaded', () => {
    // Get all buttons that have the class 'category-button'.
    const categoryButtons = document.querySelectorAll('.category-button');

    // Loop through each category button found.
    categoryButtons.forEach(button => {
            button.addEventListener('click', (event) => {
            const categoryName = event.currentTarget.dataset.category;
            localStorage.setItem('selectedQuizCategory', categoryName);
            // Redirect the user to the quiz.html page.
            window.location.href = `quiz.html?category=${categoryName}`;
        });
    });
});
