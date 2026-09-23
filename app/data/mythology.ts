import type { DeityNode, DeityEdge, MythologyGraph } from '~/types/graph'

// Sources: Rigveda, Puranas (Vishnu, Shiva, Devi Bhagavata, Bhagavata), Ramayana, Mahabharata.
// Scope note: Hindu mythology has many regional/sectarian variants (Shaiva, Vaishnava, Shakta) —
// this graph follows the most common pan-Hindu Puranic synthesis, not any single tradition exclusively.

const nodes: DeityNode[] = [
  // ── Source / cosmogony ─────────────────────────────────────────
  { id: 'brahman', name: 'Brahman', sanskrit: 'ब्रह्मन्', category: 'source', epithet: 'The Absolute', summary: 'The formless, infinite ultimate reality from which all existence, gods, and matter emanate.', source: 'Upanishads' },
  { id: 'prakriti', name: 'Prakriti', sanskrit: 'प्रकृति', category: 'source', epithet: 'Primordial Nature', summary: 'Primordial nature/matter, the dynamic feminine principle that pairs with pure consciousness (Purusha).', source: 'Samkhya / Devi Bhagavata Purana' },
  { id: 'purusha', name: 'Purusha', sanskrit: 'पुरुष', category: 'source', epithet: 'Cosmic Being', summary: 'The primordial cosmic being / pure consciousness; the sacrifice of Purusha is said to have formed the universe.', source: 'Purusha Sukta, Rigveda' },
  { id: 'kaala', name: 'Kāla', sanskrit: 'काल', category: 'source', epithet: 'Time', summary: 'Personification of Time, sometimes treated as a supreme devouring principle beyond even the Trimurti.', source: 'Puranas' },
  { id: 'hiranyagarbha', name: 'Hiranyagarbha', sanskrit: 'हिरण्यगर्भ', category: 'source', epithet: 'Golden Womb', summary: 'The golden cosmic egg/embryo from which the universe and Brahma emerged.', source: 'Rigveda 10.121' },

  // ── Devi (Great Goddess) ───────────────────────────────────────
  { id: 'adishakti', name: 'Adi Parashakti', sanskrit: 'आदि पराशक्ति', category: 'devi', epithet: 'Supreme Primordial Power', summary: 'The supreme Goddess in Shaktism, source of Prakriti and consort-energy of the Trimurti; manifests as Durga, Lakshmi, Saraswati and Kali.', domain: ['creation', 'power', 'cosmos'], source: 'Devi Mahatmya / Devi Bhagavata Purana' },
  { id: 'durga', name: 'Durga', sanskrit: 'दुर्गा', category: 'devi', epithet: 'The Invincible', summary: 'Warrior goddess formed from the combined energies of the gods to slay the buffalo demon Mahishasura.', domain: ['protection', 'war'], mount: 'Lion/Tiger', weapon: ['Trishula', 'Chakra', 'Sword'], source: 'Devi Mahatmya' },
  { id: 'kali', name: 'Kali', sanskrit: 'काली', category: 'devi', epithet: 'The Dark Goddess of Time', summary: 'Fierce form of Devi associated with time, death, and destruction of ego; emerges from Durga’s fury in battle.', domain: ['destruction', 'time', 'liberation'], source: 'Devi Mahatmya' },
  { id: 'parvati', name: 'Parvati', sanskrit: 'पार्वती', category: 'devi', epithet: 'Daughter of the Mountain', summary: 'Gentle, nurturing form of Devi; consort of Shiva and mother of Ganesha and Kartikeya. Reincarnation of Sati.', consort: ['shiva'], domain: ['devotion', 'fertility', 'power'], source: 'Shiva Purana' },
  { id: 'sati', name: 'Sati', sanskrit: 'सती', category: 'devi', epithet: 'First consort of Shiva', summary: 'Daughter of Daksha and first wife of Shiva; self-immolated after her father insulted Shiva, later reborn as Parvati.', consort: ['shiva'], source: 'Shiva Purana' },
  { id: 'lakshmi', name: 'Lakshmi', sanskrit: 'लक्ष्मी', category: 'devi', epithet: 'Goddess of Fortune', summary: 'Goddess of wealth, prosperity and beauty; consort of Vishnu, born from the Churning of the Ocean of Milk.', consort: ['vishnu'], domain: ['wealth', 'fortune', 'beauty'], mount: 'Owl / Lotus', source: 'Vishnu Purana' },
  { id: 'saraswati', name: 'Saraswati', sanskrit: 'सरस्वती', category: 'devi', epithet: 'Goddess of Knowledge', summary: 'Goddess of knowledge, music, art and speech; consort of Brahma.', consort: ['brahma'], domain: ['knowledge', 'arts', 'speech'], mount: 'Swan', source: 'Rigveda / Brahma Vaivarta Purana' },
  { id: 'ganga', name: 'Ganga', sanskrit: 'गङ्गा', category: 'devi', epithet: 'Goddess of the Ganges', summary: 'Celestial river goddess brought to earth by the penance of Bhagiratha; associated with Shiva, who breaks her fall in his hair.', source: 'Ramayana / Bhagavata Purana' },

  // ── Trimurti ────────────────────────────────────────────────────
  { id: 'brahma', name: 'Brahma', sanskrit: 'ब्रह्मा', category: 'trimurti', epithet: 'The Creator', summary: 'The creator god who fashions the universe, born from a lotus emerging from Vishnu’s navel.', consort: ['saraswati'], domain: ['creation'], mount: 'Hamsa (Swan)', source: 'Puranas' },
  { id: 'vishnu', name: 'Vishnu', sanskrit: 'विष्णु', category: 'trimurti', epithet: 'The Preserver', summary: 'The preserver god who maintains cosmic order (dharma), descending as avatars whenever balance is threatened.', consort: ['lakshmi'], domain: ['preservation', 'dharma'], mount: 'Garuda', weapon: ['Sudarshana Chakra', 'Gada Kaumodaki', 'Conch Panchajanya'], source: 'Vishnu Purana / Bhagavata Purana' },
  { id: 'shiva', name: 'Shiva', sanskrit: 'शिव', category: 'trimurti', epithet: 'The Destroyer', summary: 'The destroyer/transformer god, ascetic lord of yoga, associated with dissolution that enables renewal.', consort: ['parvati', 'sati'], domain: ['destruction', 'transformation', 'asceticism'], mount: 'Nandi (Bull)', weapon: ['Trishula', 'Pinaka'], source: 'Shiva Purana' },

  // ── Devas / celestial gods ─────────────────────────────────────
  { id: 'indra', name: 'Indra', sanskrit: 'इन्द्र', category: 'deva', epithet: 'King of the Devas', summary: 'King of the heavens (Svarga) and god of thunder, rain and war; leader of the Devas against the Asuras.', domain: ['thunder', 'rain', 'war'], mount: 'Airavata', weapon: ['Vajra'], source: 'Rigveda' },
  { id: 'agni', name: 'Agni', sanskrit: 'अग्नि', category: 'deva', epithet: 'God of Fire', summary: 'God of fire, the messenger between gods and humans, carrying sacrificial offerings.', domain: ['fire', 'sacrifice'], mount: 'Ram', source: 'Rigveda' },
  { id: 'vayu', name: 'Vayu', sanskrit: 'वायु', category: 'deva', epithet: 'God of Wind', summary: 'God of wind and breath (prana); father of Hanuman and Bhima.', domain: ['wind', 'breath'], source: 'Rigveda' },
  { id: 'varuna', name: 'Varuna', sanskrit: 'वरुण', category: 'deva', epithet: 'God of Cosmic Order & Oceans', summary: 'God of celestial waters and cosmic law (rta), later associated primarily with the oceans.', domain: ['water', 'law'], mount: 'Makara', source: 'Rigveda' },
  { id: 'surya', name: 'Surya', sanskrit: 'सूर्य', category: 'deva', epithet: 'The Sun God', summary: 'Solar deity who rides across the sky in a chariot of seven horses; father of Karna, Yama, Shani and Sugriva.', domain: ['sun', 'light'], mount: 'Seven-horse chariot', source: 'Rigveda / Mahabharata' },
  { id: 'chandra', name: 'Chandra', sanskrit: 'चन्द्र', category: 'deva', epithet: 'The Moon God', summary: 'Lunar deity; married to the 27 Nakshatra daughters of Daksha.', domain: ['moon', 'night'], source: 'Puranas' },
  { id: 'yama', name: 'Yama', sanskrit: 'यम', category: 'deva', epithet: 'God of Death', summary: 'God of death and the underworld, first mortal to die and thus ruler of ancestors; son of Surya.', domain: ['death', 'justice'], mount: 'Buffalo', source: 'Rigveda' },
  { id: 'kubera', name: 'Kubera', sanskrit: 'कुबेर', category: 'deva', epithet: 'God of Wealth', summary: 'King of the Yakshas and god of wealth, half-brother of Ravana.', domain: ['wealth'], source: 'Puranas' },
  { id: 'kama', name: 'Kamadeva', sanskrit: 'कामदेव', category: 'deva', epithet: 'God of Love', summary: 'God of love and desire, incinerated by Shiva’s third eye for disturbing his meditation, later restored.', domain: ['love', 'desire'], weapon: ['Sugarcane bow'], source: 'Shiva Purana' },
  { id: 'shani', name: 'Shani', sanskrit: 'शनि', category: 'deva', epithet: 'God of Saturn / Karma', summary: 'Deity of the planet Saturn associated with karma, discipline and justice; son of Surya.', domain: ['karma', 'discipline'], source: 'Puranas' },

  // ── Demigods / divine beings ────────────────────────────────────
  { id: 'ganesha', name: 'Ganesha', sanskrit: 'गणेश', category: 'demigod', epithet: 'Remover of Obstacles', summary: 'Elephant-headed god of beginnings, wisdom and obstacles; son of Shiva and Parvati.', domain: ['wisdom', 'beginnings'], mount: 'Mouse (Mushika)', source: 'Shiva Purana' },
  { id: 'kartikeya', name: 'Kartikeya', sanskrit: 'कार्तिकेय', category: 'demigod', epithet: 'God of War', summary: 'God of war and commander of the divine armies; son of Shiva and Parvati (or of Agni, in some tellings).', domain: ['war', 'strategy'], mount: 'Peacock', weapon: ['Vel spear'], source: 'Skanda Purana' },
  { id: 'hanuman', name: 'Hanuman', sanskrit: 'हनुमान्', category: 'demigod', epithet: 'The Devoted', summary: 'Vanara devotee of Rama, son of Vayu, renowned for strength, devotion and the Sundara Kanda feats in the Ramayana.', domain: ['devotion', 'strength'], source: 'Ramayana' },
  { id: 'garuda', name: 'Garuda', sanskrit: 'गरुड़', category: 'demigod', epithet: 'King of Birds', summary: 'Divine eagle-man, mount of Vishnu, son of sage Kashyapa and Vinata.', domain: ['sky'], source: 'Mahabharata / Puranas' },
  { id: 'nandi', name: 'Nandi', sanskrit: 'नन्दी', category: 'demigod', epithet: 'The Sacred Bull', summary: 'Bull mount and gate-guardian of Shiva, symbol of dharma and devotion.', source: 'Shiva Purana' },

  // ── Sages / rishis ───────────────────────────────────────────────
  { id: 'kashyapa', name: 'Kashyapa', sanskrit: 'कश्यप', category: 'sage', epithet: 'Father of Gods and Demons', summary: 'Primordial sage, son of Marichi; married to Daksha’s daughters, father of devas, asuras, nagas and all living beings.', source: 'Puranas' },
  { id: 'marichi', name: 'Marichi', sanskrit: 'मरीचि', category: 'sage', epithet: 'Mind-born son of Brahma', summary: 'One of the Saptarishi, mind-born son of Brahma, father of Kashyapa.', source: 'Puranas' },
  { id: 'daksha', name: 'Daksha', sanskrit: 'दक्ष', category: 'sage', epithet: 'Lord of Creatures', summary: 'A Prajapati (progenitor), son of Brahma; father of Sati and many daughters married to Kashyapa and Chandra.', source: 'Puranas' },
  { id: 'aditi', name: 'Aditi', sanskrit: 'अदिति', category: 'devi', epithet: 'Mother of the Devas', summary: 'Daughter of Daksha, wife of Kashyapa, mother of the Adityas (including Indra and Surya/Vishnu’s Vamana avatar).', consort: ['kashyapa'], source: 'Rigveda / Puranas' },
  { id: 'diti', name: 'Diti', sanskrit: 'दिति', category: 'devi', epithet: 'Mother of the Daityas', summary: 'Daughter of Daksha, wife of Kashyapa, mother of the Daitya asuras including Hiranyakashipu and Hiranyaksha.', consort: ['kashyapa'], source: 'Puranas' },
  { id: 'vasishtha', name: 'Vasishtha', sanskrit: 'वसिष्ठ', category: 'sage', epithet: 'Royal Sage', summary: 'One of the Saptarishi, family priest of the Suryavamsha (solar dynasty) including Rama.', source: 'Ramayana' },
  { id: 'vishwamitra', name: 'Vishwamitra', sanskrit: 'विश्वामित्र', category: 'sage', epithet: 'Sage-King', summary: 'Sage who guided young Rama and Lakshmana; composer of the Gayatri Mantra.', source: 'Ramayana' },
  { id: 'narada', name: 'Narada', sanskrit: 'नारद', category: 'sage', epithet: 'Divine Messenger', summary: 'Celestial sage and devotee of Vishnu, wandering messenger between gods and mortals across the Puranas.', source: 'Puranas' },

  // ── Avatars of Vishnu (Dashavatara + others) ─────────────────────
  { id: 'matsya', name: 'Matsya', sanskrit: 'मत्स्य', category: 'avatar', epithet: 'The Fish', summary: 'First avatar of Vishnu; saved Manu and the seed of all life from the great deluge.', source: 'Matsya Purana' },
  { id: 'kurma', name: 'Kurma', sanskrit: 'कूर्म', category: 'avatar', epithet: 'The Tortoise', summary: 'Second avatar; supported Mount Mandara on his back during the Samudra Manthan (churning of the ocean).', source: 'Bhagavata Purana' },
  { id: 'varaha', name: 'Varaha', sanskrit: 'वराह', category: 'avatar', epithet: 'The Boar', summary: 'Third avatar; rescued the earth goddess Bhudevi from the depths of the cosmic ocean, slaying the asura Hiranyaksha.', source: 'Bhagavata Purana' },
  { id: 'narasimha', name: 'Narasimha', sanskrit: 'नरसिंह', category: 'avatar', epithet: 'The Man-Lion', summary: 'Fourth avatar, half-man half-lion; slew the asura king Hiranyakashipu to protect his devotee Prahlada.', source: 'Bhagavata Purana' },
  { id: 'vamana', name: 'Vamana', sanskrit: 'वामन', category: 'avatar', epithet: 'The Dwarf', summary: 'Fifth avatar; a dwarf brahmin who reclaimed the three worlds from the asura king Bali in three strides.', source: 'Bhagavata Purana' },
  { id: 'parashurama', name: 'Parashurama', sanskrit: 'परशुराम', category: 'avatar', epithet: 'Rama with the Axe', summary: 'Sixth avatar; warrior-sage who eradicated corrupt kshatriya rule with his axe.', source: 'Mahabharata / Puranas' },
  { id: 'rama', name: 'Rama', sanskrit: 'राम', category: 'avatar', epithet: 'The Ideal King', summary: 'Seventh avatar; prince of Ayodhya whose life of exile and the rescue of Sita from Ravana forms the Ramayana.', consort: ['sita'], source: 'Ramayana' },
  { id: 'krishna', name: 'Krishna', sanskrit: 'कृष्ण', category: 'avatar', epithet: 'The Divine Statesman', summary: 'Eighth avatar; cowherd prince of Vrindavan and Dwarka, charioteer-guide of Arjuna and speaker of the Bhagavad Gita.', consort: ['rukmini', 'radha'], source: 'Mahabharata / Bhagavata Purana' },
  { id: 'buddha', name: 'Buddha', sanskrit: 'बुद्ध', category: 'avatar', epithet: 'The Enlightened One', summary: 'Ninth avatar in many Puranic lists, incorporating Gautama Buddha into the Vishnu avatar lineage.', source: 'Puranas' },
  { id: 'kalki', name: 'Kalki', sanskrit: 'कल्कि', category: 'avatar', epithet: 'The Future Rider', summary: 'Tenth and final avatar, prophesied to appear at the end of the Kali Yuga riding a white horse to end darkness.', source: 'Puranas' },

  // ── Ramayana figures ──────────────────────────────────────────────
  { id: 'sita', name: 'Sita', sanskrit: 'सीता', category: 'epic', epithet: 'Daughter of the Earth', summary: 'Wife of Rama, considered an avatar of Lakshmi; central figure of the Ramayana.', consort: ['rama'], source: 'Ramayana' },
  { id: 'lakshmana', name: 'Lakshmana', sanskrit: 'लक्ष्मण', category: 'epic', epithet: 'Devoted Brother', summary: 'Younger half-brother of Rama who accompanied him into exile; considered an incarnation of Shesha Naga.', source: 'Ramayana' },
  { id: 'dasharatha', name: 'Dasharatha', sanskrit: 'दशरथ', category: 'epic', epithet: 'King of Ayodhya', summary: 'King of Ayodhya, father of Rama, Bharata, Lakshmana and Shatrughna.', source: 'Ramayana' },
  { id: 'ravana', name: 'Ravana', sanskrit: 'रावण', category: 'asura', epithet: 'The Ten-Headed King', summary: 'Rakshasa king of Lanka, great scholar and devotee of Shiva who abducted Sita, precipitating the war with Rama.', source: 'Ramayana' },

  // ── Mahabharata figures ────────────────────────────────────────────
  { id: 'arjuna', name: 'Arjuna', sanskrit: 'अर्जुन', category: 'epic', epithet: 'The Peerless Archer', summary: 'Pandava prince, son of Indra, and Krishna’s closest companion; recipient of the Bhagavad Gita’s teaching.', source: 'Mahabharata' },
  { id: 'bhima', name: 'Bhima', sanskrit: 'भीम', category: 'epic', epithet: 'The Mighty', summary: 'Pandava prince of immense strength, son of Vayu.', source: 'Mahabharata' },
  { id: 'yudhishthira', name: 'Yudhishthira', sanskrit: 'युधिष्ठिर', category: 'epic', epithet: 'The Just King', summary: 'Eldest Pandava, son of Yama (Dharma), known for unwavering commitment to truth and dharma.', source: 'Mahabharata' },
  { id: 'karna', name: 'Karna', sanskrit: 'कर्ण', category: 'epic', epithet: 'The Tragic Hero', summary: 'Son of Surya and Kunti, born before her marriage; raised by a charioteer, fought alongside the Kauravas.', source: 'Mahabharata' },
  { id: 'kunti', name: 'Kunti', sanskrit: 'कुन्ती', category: 'epic', epithet: 'Mother of the Pandavas', summary: 'Mother of Karna, Yudhishthira, Bhima and Arjuna through divine boons; wife of Pandu.', source: 'Mahabharata' },
  { id: 'draupadi', name: 'Draupadi', sanskrit: 'द्रौपदी', category: 'epic', epithet: 'Fire-born Princess', summary: 'Shared wife of the five Pandavas, born from a sacrificial fire; considered an incarnation of Devi.', consort: ['yudhishthira', 'bhima', 'arjuna'], source: 'Mahabharata' },
  { id: 'rukmini', name: 'Rukmini', sanskrit: 'रुक्मिणी', category: 'epic', epithet: 'Chief Queen of Dwarka', summary: 'Principal queen of Krishna at Dwarka, considered an avatar of Lakshmi.', consort: ['krishna'], source: 'Bhagavata Purana' },
  { id: 'radha', name: 'Radha', sanskrit: 'राधा', category: 'epic', epithet: 'Beloved of Krishna', summary: 'Divine consort of Krishna’s youth in Vrindavan, embodiment of devotional love (bhakti); identified with Lakshmi in some traditions.', consort: ['krishna'], source: 'Bhagavata Purana / Gita Govinda' },
  { id: 'sugriva', name: 'Sugriva', sanskrit: 'सुग्रीव', category: 'epic', epithet: 'Vanara King', summary: 'Vanara king of Kishkindha, son of Surya, ally of Rama.', source: 'Ramayana' },

  // ── Asuras / antagonists ────────────────────────────────────────
  { id: 'hiranyakashipu', name: 'Hiranyakashipu', sanskrit: 'हिरण्यकशिपु', category: 'asura', epithet: 'The Tyrant King', summary: 'Daitya king who sought invincibility and persecuted his own devotee son Prahlada; slain by Narasimha.', source: 'Bhagavata Purana' },
  { id: 'hiranyaksha', name: 'Hiranyaksha', sanskrit: 'हिरण्याक्ष', category: 'asura', epithet: 'The Earth-Dragger', summary: 'Daitya who dragged the earth into the cosmic ocean; slain by Varaha.', source: 'Bhagavata Purana' },
  { id: 'mahishasura', name: 'Mahishasura', sanskrit: 'महिषासुर', category: 'asura', epithet: 'The Buffalo Demon', summary: 'Shape-shifting buffalo demon who conquered the heavens; slain by Durga.', source: 'Devi Mahatmya' },
  { id: 'bali', name: 'Mahabali', sanskrit: 'महाबलि', category: 'asura', epithet: 'The Generous King', summary: 'Virtuous Daitya king who ruled the three worlds; humbled by Vishnu’s Vamana avatar but honored for his generosity.', source: 'Bhagavata Purana' },
  { id: 'prahlada', name: 'Prahlada', sanskrit: 'प्रह्लाद', category: 'epic', epithet: 'The Devoted Prince', summary: 'Devout son of Hiranyakashipu whose faith in Vishnu triggered Narasimha’s intervention.', source: 'Bhagavata Purana' }
]

