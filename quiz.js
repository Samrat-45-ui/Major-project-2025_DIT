// quiz.js - Main JavaScript file for the Quiz Application

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


// Add event listeners to the start quiz button and next question button.
startQuizButton.addEventListener('click', startQuiz);

nextQuestionButton.addEventListener('click', () => loadNextQuestion(false)); // Pass false for user-initiated next


document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the selected category from localStorage.
    const selectedCategory = localStorage.getItem('selectedQuizCategory'); // Corrected variable name to match index.js

    // Check if a category was selected and if it exists in our questions data.
    if (selectedCategory && questions[selectedCategory]) {
        // Set the quiz category questions.
        quizCategoryQuestions = questions[selectedCategory];
        categoryTitleElement.textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' Quiz';
        startQuizContainer.classList.remove('hidden');
    } else {
        // If no valid category is found, redirect to the home page with an alert.
        showCustomMessage('Please select a valid quiz category from the home page.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000); // 3 seconds
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
    feedbackMessageElement.className = 'feedback-text'; 

    // Get the current question object.
    const question = quizCategoryQuestions[currentQuestionIndex];

    // Update question text.
    questionTextElement.textContent = question.question;

    // Update question image 
    if (question.image) {
        questionImageElement.src = question.image;
        questionImageElement.classList.remove('hidden');
    } else {
        questionImageElement.classList.add('hidden');
        questionImageElement.src = ''; // Clear source to prevent broken image icon
        questionImageElement.alt = ''; // Clear alt text for accessibility
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
            // Only allow processing if an answer hasn't been selected yet for this question
            if (!hasUserSelectedAnswer) {
                hasUserSelectedAnswer = true; 
                feedbackMessageElement.textContent = '';
                feedbackMessageElement.className = 'feedback-text';

                // Remove 'option-selected' class from all options, after that add to the clicked one
                document.querySelectorAll('.option-label').forEach(label => label.classList.remove('option-selected'));
                optionLabel.classList.add('option-selected');

                // Checks the answer and provide feedback
                checkAnswer(option);
            }
        });

        const optionSpan = document.createElement('span');
        optionSpan.textContent = option;  // The text for the option.
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(optionSpan);
        optionsContainer.appendChild(optionLabel);
    });

    // Start the countdown timer for the new question.
    startCountdown();
}

// Countdown timer function to manage time for each question.
function startCountdown() {
    timeLeft = 15; // Reset time for each question.
    timerDisplay.textContent = `Time left: ${timeLeft}s`; // Update timer display.

    timerInterval = setInterval(() => {
        timeLeft--; // Decrement time.
        timerDisplay.textContent = `Time left: ${timeLeft}s`; // Update display.

        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Stop the timer.
            loadNextQuestion(true);  // Move to the next question if time runs out.
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
        label.classList.remove('option-label:hover'); // Remove hover effect
    });

    // Apply styling for the answers and update the score
    if (selectedOptionValue === correctAnswer) {
        userScore++;
        feedbackMessageElement.textContent = 'Correct!';
        feedbackMessageElement.classList.add('feedback-correct');
        // Apply green to the correct option
        document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.add('option-correct');
    } else {
        feedbackMessageElement.textContent = `Wrong! The correct answer was: ${correctAnswer}`;
        feedbackMessageElement.classList.add('feedback-incorrect');
        // Apply red to the incorrect option
        document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.add('option-incorrect');
        // Apply green to the correct option
        document.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('option-correct');
    }
    document.querySelector(`input[value="${selectedOptionValue}"]`).parentElement.classList.remove('option-selected');
}


function loadNextQuestion(forced = false) {
    // Check if the user has selected an answer or if the move is forced (e.g., timer ran out).
    if (!hasUserSelectedAnswer && !forced) {
        showCustomMessage('Please select an answer before proceeding!', 'error');
        console.log("DEBUG: User clicked Next without selecting an answer. Showing error.");
        return; // The quiz will NOT proceed.
    }

    // Clear the feedback message and reset the timer display.
    setTimeout(() => {
        currentQuestionIndex++; // Move to the next question index.

        // Check if there are more questions
        if (currentQuestionIndex < quizCategoryQuestions.length) {
            loadQuestion(); // Move to the next question.
        } else {
            endQuiz(); // End the quiz if all questions have been answered.
        }
    }, 1000); // 1-second delay for feedback.
}


function endQuiz() {
    clearInterval(timerInterval); // Ensure any running timer is stopped.
    localStorage.setItem('finalQuizScore', userScore);
    localStorage.setItem('totalQuizQuestionsCount', quizCategoryQuestions.length);
    window.location.href = 'result.html';
}


function showCustomMessage(message, type) {
    customMessageText.textContent = message; 
    customMessageBox.classList.remove('hidden'); // Make the message box visible.
    // Reset any previous type or animation classes.
    customMessageBox.classList.remove('info', 'shake'); // Remove 'info' and 'shake'

    // Apply specific styling based on message type.
    if (type === 'error') {
        customMessageBox.classList.add('shake'); // Add shake animation for error messages.
    } else { // Default to 'info' type if not 'error'.
        customMessageBox.classList.add('info'); // Add 'info' class for blue styling.
    }

    // Automatically hide the message after a few seconds.
    setTimeout(() => {
        hideCustomMessage();
    }, 3000); // Message visible for 3 seconds only.
}

// Hide the custom message box.
function hideCustomMessage() {
    customMessageBox.classList.add('hidden');
}
