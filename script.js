document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const scienceBtn = document.getElementById('science-btn');
    const mathsBtn = document.getElementById('maths-btn');
    const typingIndicator = document.querySelector('.typing-indicator');
    
    // State
    let currentSubject = null;
    
    // Knowledge Base - Questions and Answers
    const knowledgeBase = {
        science: {
            "What is the chemical formula for water?": "The chemical formula for water is H₂O, which means each water molecule consists of two hydrogen atoms and one oxygen atom.",
            "Explain Newton's First Law of Motion.": "Newton's First Law of Motion, also called the Law of Inertia, states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
            "What is photosynthesis?": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. They convert carbon dioxide and water into glucose and release oxygen as a byproduct.",
            "Describe the structure of an atom.": "An atom consists of a nucleus containing protons (positively charged) and neutrons (neutral), surrounded by electrons (negatively charged) in orbitals. The number of protons determines the element.",
            "What are the three states of matter?": "The three states of matter are solid (fixed shape and volume), liquid (fixed volume but takes shape of container), and gas (fills entire container). There's also plasma (ionized gas) and Bose-Einstein condensates at extreme conditions."
        },
        maths: {
            "What is the Pythagorean theorem?": "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides: a² + b² = c².",
            "How do you calculate the area of a circle?": "The area of a circle is calculated using the formula A = πr², where A is area, π is approximately 3.14159, and r is the radius of the circle.",
            "Solve for x: 2x + 5 = 15": "To solve 2x + 5 = 15: Subtract 5 from both sides (2x = 10), then divide both sides by 2 (x = 5). The solution is x = 5.",
            "What is the value of pi to 5 decimal places?": "The value of pi (π) to 5 decimal places is 3.14159. Pi is the ratio of a circle's circumference to its diameter and is an irrational number.",
            "Explain the concept of derivatives in calculus.": "In calculus, a derivative represents the rate at which a function is changing at any given point. It's the slope of the tangent line to the function's curve at that point, used to analyze rates of change in various applications."
        }
    };
    
    // Functions
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }
    
    function getRandomQuestion(subject) {
        const questions = Object.keys(knowledgeBase[subject]);
        return questions[Math.floor(Math.random() * questions.length)];
    }
    
    function getAnswer(question) {
        if (!currentSubject) {
            return "Please select a subject first (Science or Maths) before asking questions.";
        }
        
        // Try to find an exact match first
        if (knowledgeBase[currentSubject][question]) {
            return knowledgeBase[currentSubject][question];
        }
        
        // If no exact match, try to find a similar question (case insensitive)
        const lowerQuestion = question.toLowerCase();
        for (const knownQuestion in knowledgeBase[currentSubject]) {
            if (knownQuestion.toLowerCase().includes(lowerQuestion) || 
                lowerQuestion.includes(knownQuestion.toLowerCase())) {
                return knowledgeBase[currentSubject][knownQuestion];
            }
        }
        
        // If still no match, search online
        return searchOnline(question);
    }
    
    async function searchOnline(question) {
        try {
            showTypingIndicator();
            
            // Use a CORS proxy to avoid cross-origin issues
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const apiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(question)}&api_key=YOUR_SERPAPI_KEY`;
            
            const response = await fetch(proxyUrl + apiUrl);
            const data = await response.json();
            
            hideTypingIndicator();
            
            if (data.answer_box && data.answer_box.answer) {
                return data.answer_box.answer;
            } else if (data.organic_results && data.organic_results.length > 0) {
                return `I found this information: ${data.organic_results[0].snippet}\n\nSource: ${data.organic_results[0].link}`;
            } else {
                return "I couldn't find a specific answer to your question. Could you try rephrasing it?";
            }
        } catch (error) {
            hideTypingIndicator();
            console.error("Search error:", error);
            return "I encountered an error while searching for an answer. Please try again later.";
        }
    }
    
    function handleSubjectSelection(subject) {
        currentSubject = subject;
        const subjectName = subject === 'science' ? 'Science' : 'Maths';
        addMessage(`You've selected ${subjectName}. Ask me anything about ${subjectName} or try one of these questions:\n\n${Object.keys(knowledgeBase[subject]).join('\n')}`, false);
        
        // Highlight selected subject button
        if (subject === 'science') {
            scienceBtn.classList.add('active');
            mathsBtn.classList.remove('active');
        } else {
            mathsBtn.classList.add('active');
            scienceBtn.classList.remove('active');
        }
    }
    
    function handleUserInput() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addMessage(message, true);
        userInput.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            const answer = getAnswer(message);
            
            if (typeof answer === 'string') {
                addMessage(answer, false);
            } else {
                // Handle promise if searchOnline returns one
                answer.then(response => {
                    addMessage(response, false);
                });
            }
        }, 1500);
    }
    
    function handleRandomQuestion() {
        if (!currentSubject) {
            addMessage("Please select a subject first (Science or Maths) to get a random question.", false);
            return;
        }
        
        const question = getRandomQuestion(currentSubject);
        addMessage(`Here's a ${currentSubject} question for you: ${question}`, false);
    }
    
    // Event Listeners
    sendBtn.addEventListener('click', handleUserInput);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });
    
    scienceBtn.addEventListener('click', function() {
        handleSubjectSelection('science');
    });
    
    mathsBtn.addEventListener('click', function() {
        handleSubjectSelection('maths');
    });
    
    // Initialize feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');
    
    function checkScroll() {
        featureCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
});

async function searchOnline(question) {
    try {
        // Use Google's Custom Search JSON API
        const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(question)}&key=AIzaSyCgEluChACY8MlorYNueCKk-n7PvkW1V1A&cx=1765a79fccb9841bb`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return `I found this information: ${data.items[0].snippet}\n\nSource: ${data.items[0].link}`;
        } else {
            return "I couldn't find an answer to your question. Try rephrasing it.";
        }
    } catch (error) {
        console.error("Search error:", error);
        return "I encountered an error while searching. Please try again later.";
    }
}