const edges: DeityEdge[] = [
  // Cosmogony
  { id: 'e1', from: 'brahman', to: 'purusha', type: 'emanates_from', label: 'manifests as' },
  { id: 'e2', from: 'brahman', to: 'prakriti', type: 'emanates_from', label: 'manifests as' },
  { id: 'e3', from: 'prakriti', to: 'adishakti', type: 'form_of', label: 'personified as' },
  { id: 'e4', from: 'purusha', to: 'hiranyagarbha', type: 'emanates_from', label: 'forms' },
  { id: 'e5', from: 'hiranyagarbha', to: 'brahma', type: 'emanates_from', label: 'gives rise to' },
  { id: 'e6', from: 'kaala', to: 'brahman', type: 'form_of', label: 'aspect of', note: 'Some Puranas equate Kala with Brahman/Shiva as the supreme devourer.' },

  // Trimurti origins & family
  { id: 'e7', from: 'vishnu', to: 'brahma', type: 'created_by', label: 'creates from lotus at navel' },
  { id: 'e8', from: 'adishakti', to: 'vishnu', type: 'parent_of', label: 'empowers / gives rise to' },
  { id: 'e9', from: 'adishakti', to: 'shiva', type: 'parent_of', label: 'empowers / gives rise to' },
  { id: 'e10', from: 'brahma', to: 'saraswati', type: 'consort_of', label: 'consort' },
  { id: 'e11', from: 'vishnu', to: 'lakshmi', type: 'consort_of', label: 'consort' },
  { id: 'e12', from: 'shiva', to: 'parvati', type: 'consort_of', label: 'consort' },
  { id: 'e13', from: 'shiva', to: 'sati', type: 'consort_of', label: 'first consort' },
  { id: 'e14', from: 'sati', to: 'parvati', type: 'incarnation_of', label: 'reincarnates as' },
  { id: 'e15', from: 'daksha', to: 'sati', type: 'parent_of', label: 'father of' },
  { id: 'e16', from: 'brahma', to: 'daksha', type: 'parent_of', label: 'mind-born son' },
  { id: 'e17', from: 'brahma', to: 'marichi', type: 'parent_of', label: 'mind-born son' },
  { id: 'e18', from: 'marichi', to: 'kashyapa', type: 'parent_of', label: 'father of' },
  { id: 'e19', from: 'daksha', to: 'aditi', type: 'parent_of', label: 'father of' },
  { id: 'e20', from: 'daksha', to: 'diti', type: 'parent_of', label: 'father of' },
  { id: 'e21', from: 'kashyapa', to: 'aditi', type: 'consort_of', label: 'consort' },
  { id: 'e22', from: 'kashyapa', to: 'diti', type: 'consort_of', label: 'consort' },
  { id: 'e23', from: 'aditi', to: 'indra', type: 'parent_of', label: 'mother of' },
  { id: 'e24', from: 'aditi', to: 'surya', type: 'parent_of', label: 'mother of' },
  { id: 'e25', from: 'diti', to: 'hiranyakashipu', type: 'parent_of', label: 'mother of' },
  { id: 'e26', from: 'diti', to: 'hiranyaksha', type: 'parent_of', label: 'mother of' },
  { id: 'e27', from: 'kashyapa', to: 'garuda', type: 'parent_of', label: 'father of (via Vinata)' },

  // Devi forms
  { id: 'e28', from: 'adishakti', to: 'durga', type: 'form_of', label: 'manifests as' },
  { id: 'e29', from: 'adishakti', to: 'kali', type: 'form_of', label: 'manifests as' },
  { id: 'e30', from: 'adishakti', to: 'parvati', type: 'form_of', label: 'manifests as' },
  { id: 'e31', from: 'adishakti', to: 'lakshmi', type: 'form_of', label: 'manifests as' },
  { id: 'e32', from: 'adishakti', to: 'saraswati', type: 'form_of', label: 'manifests as' },
  { id: 'e33', from: 'durga', to: 'kali', type: 'form_of', label: 'fury manifests as' },
  { id: 'e34', from: 'durga', to: 'mahishasura', type: 'slays', label: 'slays' },
  { id: 'e35', from: 'shiva', to: 'ganga', type: 'consort_of', label: 'bears in his hair', note: 'Ganga is sometimes listed as a minor consort/river-form associated with Shiva.' },

  // Shiva & Parvati's children
  { id: 'e36', from: 'shiva', to: 'ganesha', type: 'parent_of', label: 'father of' },
  { id: 'e37', from: 'parvati', to: 'ganesha', type: 'parent_of', label: 'mother of' },
  { id: 'e38', from: 'shiva', to: 'kartikeya', type: 'parent_of', label: 'father of' },
  { id: 'e39', from: 'parvati', to: 'kartikeya', type: 'parent_of', label: 'mother of' },
  { id: 'e40', from: 'shiva', to: 'nandi', type: 'rules', label: 'mount & gatekeeper' },
  { id: 'e41', from: 'shiva', to: 'kama', type: 'slays', label: 'incinerates with third eye' },

  // Devas
  { id: 'e42', from: 'vayu', to: 'hanuman', type: 'parent_of', label: 'father of' },
  { id: 'e43', from: 'vayu', to: 'bhima', type: 'parent_of', label: 'divine father of' },
  { id: 'e44', from: 'surya', to: 'yama', type: 'parent_of', label: 'father of' },
  { id: 'e45', from: 'surya', to: 'shani', type: 'parent_of', label: 'father of' },
  { id: 'e46', from: 'surya', to: 'karna', type: 'parent_of', label: 'divine father of' },
  { id: 'e47', from: 'surya', to: 'sugriva', type: 'parent_of', label: 'divine father of' },
  { id: 'e48', from: 'chandra', to: 'daksha', type: 'consort_of', label: 'married to 27 daughters of' },
  { id: 'e49', from: 'indra', to: 'arjuna', type: 'parent_of', label: 'divine father of' },
  { id: 'e50', from: 'yama', to: 'yudhishthira', type: 'parent_of', label: 'divine father of' },

  // Avatars of Vishnu (Dashavatara)
  { id: 'e51', from: 'matsya', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e52', from: 'kurma', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e53', from: 'varaha', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e54', from: 'narasimha', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e55', from: 'vamana', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e56', from: 'parashurama', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e57', from: 'rama', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e58', from: 'krishna', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e59', from: 'buddha', to: 'vishnu', type: 'avatar_of', label: 'avatar of' },
  { id: 'e60', from: 'kalki', to: 'vishnu', type: 'avatar_of', label: 'avatar of (prophesied)' },
  { id: 'e61', from: 'varaha', to: 'hiranyaksha', type: 'slays', label: 'slays' },
  { id: 'e62', from: 'narasimha', to: 'hiranyakashipu', type: 'slays', label: 'slays' },
  { id: 'e63', from: 'narasimha', to: 'prahlada', type: 'teacher_of', label: 'protects & blesses' },
  { id: 'e64', from: 'hiranyakashipu', to: 'prahlada', type: 'parent_of', label: 'father of' },
  { id: 'e65', from: 'vamana', to: 'bali', type: 'rules', label: 'humbles & grants netherworld to' },

  // Ramayana
  { id: 'e66', from: 'dasharatha', to: 'rama', type: 'parent_of', label: 'father of' },
  { id: 'e67', from: 'dasharatha', to: 'lakshmana', type: 'parent_of', label: 'father of' },
  { id: 'e68', from: 'rama', to: 'sita', type: 'consort_of', label: 'consort' },
  { id: 'e69', from: 'lakshmi', to: 'sita', type: 'incarnation_of', label: 'incarnates as' },
  { id: 'e70', from: 'lakshmana', to: 'rama', type: 'sibling_of', label: 'devoted brother of' },
  { id: 'e71', from: 'ravana', to: 'sita', type: 'slays', label: 'abducts', note: 'Not a slaying — kept for relation-type reuse; abduction, not death.' },
  { id: 'e72', from: 'rama', to: 'ravana', type: 'slays', label: 'slays' },
  { id: 'e73', from: 'hanuman', to: 'rama', type: 'teacher_of', label: 'devoted to', note: 'Direction reused to express devotee→deity relation.' },
  { id: 'e74', from: 'vasishtha', to: 'rama', type: 'teacher_of', label: 'family priest & guru of' },
  { id: 'e75', from: 'vishwamitra', to: 'rama', type: 'teacher_of', label: 'guru of' },
  { id: 'e76', from: 'sugriva', to: 'rama', type: 'teacher_of', label: 'allies with', note: 'Direction reused to express alliance.' },
  { id: 'e77', from: 'kubera', to: 'ravana', type: 'sibling_of', label: 'half-brother of' },

  // Mahabharata
  { id: 'e78', from: 'kunti', to: 'karna', type: 'parent_of', label: 'mother of' },
  { id: 'e79', from: 'kunti', to: 'yudhishthira', type: 'parent_of', label: 'mother of' },
  { id: 'e80', from: 'kunti', to: 'bhima', type: 'parent_of', label: 'mother of' },
  { id: 'e81', from: 'kunti', to: 'arjuna', type: 'parent_of', label: 'mother of' },
  { id: 'e82', from: 'draupadi', to: 'yudhishthira', type: 'consort_of', label: 'consort' },
  { id: 'e83', from: 'draupadi', to: 'bhima', type: 'consort_of', label: 'consort' },
  { id: 'e84', from: 'draupadi', to: 'arjuna', type: 'consort_of', label: 'consort' },
  { id: 'e85', from: 'adishakti', to: 'draupadi', type: 'incarnation_of', label: 'incarnates as' },
  { id: 'e86', from: 'krishna', to: 'arjuna', type: 'teacher_of', label: 'charioteer & guide of' },
  { id: 'e87', from: 'krishna', to: 'rukmini', type: 'consort_of', label: 'consort' },
  { id: 'e88', from: 'krishna', to: 'radha', type: 'consort_of', label: 'beloved of' },
  { id: 'e89', from: 'lakshmi', to: 'rukmini', type: 'incarnation_of', label: 'incarnates as' },
  { id: 'e90', from: 'narada', to: 'vishnu', type: 'teacher_of', label: 'devotee & messenger of', note: 'Direction reused to express devotee→deity relation.' }
]

export const mythologyGraph: MythologyGraph = { nodes, edges }
