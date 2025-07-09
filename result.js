// This script handles the display of the final quiz score and the functionality of the "Play Again" button.
document.addEventListener('DOMContentLoaded', () => {
    // Get the final score and total questions count from localStorage.
    const finalScore = localStorage.getItem('finalQuizScore') || 0;
    const totalQuestionsCount = localStorage.getItem('totalQuizQuestionsCount') || 0;
    // Get the HTML element where the score will be displayed.
    const finalScoreElement = document.getElementById('final-score');
    finalScoreElement.textContent = `You scored ${finalScore} out of ${totalQuestionsCount} questions!`;
    const playAgainButton = document.getElementById('play-again-btn');
    playAgainButton.addEventListener('click', () => {
        // Clear any previous quiz data from localStorage to ensure a fresh start.
        localStorage.removeItem('selectedQuizCategory');
        localStorage.removeItem('finalQuizScore');
        localStorage.removeItem('totalQuizQuestionsCount');
        // Redirect the user back to the home page to choose a new category.
        window.location.href = 'index.html';
    });
});
