(function () {
	// Evitar doble carga/ejecución
	if (window.__translatorInitialized) {
		console.log('Translator already initialized - skipping re-init');
		return;
	}
	window.__translatorInitialized = true;

	try {
		const translations = {
		    es: {
		        'nav.brand': 'Pokémon TCG',
		        'nav.home': 'Inicio',
		        'nav.cards': 'Cartas',
		        'nav.packs': 'Paquetes',
		        'packs.title': 'Paquetes Pokémon TCG',
		        'packs.create': 'Nuevo Paquete',
		        'packs.create.new': 'Nuevo Paquete',
		        'modal.create.title': 'Nuevo Paquete',
		        'modal.create.name': 'Nombre del Paquete *',
		        'modal.create.cards': 'Número de cartas disponibles *',
		        'modal.create.rarity': 'Rareza específica (Opcional)',
		        'modal.create.selectRarity': 'Seleccionar rareza',
		        'modal.create.set': 'Set específico (Opcional)',
		        'modal.create.selectSet': 'Seleccionar set (opcional)',
		        'modal.create.type': 'Tipo de Pokémon (Opcional)',
		        'modal.create.selectType': 'Seleccionar tipo',
		        'modal.create.button': 'Crear Paquete',
		        'modal.cancel': 'Cancelar',
		        'modal.close': 'Cerrar',
		        'modal.details.title': 'Cartas del paquete',
		        'modal.details.noCards': 'No hay cartas guardadas en este paquete.',
		        'register.title': 'Buscador de Cartas TCG',
		        'register.heading': 'Registro',
		        'register.username': 'Usuario',
		        'register.password': 'Contraseña',
		        'register.button': 'Registrar',
		        'register.hasAccount': '¿Ya tienes una cuenta?',
		        'register.loginLink': 'Inicia Sesión',
		        'cards.title': 'Buscador de Cartas Pokémon TCG',
		        'cards.search.placeholder': 'Nombre o Número Pokédex',
		        'cards.search.button': 'Buscar',
		        'cards.search.clear': 'Limpiar Búsqueda',
		        'cards.loading': 'Cargando cartas...',
		        'cards.filter.rarity': 'Rareza:',
		        'cards.filter.set': 'Set:',
		        'cards.filter.all': 'Todos',
		        'cards.filter.clear': 'Limpiar Filtros',
		        'cards.modal.type': 'Tipo:',
		        'cards.modal.rarity': 'Rareza:',
		        'cards.modal.set': 'Set:',
		        'cards.modal.info': 'Información adicional:',
		        'cards.error.title': 'Error',
		        'cards.package.title': 'Selecciona un paquete',
		        'cards.package.note': 'Si no hay paquetes, crea uno en la sección "Paquetes".',
		        'cards.save.title': '¡Guardada!',
		        'cards.save.message': 'La carta se ha añadido al paquete correctamente.',
		        'profile.packs': 'Paquetes:',
		        'profile.favoriteCard': 'Carta Favorita:',
		        'profile.noPacks': 'Todavía no has comenzado con tus paquetes con tus propias cartas',
		        'profile.welcome.greeting': '¡Buenas',
		        'profile.welcome.message': 'Busca las cartas de tu pokemon favorito, y escoge esas cartas que tanto desearias tener',
		        'profile.welcome.warning': '(La ludopatia se vende por separado)',
		        'profile.welcome.pikachu': 'Pikachu aventándose los pasos prohibidos',
		        'profile.welcome.start': 'Comenzar',
		        'type.normal': 'Normal',
		        'type.grass': 'Planta',
		        'type.fire': 'Fuego',
		        'type.water': 'Agua',
		        'type.lightning': 'Eléctrico',
		        'type.ice': 'Hielo',
		        'type.flying': 'Volador',
		        'type.poison': 'Veneno',
		        'type.ground': 'Tierra',
		        'type.rock': 'Roca',
		        'type.bug': 'Bicho',
		        'type.ghost': 'Fantasma',
		        'type.psychic': 'Psíquico',
		        'type.fighting': 'Lucha',
		        'type.darkness': 'Siniestro',
		        'type.metal': 'Acero',
		        'type.fairy': 'Hada',
		        'type.dragon': 'Dragón',
		        'login.title': 'Buscador de Cartas TCG',
		        'login.heading': 'Iniciar Sesión',
		        'login.username': 'Usuario',
		        'login.password': 'Contraseña',
		        'login.button': 'Iniciar Sesión',
		        'login.noAccount': '¿No tienes una cuenta?',
		        'login.registerLink': 'Regístrate',
		        'nav.logout': 'Cerrar sesión',
		        'carousel.prev': 'Anterior',
		        'carousel.next': 'Siguiente',
		        'welcome.title': 'Bienvenido,',
		        'welcome.message': '¡Iniciaste sesión correctamente!',
		        // Nuevas claves para alertas
		        'alert.register.success': 'Registro completado correctamente.',
		        'alert.register.error': 'Error al registrar el usuario.',
		        'alert.login.success': 'Inicio de sesión correcto.',
		        'alert.login.error': 'Usuario o contraseña incorrectos.',
		        'alert.pack.created': 'Paquete creado correctamente.',
		        'alert.pack.error': 'Error al crear el paquete.',
		        'alert.card.saved': 'Carta añadida al paquete.',
		        'alert.card.save.error': 'Error al guardar la carta.',
		        'alert.confirm.delete': '¿Estás seguro de que deseas eliminarlo?',
		        'paquete.cardsAvailable': 'cartas disponibles',
		        'paquete.created': 'Creado:',
		        'paquete.rareza': 'Rareza:',
		        'paquete.set': 'Set:',
		        'paquete.tipo': 'Tipo:',
		        'paquete.edit': 'Editar paquete',
		        'paquete.delete': 'Eliminar paquete',
		        // modal editar/guardar
		        'modal.create.editTitle': 'Editar Paquete',
		        'modal.create.saveChanges': 'Guardar Cambios',
		        'noCardSelected': 'Ninguna carta seleccionada',
		        'nav.questions': 'Preguntas',
		        // Traducciones para Trivia
		        'trivia.title': 'Preguntas Pokémon',
		        'trivia.lastScore': 'Último puntaje: {score}',
		        'trivia.score': 'Puntaje: {score}',
		        'trivia.button.next': 'Siguiente',
		        'trivia.button.restart': 'Reiniciar',
		        'trivia.button.playAgain': 'Jugar otra vez',
		        'trivia.q.who': '¿Quién es ese Pokémon?',
		        'trivia.q.generation': '¿En qué generación salió este Pokémon?',
		        'trivia.q.type': '¿Cuál es el/los tipo(s) de este Pokémon?',
		        'trivia.q.pokedex': '¿Cuál es el número Pokédex de este Pokémon?',
		        'trivia.q.multiple': '¿Este Pokémon tiene más de un tipo?',
		        'trivia.option.yes': 'Sí',
		        'trivia.option.no': 'No',
		        'trivia.result.title': 'Juego terminado',
		        'trivia.result.message': 'Obtuviste {score} puntos de {max}',
		        // Traducciones de sets
		        'set.base_set': 'Base Set',
		        'set.jungle': 'Jungle',
		        'set.fossil': 'Fossil',
		        'set.team_rocket': 'Team Rocket',
		        'set.gym_heroes': 'Gym Heroes',
		        'set.gym_challenge': 'Gym Challenge',
		        'set.neo_genesis': 'Neo Genesis',
		        'set.neo_discovery': 'Neo Discovery',
		        'set.neo_revelation': 'Neo Revelation',
		        'set.neo_destiny': 'Neo Destiny',
		        'set.legendary_collection': 'Legendary Collection',
		        'set.expedition': 'Expedition',
		        'set.aquapolis': 'Aquapolis',
		        'set.skyridge': 'Skyridge',
		        'set.ex_ruby_sapphire': 'EX Ruby & Sapphire',
		        'set.ex_sandstorm': 'EX Sandstorm',
		        'set.ex_dragon': 'EX Dragon',
		        'set.diamond_pearl': 'Diamond & Pearl',
		        'set.mysterious_treasures': 'Mysterious Treasures',
		        'set.secret_wonders': 'Secret Wonders',
		        'set.great_encounters': 'Great Encounters',
		        'set.majestic_dawn': 'Majestic Dawn',
		        'set.platinum': 'Platinum',
		        'set.heartgold_soulsilver': 'HeartGold & SoulSilver',
		        'set.call_of_legends': 'Call of Legends',
		        'set.black_white': 'Black & White',
		        'set.xy': 'XY',
		        'set.sun_moon': 'Sun & Moon',
		        'set.sword_shield': 'Sword & Shield',
		        'set.scarlet_violet': 'Scarlet & Violet',
		        'set.battle_styles': 'Battle Styles',
		        'set.chilling_reign': 'Chilling Reign',
		        'set.fusion_strike': 'Fusion Strike',
		        'set.lost_origin': 'Lost Origin',
		        'set.evolving_skies': 'Evolving Skies',
		        'set.astral_radiance': 'Astral Radiance',
		        'set.brilliant_stars': 'Brilliant Stars',
		        'set.brilliant_fusion': 'Brilliant Fusion',
		        'set.lost_thunder': 'Lost Thunder',
		        'set.hidden_fates': 'Hidden Fates',
		        'set.cosmic_eclipse': 'Cosmic Eclipse',
		        'set.darkness_ablaze': 'Darkness Ablaze',
		        'set.vivid_voltage': 'Vivid Voltage',
		        // Rarezas
		        'rarity.common': 'Común',
		        'rarity.uncommon': 'Poco común',
		        'rarity.rare': 'Rara',
		        'rarity.rareHolo': 'Rara Holo',
		        'rarity.rareUltra': 'Rara Ultra',
		        'rarity.rareSecret': 'Rara Secreta',
		        'rarity.rareRainbow': 'Rara Arcoíris',
		        // Nuevas rarezas
		        'rarity.promo': 'Promocional',
		        'rarity.unreleased': 'Sin publicar',
		        'rarity.unknown': 'Desconocida',
		        'rarity.none': 'Ninguna'
		    },
		    en: {
		        'nav.brand': 'Pokémon TCG',
		        'nav.home': 'Home',
		        'nav.cards': 'Cards',
		        'nav.packs': 'Packs',
		        'packs.title': 'Pokémon TCG Packs',
		        'packs.create': 'Start by creating a new pack',
		        'packs.create.new': 'New Package',
		        'modal.create.title': 'New Pack',
		        'modal.create.name': 'Pack Name *',
		        'modal.create.cards': 'Number of available cards *',
		        'modal.create.rarity': 'Specific rarity (Optional)',
		        'modal.create.selectRarity': 'Select rarity',
		        'modal.create.set': 'Specific set (Optional)',
		        'modal.create.selectSet': 'Select set (optional)',
		        'modal.create.type': 'Pokémon Type (Optional)',
		        'modal.create.selectType': 'Select type',
		        'modal.create.button': 'Create Pack',
		        'modal.cancel': 'Cancel',
		        'modal.close': 'Close',
		        'modal.details.title': 'Pack Cards',
		        'modal.details.noCards': 'No cards saved in this pack.',
		        'register.title': 'TCG Card Finder',
		        'register.heading': 'Register',
		        'register.username': 'Username',
		        'register.password': 'Password',
		        'register.button': 'Register',
		        'register.hasAccount': 'Already have an account?',
		        'register.loginLink': 'Sign In',
		        'cards.title': 'Pokémon TCG Card Finder',
		        'cards.search.placeholder': 'Name or Pokédex Number',
		        'cards.search.button': 'Search',
		        'cards.search.clear': 'Clear Search',
		        'cards.loading': 'Loading cards...',
		        'cards.filter.rarity': 'Rarity:',
		        'cards.filter.set': 'Set:',
		        'cards.filter.all': 'All',
		        'cards.filter.clear': 'Clear Filters',
		        'cards.modal.type': 'Type:',
		        'cards.modal.rarity': 'Rarity:',
		        'cards.modal.set': 'Set:',
		        'cards.modal.info': 'Additional information:',
		        'cards.error.title': 'Error',
		        'cards.package.title': 'Select a pack',
		        'cards.package.note': 'If there are no packs, create one in the "Packs" section.',
		        'cards.save.title': 'Saved!',
		        'cards.save.message': 'The card has been added to the pack correctly.',
		        'profile.packs': 'Packs:',
		        'profile.favoriteCard': 'Favorite Card:',
		        'profile.noPacks': 'You haven\'t started with your packs with your own cards yet',
		        'profile.welcome.greeting': 'Hello',
		        'profile.welcome.message': 'Search for your favorite pokemon cards, and choose those cards you would so much like to have',
		        'profile.welcome.warning': '(Gambling addiction sold separately)',
		        'profile.welcome.pikachu': 'Pikachu doing the forbidden steps',
		        'profile.welcome.start': 'Start',
		        'login.title': 'TCG Card Finder',
		        'login.heading': 'Sign In',
		        'login.username': 'Username',
		        'login.password': 'Password',
		        'login.button': 'Sign In',
		        'login.noAccount': 'Don\'t have an account?',
		        'login.registerLink': 'Register',
		        'nav.logout': 'Log out',
		        'carousel.prev': 'Previous',
		        'carousel.next': 'Next',
		        'welcome.title': 'Welcome,',
		        'welcome.message': 'You have successfully signed in!',
		        // Nuevas claves para alertas (EN)
		        'alert.register.success': 'Registration completed successfully.',
		        'alert.register.error': 'Error registering the user.',
		        'alert.login.success': 'Successfully signed in.',
		        'alert.login.error': 'Incorrect username or password.',
		        'alert.pack.created': 'Pack created successfully.',
		        'alert.pack.error': 'Error creating the pack.',
		        'alert.card.saved': 'Card added to the pack.',
		        'alert.card.save.error': 'Error saving the card.',
		        'alert.confirm.delete': 'Are you sure you want to delete this?',
		        'paquete.cardsAvailable': 'cards available',
		        'paquete.created': 'Created:',
		        'paquete.rareza': 'Rarity:',
		        'paquete.set': 'Set:',
		        'paquete.tipo': 'Type:',
		        'paquete.edit': 'Edit pack',
		        'paquete.delete': 'Delete pack',
		        // modal editar/guardar
		        'modal.create.editTitle': 'Edit Pack',
		        'modal.create.saveChanges': 'Save Changes',
		        'noCardSelected': 'No card selected',
		        'nav.questions': 'Questions',
		        // Translations for Trivia
		        'trivia.title': 'Pokémon Questions',
		        'trivia.lastScore': 'Last score: {score}',
		        'trivia.score': 'Score: {score}',
		        'trivia.button.next': 'Next',
		        'trivia.button.restart': 'Restart',
		        'trivia.button.playAgain': 'Play again',
		        'trivia.q.who': 'Who is that Pokémon?',
		        'trivia.q.generation': 'In which generation did this Pokémon appear?',
		        'trivia.q.type': 'What is the type(s) of this Pokémon?',
		        'trivia.q.pokedex': 'What is this Pokémon\'s Pokédex number?',
		        'trivia.q.multiple': 'Does this Pokémon have more than one type?',
		        'trivia.option.yes': 'Yes',
		        'trivia.option.no': 'No',
		        'trivia.result.title': 'Game over',
		        'trivia.result.message': 'You scored {score} out of {max}',
		        // Set translations (EN)
		        'set.base_set': 'Base Set',
		        'set.jungle': 'Jungle',
		        'set.fossil': 'Fossil',
		        'set.team_rocket': 'Team Rocket',
		        'set.gym_heroes': 'Gym Heroes',
		        'set.gym_challenge': 'Gym Challenge',
		        'set.neo_genesis': 'Neo Genesis',
		        'set.neo_discovery': 'Neo Discovery',
		        'set.neo_revelation': 'Neo Revelation',
		        'set.neo_destiny': 'Neo Destiny',
		        'set.legendary_collection': 'Legendary Collection',
		        'set.expedition': 'Expedition',
		        'set.aquapolis': 'Aquapolis',
		        'set.skyridge': 'Skyridge',
		        'set.ex_ruby_sapphire': 'EX Ruby & Sapphire',
		        'set.ex_sandstorm': 'EX Sandstorm',
		        'set.ex_dragon': 'EX Dragon',
		        'set.diamond_pearl': 'Diamond & Pearl',
		        'set.mysterious_treasures': 'Mysterious Treasures',
		        'set.secret_wonders': 'Secret Wonders',
		        'set.great_encounters': 'Great Encounters',
		        'set.majestic_dawn': 'Majestic Dawn',
		        'set.platinum': 'Platinum',
		        'set.heartgold_soulsilver': 'HeartGold & SoulSilver',
		        'set.call_of_legends': 'Call of Legends',
		        'set.black_white': 'Black & White',
		        'set.xy': 'XY',
		        'set.sun_moon': 'Sun & Moon',
		        'set.sword_shield': 'Sword & Shield',
		        'set.scarlet_violet': 'Scarlet & Violet',
		        'set.battle_styles': 'Battle Styles',
		        'set.chilling_reign': 'Chilling Reign',
		        'set.fusion_strike': 'Fusion Strike',
		        'set.lost_origin': 'Lost Origin',
		        'set.evolving_skies': 'Evolving Skies',
		        'set.astral_radiance': 'Astral Radiance',
		        'set.brilliant_stars': 'Brilliant Stars',
		        'set.brilliant_fusion': 'Brilliant Fusion',
		        'set.lost_thunder': 'Lost Thunder',
		        'set.hidden_fates': 'Hidden Fates',
		        'set.cosmic_eclipse': 'Cosmic Eclipse',
		        'set.darkness_ablaze': 'Darkness Ablaze',
		        'set.vivid_voltage': 'Vivid Voltage',
		        // Rarezas
		        'rarity.common': 'Common',
		        'rarity.uncommon': 'Uncommon',
		        'rarity.rare': 'Rare',
		        'rarity.rareHolo': 'Rare Holo',
		        'rarity.rareUltra': 'Rare Ultra',
		        'rarity.rareSecret': 'Rare Secret',
		        'rarity.rareRainbow': 'Rare Rainbow',
		        // New rarities
		        'rarity.promo': 'Promo',
		        'rarity.unreleased': 'Unreleased',
		        'rarity.unknown': 'Unknown',
		        'rarity.none': 'None'
		    }
		};

		function changeLanguage(lang) {
		    try {
		        console.log(`Changing language to: ${lang}`);
		        // Guardar idioma
		        if (typeof localStorage !== 'undefined') {
		            localStorage.setItem('selectedLanguage', lang);
		            // Guardar timestamp para forzar eventos storage en otras pestañas aunque el valor sea igual
		            localStorage.setItem('selectedLanguageTimestamp', String(Date.now()));
		        }
		        if (typeof document !== 'undefined') {
		            document.documentElement.lang = lang;
		        }
		        updateTranslations(lang);

		        // Emitir evento custom en la misma ventana para que otros módulos puedan reaccionar inmediatamente
		        try {
		            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
		        } catch (err) {
		            console.warn('Could not dispatch languageChanged event', err);
		        }
		    } catch (err) {
		        console.error('Error in changeLanguage:', err);
		    }
		}

		function updateTranslations(lang) {
		    try {
		        console.log(`Updating translations to: ${lang}`);

		        if (typeof document === 'undefined') return;

		        // Guardar valores actuales de campos con id (no se persisten en storage, sólo en memoria)
		        const preserved = [];
		        try {
		            const inputs = document.querySelectorAll('input[id], textarea[id], select[id]');
		            inputs.forEach(el => {
		                const record = { id: el.id, tag: el.tagName.toLowerCase(), type: el.type || '', value: el.value };
		                // incluir estado checked para checkbox/radio
		                if (el.type === 'checkbox' || el.type === 'radio') {
		                    record.checked = el.checked;
		                }
		                preserved.push(record);
		            });
		        } catch (err) {
		            console.warn('Error preservando valores de campos:', err);
		        }

		        // Actualizar textos con data-translate
		        const elements = document.querySelectorAll('[data-translate]');
		        elements.forEach(element => {
		            const key = element.getAttribute('data-translate');
		            if (translations[lang] && translations[lang][key]) {
		                element.textContent = translations[lang][key];
		            }
		        });

		        // Actualizar placeholders
		        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
		        placeholderElements.forEach(element => {
		            const key = element.getAttribute('data-translate-placeholder');
		            if (translations[lang] && translations[lang][key]) {
		                element.placeholder = translations[lang][key];
		            }
		        });

		        // Actualizar title attributes (data-translate-title)
		        const titleElements = document.querySelectorAll('[data-translate-title]');
		        titleElements.forEach(element => {
		            const key = element.getAttribute('data-translate-title');
		            if (translations[lang] && translations[lang][key]) {
		                element.title = translations[lang][key];
		            }
		        });

		        // Actualizar aria-label (data-translate-aria)
		        const ariaElements = document.querySelectorAll('[data-translate-aria]');
		        ariaElements.forEach(element => {
		            const key = element.getAttribute('data-translate-aria');
		            if (translations[lang] && translations[lang][key]) {
		                element.setAttribute('aria-label', translations[lang][key]);
		            }
		        });

		        // Actualizar innerHTML si se necesita (data-translate-html)
		        const htmlElements = document.querySelectorAll('[data-translate-html]');
		        htmlElements.forEach(element => {
		            const key = element.getAttribute('data-translate-html');
		            if (translations[lang] && translations[lang][key]) {
		                element.innerHTML = translations[lang][key];
		            }
		        });

		        // Actualizar value si se necesita (data-translate-value)
		        const valueElements = document.querySelectorAll('[data-translate-value]');
		        valueElements.forEach(element => {
		            const key = element.getAttribute('data-translate-value');
		            if (translations[lang] && translations[lang][key]) {
		                element.value = translations[lang][key];
		            }
		        });

		        // Actualizar options de tipos de Pokémon
		        updatePokemonTypes(lang);

		        // Restaurar valores preservados
		        try {
		            preserved.forEach(rec => {
		                const el = document.getElementById(rec.id);
		                if (!el) return;
		                if (rec.tag === 'select') {
		                    // intentar restaurar la selección (valor)
		                    el.value = rec.value;
		                } else if (rec.type === 'checkbox' || rec.type === 'radio') {
		                    el.checked = !!rec.checked;
		                } else {
		                    // campos de texto/contraseña/textarea
		                    el.value = rec.value;
		                }
		            });
		        } catch (err) {
		            console.warn('Error restaurando valores de campos:', err);
		        }

		    } catch (err) {
		        console.error('Error in updateTranslations:', err);
		    }
		}

		function updatePokemonTypes(lang) {
		    try {
		        if (typeof document === 'undefined') return;
		        const typeSelect = document.getElementById('tipoPokemon');
		        if (typeSelect) {
		            const options = typeSelect.querySelectorAll('option[value]:not([value=""])');
		            options.forEach(option => {
		                const value = option.value;
		                const key = `type.${value}`;
		                if (translations[lang] && translations[lang][key]) {
		                    option.textContent = translations[lang][key];
		                }
		            });
		        }
		    } catch (err) {
		        console.error('Error in updatePokemonTypes:', err);
		    }
		}

		// Sincronizar traducción entre pestañas/ventanas
		window.addEventListener('storage', function(e) {
		    try {
		        if (!e) return;
		        // Si cambió el idioma o la marca temporal, leer el idioma actual desde localStorage
		        if (e.key === 'selectedLanguage' || e.key === 'selectedLanguageTimestamp') {
		            const newLang = (typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || 'es';
		            try {
		                updateTranslations(newLang);
		                console.log('Language synchronized via storage event:', newLang);
		            } catch (err) {
		                console.error('Error applying synced language:', err);
		            }
		        }
		    } catch (err) {
		        console.error('Error handling storage event:', err);
		    }
		});

		// También escuchar el evento custom para posibles módulos dentro de la misma ventana
		window.addEventListener('languageChanged', function(e) {
		    try {
		        const newLang = (e && e.detail && e.detail.lang) ? e.detail.lang : ((typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || 'es');
		        try {
		            updateTranslations(newLang);
		            console.log('Language changed via custom event:', newLang);
		        } catch (err) {
		            console.error('Error applying language from custom event:', err);
		        }
		    } catch (err) {
		        console.error('Error in languageChanged handler:', err);
		    }
		});

		// Hacer las funciones disponibles globalmente
		window.changeLanguage = changeLanguage;
		window.updateTranslations = updateTranslations;

		/* ============================
		   Sincronización y alertas
		   ============================ */

		// Helper para obtener traducción de clave
		function getTranslationForKey(lang, key) {
		    if (!key) return null;
		    return translations[lang] && translations[lang][key] ? translations[lang][key] : null;
		}

		// Mostrar alerta traducida.
		function translatedAlert(keyOrText) {
		    try {
		        const currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || document.documentElement && document.documentElement.lang || 'es';
		        let text = keyOrText;

		        if (typeof keyOrText === 'string' && keyOrText.startsWith('t:')) {
		            const key = keyOrText.slice(2);
		            const translated = getTranslationForKey(currentLang, key);
		            text = translated || key; // fallback a la key si no existe traducción
		        } else if (typeof keyOrText === 'string' && translations[currentLang] && translations[currentLang][keyOrText]) {
		            // si el usuario pasó directamente la key sin prefijo
		            text = translations[currentLang][keyOrText];
		        }

		        // Usar el alert original almacenado
		        if (typeof window._originalAlert === 'function') {
		            window._originalAlert(text);
		        } else if (typeof window.alert === 'function') {
		            // Si por alguna razón _originalAlert no está definido (defensa), usar window.alert nativo
		            window.alert(text);
		        } else {
		            // fallback seguro
		            console.log('Alert:', text);
		        }
		    } catch (err) {
		        console.error('Error in translatedAlert:', err);
		    }
		}

		// Guardar el alert original una sola vez y sobrescribir window.alert para soportar prefijo "t:"
		if (!window._originalAlert) {
		    try {
		        // Asegurarnos de guardar una referencia a una función de alert "nativa" si existe
		        if (typeof window.alert === 'function') {
		            window._originalAlert = window.alert.bind(window);
		        } else {
		            window._originalAlert = function (msg) { console.log('alert:', msg); };
		        }

		        // Sobrescribir alert por una función que maneje claves "t:..."
		        window.alert = function(message) {
		            try {
		                // si message es "t:clave" lo traducimos
		                if (typeof message === 'string' && message.startsWith('t:')) {
		                    translatedAlert(message);
		                    return;
		                }
		                // si message coincide exactamente con una clave de traducción en el idioma actual, usarla
		                const currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || document.documentElement && document.documentElement.lang || 'es';
		                if (typeof message === 'string' && translations[currentLang] && translations[currentLang][message]) {
		                    window._originalAlert(translations[currentLang][message]);
		                    return;
		                }
		                // sino comportamiento normal
		                window._originalAlert(message);
		            } catch (err) {
		                // En caso de error usar la original si existe o consola
		                if (typeof window._originalAlert === 'function') {
		                    window._originalAlert(String(message));
		                } else {
		                    console.log('alert fallback:', message);
		                }
		            }
		        };
		    } catch (err) {
		        console.error('Error overriding window.alert:', err);
		    }
		}

		// Exponer helper globalmente (por si se prefiere usar sin sobrescribir alert)
		window.translatedAlert = translatedAlert;

		// ----------------------
		// Exponer helpers para otros scripts (p. ej. perfil.js)
		window.getTranslationForKey = getTranslationForKey;
		window.t = function(key) {
		    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('selectedLanguage')) || document.documentElement && document.documentElement.lang || 'es';
		    return getTranslationForKey(lang, key) || key;
		};

		console.log('Translator script loaded successfully');

		// Indicar que el traductor está listo y emitir evento para otros scripts
		try {
		    window.__translatorReady = true;
		    window.dispatchEvent(new CustomEvent('translatorReady'));
		} catch (err) {
		    console.warn('Could not dispatch translatorReady event', err);
		}
	} catch (err) {
		// Evitar Uncaught Error que interrumpe otros scripts. Loguear para debugging.
		console.error('Error initializing translator script:', err);
	}
})();
