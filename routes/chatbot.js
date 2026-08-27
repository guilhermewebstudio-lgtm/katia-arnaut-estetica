const express = require('express');
const router = express.Router();

// Comprehensive bilingual FAQ chatbot covering the business, treatments, and site usage
const faqData = [
  {
    id: 'hours',
    keywords_pt: ['horario', 'horário', 'aberto', 'abre', 'fecha', 'que horas funciona', 'horario de funcionamento', 'atendimento', 'que horas'],
    keywords_en: ['hours', 'open', 'close', 'schedule', 'opening time', 'opening hours'],
    answer_pt: 'Estamos abertos de Segunda a Sexta das 9h30 às 19h00, e Sábado das 10h00 às 15h00. Encerrado ao Domingo. Pode ver o horário completo na secção de Contactos do site.',
    answer_en: 'We are open Monday to Friday from 9:30 AM to 7:00 PM, and Saturday from 10:00 AM to 3:00 PM. Closed on Sunday. You can see the full schedule in the Contact section of the site.'
  },
  {
    id: 'booking_how',
    keywords_pt: ['marcar', 'marcação', 'marcações', 'marcaçao', 'marcaçoes', 'como funciona a marcação', 'como funciona as marcações', 'como funciona o agendamento', 'agendar', 'consulta', 'reservar', 'agenda', 'como marco', 'como faço uma marcação'],
    keywords_en: ['book', 'booking', 'bookings', 'appointment', 'how does booking work', 'schedule an', 'reserve'],
    answer_pt: 'Pode marcar a sua consulta diretamente no site, clicando em "Marcar Consulta". Vai preencher os seus dados, escolher o tratamento, e a data e hora que preferir. A marcação fica pendente até a equipa confirmar.',
    answer_en: 'You can book your appointment directly on the site by clicking "Book Appointment". You\'ll fill in your details, choose the treatment, and pick your preferred date and time. The booking stays pending until our team confirms it.'
  },
  {
    id: 'booking_account',
    keywords_pt: ['preciso de conta', 'preciso criar conta', 'registar', 'registo', 'criar conta', 'sem conta'],
    keywords_en: ['need an account', 'create account', 'sign up', 'register', 'without an account'],
    answer_pt: 'Sim, para marcar uma consulta precisa de criar uma conta gratuita (nome, email e telemóvel). Isso permite-lhe acompanhar as suas marcações e o seu histórico a qualquer momento.',
    answer_en: 'Yes, to book an appointment you need a free account (name, email and phone). This lets you track your bookings and history at any time.'
  },
  {
    id: 'booking_confirm',
    keywords_pt: ['confirmar marcação', 'confirmação', 'aceite', 'quando sei se', 'pendente'],
    keywords_en: ['confirm booking', 'confirmation', 'accepted', 'when will i know', 'pending'],
    answer_pt: 'Depois de pedir a marcação, ela fica com o estado "Pendente" até a equipa a aceitar ou recusar. Pode acompanhar o estado em "As Minhas Marcações", no menu.',
    answer_en: 'After requesting a booking, it stays as "Pending" until our team accepts or declines it. You can track the status under "My Bookings" in the menu.'
  },
  {
    id: 'booking_cancel',
    keywords_pt: ['cancelar', 'desmarcar', 'anular'],
    keywords_en: ['cancel', 'cancellation'],
    answer_pt: 'Pode cancelar uma marcação pendente ou confirmada em "As Minhas Marcações", clicando em "Cancelar". Pedimos que avise com a maior antecedência possível.',
    answer_en: 'You can cancel a pending or confirmed booking under "My Bookings" by clicking "Cancel". Please let us know as far in advance as possible.'
  },
  {
    id: 'price',
    keywords_pt: ['preço', 'preco', 'custa', 'valor', 'quanto', 'preços', 'tabela'],
    keywords_en: ['price', 'cost', 'how much', 'value', 'pricing'],
    answer_pt: 'Os preços variam consoante o tratamento, entre cerca de €40 e €70. Pode consultar todos os valores na secção "Tratamentos" do site, ou durante o passo 2 da marcação.',
    answer_en: 'Prices vary by treatment, roughly between €40 and €70. You can check all values in the "Treatments" section of the site, or during step 2 of the booking process.'
  },
  {
    id: 'acne',
    keywords_pt: ['acne', 'espinha', 'borbulha', 'pele oleosa', 'cravos'],
    keywords_en: ['acne', 'pimple', 'breakout', 'oily skin', 'blackheads'],
    answer_pt: 'Temos um protocolo específico de Tratamento de Acne, direcionado para peles com acne ativa — reduz a inflamação e previne marcas. Recomendamos marcar uma consulta de avaliação para um plano personalizado.',
    answer_en: 'We have a specific Acne Treatment protocol, targeted for active acne skin — it reduces inflammation and prevents scarring. We recommend booking an assessment consultation for a personalized plan.'
  },
  {
    id: 'cleansing',
    keywords_pt: ['limpeza de pele', 'limpeza facial', 'limpar a pele'],
    keywords_en: ['facial cleansing', 'deep cleansing', 'clean my skin'],
    answer_pt: 'A Limpeza de Pele Profunda é um dos nossos tratamentos mais procurados — inclui higienização, extração e hidratação, e é adequada a todos os tipos de pele.',
    answer_en: 'Deep Facial Cleansing is one of our most popular treatments — it includes cleansing, extraction and hydration, and suits all skin types.'
  },
  {
    id: 'peeling',
    keywords_pt: ['peeling', 'esfoliação química', 'renovação da pele'],
    keywords_en: ['peel', 'chemical peel', 'exfoliation'],
    answer_pt: 'O Peeling Químico promove a renovação celular, uniformizando o tom e a textura da pele e reduzindo manchas. É um tratamento rápido, com resultados visíveis já nas primeiras sessões.',
    answer_en: 'The Chemical Peel promotes cellular renewal, evening out skin tone and texture and reducing blemishes. It\'s a quick treatment, with visible results from the first sessions.'
  },
  {
    id: 'microneedling',
    keywords_pt: ['microagulhamento', 'agulhas'],
    keywords_en: ['microneedling', 'needling'],
    answer_pt: 'O Microagulhamento estimula a produção de colagénio, melhorando a firmeza e a textura da pele. É particularmente eficaz para poros dilatados e pequenas cicatrizes.',
    answer_en: 'Microneedling stimulates collagen production, improving skin firmness and texture. It\'s particularly effective for enlarged pores and minor scarring.'
  },
  {
    id: 'radiofrequency',
    keywords_pt: ['radiofrequência', 'radiofrequencia', 'lifting', 'flacidez'],
    keywords_en: ['radiofrequency', 'lifting', 'sagging skin', 'skin tightening'],
    answer_pt: 'A Radiofrequência Facial é uma tecnologia não invasiva para firmeza e lifting, que estimula o colagénio ao longo do tempo. É ideal para quem procura resultados progressivos e naturais.',
    answer_en: 'Facial Radiofrequency is a non-invasive technology for firmness and lifting, stimulating collagen over time. It\'s ideal for those seeking gradual, natural results.'
  },
  {
    id: 'hydration',
    keywords_pt: ['hidratação', 'pele seca', 'desidratada'],
    keywords_en: ['hydration', 'dry skin', 'dehydrated'],
    answer_pt: 'A Hidratação Facial Profunda repõe água e nutrientes essenciais, ideal para peles desidratadas ou que precisam de um boost de luminosidade.',
    answer_en: 'Deep Facial Hydration replenishes essential water and nutrients, ideal for dehydrated skin or a much-needed glow boost.'
  },
  {
    id: 'first_visit',
    keywords_pt: ['primeira vez', 'primeira consulta', 'o que esperar', 'como funciona a consulta'],
    keywords_en: ['first time', 'first visit', 'what to expect', 'first appointment'],
    answer_pt: 'Na primeira consulta fazemos sempre uma avaliação cuidada da sua pele antes de qualquer tratamento — isso está incluído em todas as marcações, sem custo adicional.',
    answer_en: 'On your first visit we always do a careful skin assessment before any treatment — this is included in every booking, at no extra cost.'
  },
  {
    id: 'sessions',
    keywords_pt: ['quantas sessões', 'quantas vezes', 'resultados', 'quando vejo resultados'],
    keywords_en: ['how many sessions', 'how many times', 'results', 'when will i see results'],
    answer_pt: 'O número de sessões depende do tratamento e do objetivo — normalmente entre 1 a 6 sessões espaçadas. Isso é definido na consulta de avaliação, de forma personalizada.',
    answer_en: 'The number of sessions depends on the treatment and goal — usually between 1 and 6 spaced sessions. This is defined at your assessment consultation, tailored to you.'
  },
  {
    id: 'location',
    keywords_pt: ['localização', 'localizacao', 'morada', 'onde', 'endereço', 'endereco', 'fica', 'benfica'],
    keywords_en: ['location', 'address', 'where'],
    answer_pt: 'Estamos localizados em Benfica, Lisboa.',
    answer_en: 'We are located in Benfica, Lisbon.'
  },
  {
    id: 'contact',
    keywords_pt: ['contacto', 'contactar', 'telefone', 'whatsapp', 'instagram', 'insta', 'falar convosco', 'email'],
    keywords_en: ['contact', 'phone', 'whatsapp', 'instagram', 'reach you'],
    answer_pt: 'A forma mais rápida de nos contactar é pelo Instagram: @katiaarnaut_esteticalisboa — clique no ícone do Instagram no canto do site.',
    answer_en: 'The fastest way to reach us is via Instagram: @katiaarnaut_esteticalisboa — click the Instagram icon in the corner of the site.'
  },
  {
    id: 'team',
    keywords_pt: ['equipa', 'quem trabalha', 'esteticista', 'profissional', 'katia'],
    keywords_en: ['team', 'who works', 'aesthetician', 'professional', 'staff'],
    answer_pt: 'A nossa equipa é liderada pela Katia Arnaut, especialista em estética facial, junto com esteticistas certificadas dedicadas a cuidar da sua pele com rigor técnico. Pode conhecê-las na secção "Equipa" do site.',
    answer_en: 'Our team is led by Katia Arnaut, a facial aesthetics specialist, along with certified aestheticians dedicated to caring for your skin with technical rigor. You can meet them in the "Team" section of the site.'
  },
  {
    id: 'gallery',
    keywords_pt: ['galeria', 'fotos', 'imagens', 'espaço', 'estúdio', 'estudio'],
    keywords_en: ['gallery', 'photos', 'pictures', 'space', 'studio'],
    answer_pt: 'Pode ver fotos do nosso espaço e do nosso trabalho na secção "Galeria" do site — clique numa imagem para a ver ampliada.',
    answer_en: 'You can see photos of our space and our work in the "Gallery" section of the site — click an image to view it enlarged.'
  },
  {
    id: 'suggestions',
    keywords_pt: ['sugestão', 'sugestao', 'reclamação', 'reclamacao', 'feedback', 'opinião'],
    keywords_en: ['suggestion', 'complaint', 'feedback', 'opinion'],
    answer_pt: 'Adoramos ouvir a sua opinião! Pode enviar uma sugestão na página "Sugestões", acessível no menu depois de iniciar sessão. A equipa responde diretamente ali.',
    answer_en: 'We\'d love to hear your feedback! You can send a suggestion on the "Suggestions" page, available in the menu once logged in. Our team replies directly there.'
  },
  {
    id: 'what_is',
    keywords_pt: ['o que é estética facial', 'o que fazem', 'que serviços', 'que tratamentos', 'o que oferecem'],
    keywords_en: ['what is facial aesthetics', 'what do you do', 'what services', 'what treatments', 'what do you offer'],
    answer_pt: 'Somos um estúdio especializado em estética facial: limpeza de pele, tratamento de acne, peelings, microagulhamento, hidratação profunda e radiofrequência. Veja todos os detalhes na secção "Tratamentos".',
    answer_en: 'We are a studio specialized in facial aesthetics: skin cleansing, acne treatment, peels, microneedling, deep hydration, and radiofrequency. See all the details in the "Treatments" section.'
  },
  {
    id: 'greeting',
    keywords_pt: ['ola', 'olá', 'boa tarde', 'bom dia', 'boa noite', 'oi'],
    keywords_en: ['hello', ' hi ', 'good morning', 'good afternoon', 'good evening', 'hey'],
    answer_pt: 'Olá! É um prazer receber a sua mensagem. Posso ajudar com informações sobre tratamentos, marcações, preços ou horários — o que gostaria de saber?',
    answer_en: 'Hello! Great to hear from you. I can help with information about treatments, bookings, prices or hours — what would you like to know?'
  },
  {
    id: 'thanks',
    keywords_pt: ['obrigado', 'obrigada', 'muito obrigado', 'agradeço'],
    keywords_en: ['thank you', 'thanks', 'thank u'],
    answer_pt: 'Com todo o gosto! Se precisar de mais alguma coisa, estou aqui.',
    answer_en: 'My pleasure! If you need anything else, I\'m here.'
  },
  {
    id: 'pain',
    keywords_pt: ['dói', 'doi', 'dor', 'incomoda', 'é doloroso', 'magoa'],
    keywords_en: ['does it hurt', 'painful', 'pain', 'hurt'],
    answer_pt: 'A maioria dos nossos tratamentos é indolor ou apenas ligeiramente desconfortável — a equipa adapta sempre a intensidade ao seu conforto. Pode falar sobre isso na avaliação inicial.',
    answer_en: 'Most of our treatments are painless or only mildly uncomfortable — our team always adapts the intensity to your comfort. You can discuss this during your initial assessment.'
  },
  {
    id: 'downtime',
    keywords_pt: ['tempo de recuperação', 'fico marcada', 'vermelhidão', 'posso trabalhar depois', 'posso sair depois', 'efeitos secundários'],
    keywords_en: ['downtime', 'recovery time', 'redness', 'can i go to work after', 'side effects'],
    answer_pt: 'Depende do tratamento — a maioria não tem tempo de recuperação, podendo retomar a rotina normal de imediato. Tratamentos mais intensivos podem causar uma ligeira vermelhidão temporária, explicada em detalhe na consulta.',
    answer_en: 'It depends on the treatment — most have no downtime, so you can resume your normal routine right away. More intensive treatments may cause slight temporary redness, which we\'ll explain in detail during your consultation.'
  },
  {
    id: 'age',
    keywords_pt: ['idade mínima', 'idade minima', 'a partir de que idade', 'menores', 'adolescente'],
    keywords_en: ['minimum age', 'how old', 'teenagers', 'minors'],
    answer_pt: 'A maioria dos nossos tratamentos é indicada a partir dos 16 anos, com consentimento de um responsável para menores. Para acne em adolescentes, temos protocolos específicos e mais suaves.',
    answer_en: 'Most of our treatments are suitable from age 16, with a guardian\'s consent for minors. For teenage acne, we have specific, gentler protocols.'
  },
  {
    id: 'men',
    keywords_pt: ['homens', 'homem', 'masculino', 'também para homens'],
    keywords_en: ['men', 'male', 'for men too'],
    answer_pt: 'Sim, os nossos tratamentos são para todos — homens e mulheres. A pele masculina também beneficia muito de limpezas, tratamento de acne e hidratação.',
    answer_en: 'Yes, our treatments are for everyone — men and women. Men\'s skin also benefits greatly from cleansing, acne treatment and hydration.'
  },
  {
    id: 'payment',
    keywords_pt: ['pagamento', 'pagar', 'multibanco', 'dinheiro', 'cartão', 'mbway', 'formas de pagamento'],
    keywords_en: ['payment', 'pay', 'card', 'cash', 'payment methods'],
    answer_pt: 'Aceitamos as formas de pagamento habituais no estúdio — pode confirmar os detalhes diretamente com a equipa pelo Instagram antes da sua consulta.',
    answer_en: 'We accept the usual payment methods at the studio — you can confirm the details directly with our team via Instagram before your appointment.'
  },
  {
    id: 'parking',
    keywords_pt: ['estacionamento', 'parque', 'onde estacionar', 'acesso', 'transportes', 'metro'],
    keywords_en: ['parking', 'where to park', 'access', 'public transport', 'metro'],
    answer_pt: 'Estamos em Benfica, Lisboa, uma zona com boa rede de transportes e opções de estacionamento na via pública nas imediações.',
    answer_en: 'We are in Benfica, Lisbon, an area with good public transport and street parking options nearby.'
  },
  {
    id: 'gift',
    keywords_pt: ['presente', 'oferta', 'vale de oferta', 'cartão presente', 'prenda'],
    keywords_en: ['gift', 'gift card', 'voucher', 'present'],
    answer_pt: 'Ainda não temos vales de oferta disponíveis diretamente no site, mas pode perguntar à equipa pelo Instagram sobre esta possibilidade.',
    answer_en: 'We don\'t yet offer gift vouchers directly through the site, but you can ask our team via Instagram about this option.'
  },
  {
    id: 'late',
    keywords_pt: ['atraso', 'atrasar', 'atrasada', 'atrasado', 'vou chegar atrasada', 'chegar mais tarde'],
    keywords_en: ['late', 'running late', 'arrive later'],
    answer_pt: 'Se souber que vai chegar atrasada, avise-nos com antecedência pelo Instagram para ajustarmos o horário sempre que possível.',
    answer_en: 'If you know you\'ll be running late, please let us know in advance via Instagram so we can adjust the schedule whenever possible.'
  },
  {
    id: 'since_when',
    keywords_pt: ['desde quando', 'há quanto tempo existem', 'quando abriram', 'fundada em', 'fundado em'],
    keywords_en: ['since when', 'how long have you', 'when did you open', 'founded in'],
    answer_pt: 'A Katia Arnaut Estética está a cuidar de peles desde 2016, sempre em Benfica, Lisboa.',
    answer_en: 'Katia Arnaut Estética has been caring for skin since 2016, always in Benfica, Lisbon.'
  },
  {
    id: 'products',
    keywords_pt: ['produtos', 'marcas', 'que produtos usam', 'produtos naturais', 'produtos orgânicos', 'cruelty free'],
    keywords_en: ['products', 'brands', 'what products do you use', 'natural products', 'organic', 'cruelty free'],
    answer_pt: 'Trabalhamos com produtos profissionais de estética facial, selecionados pela qualidade e segurança para a pele. Pode perguntar à equipa sobre marcas específicas pelo Instagram.',
    answer_en: 'We work with professional facial aesthetics products, chosen for quality and skin safety. You can ask our team about specific brands via Instagram.'
  },
  {
    id: 'body_treatments',
    keywords_pt: ['tratamento corporal', 'corpo', 'massagem corporal', 'fazem corpo'],
    keywords_en: ['body treatment', 'body massage', 'do you do body'],
    answer_pt: 'Somos especializados em estética facial — neste momento não temos tratamentos corporais no nosso catálogo.',
    answer_en: 'We specialize in facial aesthetics — at the moment we don\'t offer body treatments in our catalog.'
  },
  {
    id: 'makeup_lashes',
    keywords_pt: ['maquilhagem', 'sobrancelhas', 'pestanas', 'design de sobrancelhas', 'micropigmentação'],
    keywords_en: ['makeup', 'eyebrows', 'lashes', 'eyebrow design', 'micropigmentation'],
    answer_pt: 'O nosso foco é estética facial (limpeza, acne, peelings, etc.) — não fazemos maquilhagem, sobrancelhas ou pestanas neste momento.',
    answer_en: 'Our focus is facial aesthetics (cleansing, acne, peels, etc.) — we don\'t currently do makeup, eyebrows or lashes.'
  },
  {
    id: 'online_consult',
    keywords_pt: ['consulta online', 'à distância', 'video chamada', 'videochamada'],
    keywords_en: ['online consultation', 'remote consultation', 'video call'],
    answer_pt: 'As nossas consultas são sempre presenciais no estúdio em Benfica, para uma avaliação mais precisa da sua pele.',
    answer_en: 'Our consultations are always in person at the studio in Benfica, for a more accurate assessment of your skin.'
  },
  {
    id: 'loyalty',
    keywords_pt: ['fidelização', 'desconto', 'promoção', 'cartão de cliente', 'pacote de sessões'],
    keywords_en: ['loyalty', 'discount', 'promotion', 'package deal', 'membership'],
    answer_pt: 'Para saber sobre promoções ou pacotes de sessões atuais, a melhor forma é perguntar diretamente à equipa pelo Instagram.',
    answer_en: 'To find out about current promotions or session packages, the best way is to ask our team directly via Instagram.'
  },
  {
    id: 'forgot_password',
    keywords_pt: ['esqueci a palavra-passe', 'recuperar palavra-passe', 'não consigo entrar', 'esqueci a senha'],
    keywords_en: ['forgot password', 'reset password', 'can\'t log in', 'cannot log in'],
    answer_pt: 'De momento não temos recuperação automática de palavra-passe no site — contacte-nos pelo Instagram e ajudamos a resolver.',
    answer_en: 'We don\'t yet have automatic password recovery on the site — contact us via Instagram and we\'ll help sort it out.'
  },
  {
    id: 'change_language',
    keywords_pt: ['mudar idioma', 'mudar de idioma', 'mudar o idioma', 'como mudo o idioma', 'idioma do site', 'trocar idioma', 'trocar para inglês', 'site em inglês'],
    keywords_en: ['change language', 'switch language', 'site in portuguese', 'switch to english'],
    answer_pt: 'Pode alternar entre Português e Inglês a qualquer momento, clicando em "PT" ou "EN" no topo do site.',
    answer_en: 'You can switch between Portuguese and English at any time by clicking "PT" or "EN" at the top of the site.'
  },
  {
    id: 'what_site_does',
    keywords_pt: ['o que é este site', 'para que serve o site', 'como funciona o site'],
    keywords_en: ['what is this site', 'what does this site do', 'how does the site work'],
    answer_pt: 'Este site permite-lhe conhecer os nossos tratamentos, ver a equipa e o espaço, marcar consultas online, acompanhar as suas marcações e enviar-nos sugestões — tudo numa conta pessoal gratuita.',
    answer_en: 'This site lets you explore our treatments, meet the team and space, book appointments online, track your bookings and send us suggestions — all through a free personal account.'
  },
  {
    id: 'human_contact',
    keywords_pt: ['falar com uma pessoa', 'falar com a katia', 'atendimento humano', 'quero falar com alguém'],
    keywords_en: ['talk to a person', 'speak to katia', 'human support', 'talk to someone'],
    answer_pt: 'Claro! A forma mais direta de falar com a equipa é pelo Instagram @katiaarnaut_esteticalisboa.',
    answer_en: 'Of course! The most direct way to talk to the team is via Instagram @katiaarnaut_esteticalisboa.'
  }
];

