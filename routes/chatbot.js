const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Simple keyword-based bilingual FAQ chatbot with language auto-detection
const faqData = [
  {
    keywords_pt: ['horario', 'horário', 'aberto', 'abre', 'fecha', 'funciona'],
    keywords_en: ['hours', 'open', 'close', 'schedule', 'time'],
    answer_pt: 'Estamos abertos de Segunda a Sexta das 9h30 às 19h00, e Sábado das 10h00 às 15h00. Encerrado ao Domingo.',
    answer_en: 'We are open Monday to Friday from 9:30 AM to 7:00 PM, and Saturday from 10:00 AM to 3:00 PM. Closed on Sunday.'
  },
  {
    keywords_pt: ['marcar', 'marcação', 'agendar', 'consulta', 'reservar'],
    keywords_en: ['book', 'booking', 'appointment', 'schedule', 'reserve'],
    answer_pt: 'Pode marcar a sua consulta diretamente no site na secção "Marcar Consulta", depois de criar uma conta. Também pode contactar-nos pelo Instagram @katiaarnaut_esteticalisboa.',
    answer_en: 'You can book your appointment directly on the site in the "Book Appointment" section, after creating an account. You can also contact us via Instagram @katiaarnaut_esteticalisboa.'
  },
  {
    keywords_pt: ['preço', 'preco', 'custa', 'valor', 'quanto'],
    keywords_en: ['price', 'cost', 'how much', 'value'],
    answer_pt: 'Os preços variam consoante o tratamento. Pode consultar todos os valores na secção "Tratamentos" do site.',
    answer_en: 'Prices vary by treatment. You can check all values in the "Treatments" section of the site.'
  },
  {
    keywords_pt: ['acne', 'espinha', 'borbulha'],
    keywords_en: ['acne', 'pimple', 'breakout'],
    answer_pt: 'Temos um protocolo específico de Tratamento de Acne, direcionado para peles com acne ativa. Pode marcar consulta para uma avaliação personalizada.',
    answer_en: 'We have a specific Acne Treatment protocol, targeted for active acne skin. You can book a consultation for a personalized assessment.'
  },
  {
    keywords_pt: ['limpeza', 'limpar'],
    keywords_en: ['cleansing', 'clean', 'cleanse'],
    answer_pt: 'A Limpeza de Pele Profunda é um dos nossos tratamentos mais procurados — inclui higienização, extração e hidratação.',
    answer_en: 'Deep Facial Cleansing is one of our most popular treatments — includes cleansing, extraction and hydration.'
  },
  {
    keywords_pt: ['localização', 'localizacao', 'morada', 'onde', 'endereço', 'endereco', 'fica'],
    keywords_en: ['location', 'address', 'where'],
    answer_pt: 'Estamos localizados em Benfica, Lisboa.',
    answer_en: 'We are located in Benfica, Lisbon.'
  },
  {
    keywords_pt: ['contacto', 'contactar', 'telefone', 'whatsapp', 'instagram', 'insta'],
    keywords_en: ['contact', 'phone', 'whatsapp', 'instagram'],
    answer_pt: 'Pode contactar-nos pelo Instagram: @katiaarnaut_esteticalisboa.',
    answer_en: 'You can contact us via Instagram: @katiaarnaut_esteticalisboa.'
  },
  {
    keywords_pt: ['equipa', 'quem', 'esteticista', 'profissional'],
    keywords_en: ['team', 'who', 'aesthetician', 'professional'],
    answer_pt: 'A nossa equipa é composta pela Katia Arnaut e esteticistas certificadas, dedicadas a cuidar da sua pele com rigor técnico.',
    answer_en: 'Our team is made up of Katia Arnaut and certified aestheticians, dedicated to caring for your skin with technical rigor.'
  },
];

function detectLanguage(message) {
  const lower = message.toLowerCase();
  const ptSignals = ['ó', 'ã', 'ç', 'á', 'é', 'í', 'ú', 'como', 'quanto', 'onde', 'você', 'olá', 'obrigad'];
  const enSignals = ['the', 'how', 'what', 'where', 'hello', 'hi ', 'thanks', 'please'];
  let ptScore = 0, enScore = 0;
  ptSignals.forEach(s => { if (lower.includes(s)) ptScore++; });
  enSignals.forEach(s => { if (lower.includes(s)) enScore++; });
  return enScore > ptScore ? 'en' : 'pt';
}

router.post('/api/chatbot', async (req, res) => {
  const { message, lang: preferredLang } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem inválida' });
  }
  const detectedLang = preferredLang || detectLanguage(message);
  const lower = message.toLowerCase();

  let match = null;
  for (const item of faqData) {
    const keywords = detectedLang === 'en' ? item.keywords_en : item.keywords_pt;
    const allKeywords = [...item.keywords_pt, ...item.keywords_en];
    if (allKeywords.some(k => lower.includes(k))) {
      match = item;
      break;
    }
  }

  let reply;
  if (match) {
    reply = detectedLang === 'en' ? match.answer_en : match.answer_pt;
  } else {
    reply = detectedLang === 'en'
      ? 'I\'m not sure about that yet, but you can reach us directly on Instagram @katiaarnaut_esteticalisboa for a precise answer.'
      : 'Ainda não tenho essa resposta, mas pode contactar-nos diretamente pelo Instagram @katiaarnaut_esteticalisboa para uma resposta precisa.';
  }

  res.json({ reply, lang: detectedLang });
});

router.post('/sugestoes', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { message } = req.body;
  try {
    await pool.query('INSERT INTO suggestions (user_id, message) VALUES ($1, $2)', [req.session.userId, message]);
    res.redirect('back');
  } catch (err) {
    console.error('Erro ao enviar sugestão:', err);
    res.redirect('back');
  }
});

module.exports = router;
