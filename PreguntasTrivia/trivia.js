document.addEventListener('DOMContentLoaded', () => {
	// --- AUTH / UI parity with BuscadorTCG.js ---
	const currentUser = localStorage.getItem('currentUser');
	if (currentUser) {
		document.getElementById('currentUserName').textContent = currentUser;
		const userBar = document.getElementById('userBar');
		if (userBar) userBar.style.display = 'block';
	} else {
		// redirect to login page (same behavior as BuscadorTCG)
		window.location.href = '../index.html';
	}

	// Elements
	const QUESTIONS_COUNT = 15; // ahora 15 preguntas
	const TIME_PER_QUESTION = 18; // segundos, 0 para desactivar

	const els = {
		lastScore: document.getElementById('last-score'),
		qCount: document.getElementById('question-count'),
		scoreBadge: document.getElementById('score'),
		cardImage: document.getElementById('card-image'),
		questionText: document.getElementById('question-text'),
		answers: document.getElementById('answers'),
		nextBtn: document.getElementById('next-btn'),
		restartBtn: document.getElementById('restart-btn'),
		resultArea: document.getElementById('result-area'),
		gameArea: document.getElementById('game-area'),
		finalScore: document.getElementById('final-score'),
		playAgainBtn: document.getElementById('play-again-btn'),
		progressBar: document.getElementById('question-progress'),
		timerEl: document.getElementById('timer')
	};

	let cardsPool = [
		// Algunos ejemplos locales: id para obtener imagen oficial vía PokeAPI artwork
		{ name: 'Pikachu', id: 25, generation: 1, types: ['Electric'], set: 'Base Set', rarity: 'Common' },
		{ name: 'Charizard', id: 6, generation: 1, types: ['Fire', 'Flying'], set: 'Base Set', rarity: 'Rare Holo' },
		{ name: 'Bulbasaur', id: 1, generation: 1, types: ['Grass','Poison'], set: 'Jungle', rarity: 'Common' },
		{ name: 'Squirtle', id: 7, generation: 1, types: ['Water'], set: 'Base Set', rarity: 'Common' },
		{ name: 'Gyarados', id: 130, generation: 1, types: ['Water','Flying'], set: 'Fossil', rarity: 'Rare' },
		{ name: 'Mewtwo', id: 150, generation: 1, types: ['Psychic'], set: 'Base Set', rarity: 'Rare Holo' },
		{ name: 'Lucario', id: 448, generation: 4, types: ['Fighting','Steel'], set: 'Majestic Dawn', rarity: 'Uncommon' },
		{ name: 'Greninja', id: 658, generation: 6, types: ['Water','Dark'], set: 'XY', rarity: 'Rare' },
		{ name: 'Eevee', id: 133, generation: 1, types: ['Normal'], set: 'Neo Genesis', rarity: 'Common' },
		{ name: 'Alakazam', id: 65, generation: 1, types: ['Psychic'], set: 'Base Set', rarity: 'Rare' }
	];

	let questions = [];
	let idx = 0;
	let score = 0;
	let timer = null;
	let timeLeft = TIME_PER_QUESTION;

	// Localized UI texts update (react to translator)
	function updateLocalizedTexts() {
		try {
			if (typeof t === 'function') {
				// last score display
				const s = localStorage.getItem('triviaScore');
				els.lastScore.textContent = s ? t('trivia.lastScore').replace('{score}', s) : t('trivia.lastScore').replace('{score}','—');
				// buttons
				els.nextBtn.textContent = t('trivia.button.next');
				els.restartBtn.textContent = t('trivia.button.restart');
				els.playAgainBtn.textContent = t('trivia.button.playAgain');
				// question and result headers updated on render/end as needed
			}
		} catch (err) {
			// ignore if translator not ready
		}
	}
	// react to language changes
	window.addEventListener('languageChanged', updateLocalizedTexts);
	// initial attempt to localize UI
	updateLocalizedTexts();

	function loadLastScore() {
		const s = localStorage.getItem('triviaScore');
		if (typeof t === 'function') {
			els.lastScore.textContent = s ? t('trivia.lastScore').replace('{score}', s) : t('trivia.lastScore').replace('{score}','—');
		} else {
			els.lastScore.textContent = s ? `Último puntaje: ${s}` : 'Último puntaje: —';
		}
	}
	loadLastScore();

	function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

	function pickQuestions() {
		const pool = shuffle(cardsPool.slice());
		const selected = pool.slice(0, QUESTIONS_COUNT);
		// Each question will be based on a chosen card and a question type (0..3)
		return selected.map(card => {
			// choose among 5 question types: 0..4
			const qType = Math.floor(Math.random()*5);
			return { card, qType };
		});
	}

	function startTimer() {
		// update visual progress per-second
		if (TIME_PER_QUESTION <= 0) {
			els.timerEl.textContent = '';
			els.progressBar.style.width = '0%';
			return;
		}
		stopTimer();
		timeLeft = TIME_PER_QUESTION;
		els.timerEl.textContent = `${timeLeft}s`;
		els.progressBar.style.width = '100%';
		const total = TIME_PER_QUESTION;
		timer = setInterval(() => {
			timeLeft--;
			els.timerEl.textContent = `${timeLeft}s`;
			const pct = Math.max(0, (timeLeft / total) * 100);
			els.progressBar.style.width = `${pct}%`;
			if (timeLeft <= 0) {
				clearInterval(timer);
				disableAnswers();
				showCorrectThenEnableNext();
			}
		}, 1000);
	}

	function stopTimer(){ clearInterval(timer); }

	function render() {
		stopTimer();
		els.answers.innerHTML = '';
		els.nextBtn.disabled = true;

		if (idx >= questions.length) return endGame();

		const qObj = questions[idx];
		const card = qObj.card;
		const qType = qObj.qType;

		els.qCount.textContent = `Pregunta ${idx+1} / ${questions.length}`;
		els.scoreBadge.textContent = (typeof t === 'function') ? t('trivia.score').replace('{score}', String(score)) : `Puntaje: ${score}`;

		// imagen de carta (usamos PokeAPI artwork si existe)
		els.cardImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`;
		els.cardImage.alt = card.name;

		let correctAnswer = '';
		let options = [];

		// qType mapping:
		// 0 -> Who (name)
		// 1 -> Generation
		// 2 -> Type(s)
		// 3 -> Pokédex number
		// 4 -> Multiple-type? (Yes/No) -- but we will randomly pick among available types below
		if (qType === 0) {
			els.questionText.textContent = (typeof t === 'function') ? t('trivia.q.who') : '¿Quién es ese Pokémon?';
			correctAnswer = card.name;
			options = [correctAnswer];
			const names = cardsPool.map(c=>c.name).filter(n=>n!==correctAnswer);
			shuffle(names);
			options.push(...names.slice(0,3));
		} else if (qType === 1) {
			els.questionText.textContent = (typeof t === 'function') ? t('trivia.q.generation') : '¿En qué generación salió este Pokémon?';
			correctAnswer = `Generación ${card.generation}`;
			options = [correctAnswer];
			const gens = [1,2,3,4,5,6,7,8].filter(g=>g!==card.generation);
			shuffle(gens);
			options.push(...gens.slice(0,3).map(g=>`Generación ${g}`));
		} else if (qType === 2) {
			els.questionText.textContent = (typeof t === 'function') ? t('trivia.q.type') : '¿Cuál es el/los tipo(s) de este Pokémon?';
			correctAnswer = card.types.join(' / ');
			options = [correctAnswer];
			const typePool = Array.from(new Set(cardsPool.flatMap(c=>c.types)));
			shuffle(typePool);
			while(options.length<4){
				const a = shuffle(typePool).slice(0, Math.min(2, typePool.length)).join(' / ');
				if(!options.includes(a)) options.push(a);
			}
		} else if (qType === 3) {
			// Pokédex number question
			els.questionText.textContent = (typeof t === 'function') ? t('trivia.q.pokedex') : '¿Cuál es el número Pokédex de este Pokémon?';
			correctAnswer = String(card.id);
			options = [correctAnswer];
			// pick other numeric options from cardsPool ids (ensure uniqueness)
			const ids = shuffle(cardsPool.map(c=>String(c.id)).filter(i=>i!==correctAnswer));
			options.push(...ids.slice(0,3));
		} else if (qType === 4) {
			// Multiple-type yes/no
			els.questionText.textContent = (typeof t === 'function') ? t('trivia.q.multiple') : '¿Este Pokémon tiene más de un tipo?';
			const hasMultiple = (card.types && card.types.length > 1);
			correctAnswer = hasMultiple ? (typeof t === 'function' ? t('trivia.option.yes') : 'Sí') : (typeof t === 'function' ? t('trivia.option.no') : 'No');
			// localized options
			const yes = (typeof t === 'function') ? t('trivia.option.yes') : 'Sí';
			const no = (typeof t === 'function') ? t('trivia.option.no') : 'No';
			options = shuffle([yes, no]);
 		}

 		options = shuffle(options).slice(0,4);

 		options.forEach(opt => {
 			const btn = document.createElement('button');
 			btn.className = 'btn btn-outline-primary';
 			btn.type = 'button';
 			btn.textContent = opt;
 			btn.dataset.correct = (opt === correctAnswer).toString();
 			btn.addEventListener('click', onAnswer);
 			els.answers.appendChild(btn);
 		});

 		// reset progress visual
 		els.progressBar.style.width = '100%';
 		startTimer();
 	}

	function disableAnswers() {
		Array.from(els.answers.querySelectorAll('button')).forEach(b=>b.disabled=true);
	}

	function showCorrectThenEnableNext() {
		Array.from(els.answers.querySelectorAll('button')).forEach(b=>{
			if (b.dataset.correct === 'true') b.classList.add('correct');
		});
		els.nextBtn.disabled = false;
	}

	function onAnswer(e) {
		stopTimer();
		const btn = e.currentTarget;
		disableAnswers();
		const isCorrect = btn.dataset.correct === 'true';
		if (isCorrect) {
			btn.classList.add('correct');
			score += 10;
			els.scoreBadge.textContent = (typeof t === 'function') ? t('trivia.score').replace('{score}', String(score)) : `Puntaje: ${score}`;
		} else {
			btn.classList.add('wrong');
			const correctBtn = els.answers.querySelector('button[data-correct="true"]');
			if (correctBtn) correctBtn.classList.add('correct');
		}
		els.nextBtn.disabled = false;
	}

	function endGame() {
		stopTimer();
		localStorage.setItem('triviaScore', String(score));
		loadLastScore();
		els.gameArea.classList.add('d-none');
		els.resultArea.classList.remove('d-none');
		const max = questions.length * 10;
		els.finalScore.textContent = (typeof t === 'function') ? t('trivia.result.message').replace('{score}', String(score)).replace('{max}', String(max)) : `Obtuviste ${score} puntos de ${max}`;
	}

	function pickAndStart() {
		idx = 0;
		score = 0;
		questions = pickQuestions();
		els.gameArea.classList.remove('d-none');
		els.resultArea.classList.add('d-none');
		els.scoreBadge.textContent = (typeof t === 'function') ? t('trivia.score').replace('{score}', '0') : 'Puntaje: 0';
		render();
	}

	// Event bindings
	els.nextBtn.addEventListener('click', () => {
		idx++;
		render();
	});
	els.restartBtn.addEventListener('click', () => pickAndStart());
	els.playAgainBtn.addEventListener('click', () => pickAndStart());

	// Start
	pickAndStart();

	// Ensure UI translations updated if translator initialized later
	setTimeout(updateLocalizedTexts, 300);
});