function detectLanguage(message) {
  const lower = normalizeForMatch(message);
  // Larger word banks with word-boundary-ish spacing for better accuracy
  const ptSignals = [
    ' o ', ' a ', ' os ', ' as ', ' um ', ' uma ', ' para ', ' com ', ' sem ', ' não ', ' sim ',
    ' que ', ' qual ', ' quais ', ' quanto ', ' quanto custa', ' quando ', ' onde ', ' como ',
    ' voces ', ' vocês ', ' está ', ' estão ', ' estou ', ' tem ', ' tenho ', ' preciso ', ' quero ', ' gostaria ',
    ' obrigad', ' bom dia', ' boa tarde', ' boa noite', ' olá', ' ola ', ' por favor', ' pode ',
    ' vai ', ' fazer ', ' fica ', ' é ', ' são ', ' das ', ' dos ', ' na ', ' no ', ' pelo ', ' pela ',
    ' isso ', ' aqui ', ' agora ', ' hoje ', ' amanhã ', ' amanha ', ' obrigado', ' minha ', ' meu ',
    'ção', 'ções', 'ão ', 'inho', 'ç'
  ];
  const enSignals = [
    ' the ', ' is ', ' are ', ' you ', ' your ', ' do ', ' does ', ' can ', ' i ', ' my ', ' what ',
    ' where ', ' when ', ' how ', ' how much', ' how many', ' please', ' thanks', ' thank you',
    ' hello', ' hi ', ' hey ', ' need ', ' want ', ' would ', ' book ', ' booking ', ' price ',
    ' cost ', ' open ', ' close ', ' with ', ' for ', ' and ', ' or ', ' have ', ' has ', ' will ',
    ' this ', ' that ', ' about ', ' treatment', ' appointment'
  ];
  let ptScore = 0, enScore = 0;
  ptSignals.forEach(s => { if (lower.includes(s)) ptScore++; });
  enSignals.forEach(s => { if (lower.includes(s)) enScore++; });
  // Strong accent/character signal — if present, it's almost certainly Portuguese
  if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(message)) ptScore += 3;
  if (ptScore === 0 && enScore === 0) return null; // ambiguous — let caller decide fallback
  return enScore > ptScore ? 'en' : 'pt';
}

