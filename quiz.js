import { questions } from './questions.js';

// --- Quiz State Variables ---
let currentQuestionIndex = 0; 
let userScore = 0; 
let timeLeft = 15; 
let timerInterval; 
let quizCategoryQuestions = []; 
let hasUserSelectedAnswer = false; 

// Get references to all necessary HTML elements by their IDs.
const categoryTitleElement = document.getElementById('category-title');
const startQuizContainer = document.getElementById('start-quiz-container');
const startQuizButton = document.getElementById('start-quiz-btn');
const questionContainer = document.getElementById('question-container');
const timerDisplay = document.getElementById('timer');
const questionTextElement = document.getElementById('question-text');
const questionImageElement = document.getElementById('question-image');
const optionsContainer = document.getElementById('options-container');
const feedbackMessageElement = document.getElementById('feedback-message');
const nextQuestionButton = document.getElementById('next-question-btn');
const customMessageBox = document.getElementById('custom-message-box');
const customMessageText = document.getElementById('custom-message-text');

// Event listener for the "Start Quiz" button.
startQuizButton.addEventListener('click', startQuiz);
// Event listener for the "Next Question" button.
nextQuestionButton.addEventListener('click', () => loadNextQuestion(false)); // Pass false for user-initiated next


// --- Quiz Initialization & Flow ---

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the selected category from localStorage.
    const selectedCategory = localStorage.getItem('selectedQuizCategory');

    // Check if a category was selected and if it exists in our questions data.
    if (selectedCategory && questions[selectedCategory]) {
        quizCategoryQuestions = questions[selectedCategory];
        categoryTitleElement.textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' Quiz';
        startQuizContainer.classList.remove('hidden');
    } else {
        // If no valid category is found, redirect to the home page with an alert.
        showCustomMessage('Please select a valid quiz category from the home page.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
});

function startQuiz() {
    startQuizContainer.classList.add('hidden');
    questionContainer.classList.remove('hidden');
    currentQuestionIndex = 0;
    userScore = 0; // Reset the score.
    loadQuestion();
}

function loadQuestion() {
    // Reset state for the new question.
    hasUserSelectedAnswer = false;
    clearInterval(timerInterval);
    hideCustomMessage();
    feedbackMessageElement.textContent = ''; // Clear previous feedback text
    feedbackMessageElement.className = 'feedback-text'; // Reset feedback styling
    nextQuestionButton.disabled = true;

    // Get the current question object.
    const question = quizCategoryQuestions[currentQuestionIndex];

    questionTextElement.textContent = question.question;

    // Update question image
    if (question.image) {
        questionImageElement.src = question.image;
        questionImageElement.classList.remove('hidden');
    } else {
        questionImageElement.classList.add('hidden');
        questionImageElement.src = ''; 
        questionImageElement.alt = '';
    }

    // Clear previous options.
    optionsContainer.innerHTML = '';

    question.options.forEach((option) => {
        const optionLabel = document.createElement('label');
        optionLabel.classList.add('option-label');

        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.name = 'quizOption';
        optionInput.value = option;
        optionInput.addEventListener('change', () => {
            if (!hasUserSelectedAnswer) {
                hasUserSelectedAnswer = true;
                // Clear feedback when a new option is selected
                feedbackMessageElement.textContent = '';
                feedbackMessageElement.className = 'feedback-text';
                document.querySelectorAll('.option-label').forEach(label => label.classList.remove('option-selected'));
                optionLabel.classList.add('option-selected');

                // Immediately check the answer and provide feedback
                checkAnswer(option); // Call checkAnswer here
            }
        });

        const optionSpan = document.createElement('span');
        optionSpan.textContent = option;
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(optionSpan);
        optionsContainer.appendChild(optionLabel);
    });

    startCountdown();
}

function startCountdown() {
    timeLeft = 15; // Reset time for each question.
    timerDisplay.textContent = `Time left: ${timeLeft}s`; // Update timer display.

    timerInterval = setInterval(() => {
        timeLeft--; // Decrement time.
        timerDisplay.textContent = `Time left: ${timeLeft}s`; // Update display.

        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Stop the timer.
            showCustomMessage("Time's up! Moving to next question.", "info"); // Inform the user with an info message.
            loadNextQuestion(true); 
        }
    }, 1000);
}

function checkAnswer(selectedOptionValue) {
    clearInterval(timerInterval); // Stops the timer if the answer is selected.

    const currentQuestion = quizCategoryQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    const allOptionLabels = optionsContainer.querySelectorAll('.option-label');

    // Disable all options to prevent further changes
    allOptionLabels.forEach(label => {
        label.querySelector('input[type="radio"]').disabled = true;
        label.style.cursor = 'default';
    });

    // Apply correctness styling and update score
    if (selectedOptionValue === correctAnswer) {
        userScore++;
        feedbackMessageElement.textContent = 'Correct!';
        feedbackMessageElement.classList.add('feedback-correct');
        document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.add('option-correct');
    } else {
        feedbackMessageElement.textContent = `Wrong! The correct answer was: ${correctAnswer}`;
        feedbackMessageElement.classList.add('feedback-incorrect');
        document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.add('option-incorrect');
        document.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('option-correct');
    }
    document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.remove('option-selected');

    // Enable the next question button after an answer has been processed
    nextQuestionButton.disabled = false;
}

function loadNextQuestion(forced = false) {
    if (!hasUserSelectedAnswer && !forced) {
        showCustomMessage('Please select an answer before proceeding!', 'error');
        console.log("DEBUG: User clicked Next without selecting an answer. Showing error.");
        return; // Stop the function here, do not proceed to the next question.
    }

    nextQuestionButton.disabled = true;

    // Introduce a short delay to allow feedback to be seen before moving to the next question.
    setTimeout(() => {
        currentQuestionIndex++; 

        // Check if there are more questions in the current category.
        if (currentQuestionIndex < quizCategoryQuestions.length) {
            loadQuestion(); // Load the next question.
        } else {
            endQuiz();
        }
    }, 1000); // 1-second delay for feedback display.
}


function endQuiz() {
    clearInterval(timerInterval); // Ensure any running timer is stopped.
    localStorage.setItem('finalQuizScore', userScore);
    localStorage.setItem('totalQuizQuestionsCount', quizCategoryQuestions.length);
    window.location.href = 'result.html'; // Redirect to the results page.
}

function showCustomMessage(message, type) {
    customMessageText.textContent = message;
    customMessageBox.classList.remove('hidden');
    // Remove any previous type or animation classes to ensure fresh styling.
    customMessageBox.classList.remove('info', 'shake');
    if (type === 'error') {
        customMessageBox.classList.add('shake');
    } else {
        customMessageBox.classList.add('info');
    }

    setTimeout(() => {
        hideCustomMessage();
    }, 3000); // Message visible for 3 seconds only.
}

function hideCustomMessage() {
    customMessageBox.classList.add('hidden');
}