function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Normalizes text for matching: strips accents, lowercases, and replaces punctuation
// with spaces so "Hi!" / "obrigada!" / "preço?" match the same as their plain forms.
function normalizeForMatch(str) {
  return ' ' + stripAccents(str.toLowerCase()).replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
}

// Score-based matching: weights longer/more specific phrases higher than short generic words,
// is accent/punctuation-insensitive, and requires whole-word boundaries so short keywords
// (e.g. "late") don't false-match inside unrelated words (e.g. "unrelated").
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findBestMatch(message) {
  const lower = normalizeForMatch(message).trim();
  let best = null;
  let bestScore = 0;
  for (const item of faqData) {
    const allKeywords = [...item.keywords_pt, ...item.keywords_en];
    let score = 0;
    allKeywords.forEach(k => {
      const nk = normalizeForMatch(k).trim();
      if (!nk) return;
      const re = new RegExp('(^|\\s)' + escapeRegex(nk) + '(\\s|$)');
      if (re.test(lower)) score += nk.length;
    });
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

router.post('/api/chatbot', async (req, res) => {
  const { message, lang: siteLang } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem inválida' });
  }
  // Priority: detect the language the person actually typed in.
  // Only fall back to the site's PT/EN toggle when the message is too short/ambiguous to tell.
  const detectedFromMessage = detectLanguage(message);
  const detectedLang = detectedFromMessage || siteLang || 'pt';
  const match = findBestMatch(message);

  let reply;
  if (match) {
    reply = detectedLang === 'en' ? match.answer_en : match.answer_pt;
  } else {
    reply = detectedLang === 'en'
      ? 'I\'m not sure about that yet, but you can reach us directly on Instagram @katiaarnaut_esteticalisboa for a precise answer. You can also ask me about treatments, prices, hours, booking, location or the team.'
      : 'Ainda não tenho essa resposta, mas pode contactar-nos diretamente pelo Instagram @katiaarnaut_esteticalisboa para uma resposta precisa. Também pode perguntar-me sobre tratamentos, preços, horários, marcações, localização ou a equipa.';
  }

  res.json({ reply, lang: detectedLang });
});

module.exports = router;
