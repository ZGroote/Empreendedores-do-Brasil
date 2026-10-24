const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');
const seedDatabase = require('./seed');
const { compressMedia, VIDEO_EXTS } = require('./compress');

// Garante que o banco tem os dados iniciais caso ainda não existam
seedDatabase();

const app = express();
const PORT = process.env.PORT || 5000;
// Segredo do JWT: variável de ambiente ou um segredo aleatório gerado uma vez e salvo localmente
// (um segredo fixo no código público permitiria forjar login de qualquer membro)
const SECRET_FILE = path.join(__dirname, '.jwt_secret');
if (!process.env.JWT_SECRET && !fs.existsSync(SECRET_FILE)) {
  fs.writeFileSync(SECRET_FILE, require('crypto').randomBytes(48).toString('hex'));
}
const JWT_SECRET = process.env.JWT_SECRET || fs.readFileSync(SECRET_FILE, 'utf8').trim();

// Só aceita links http(s) — bloqueia "javascript:" e afins em hrefs renderizados no front
function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

// Diretório para armazenamento de uploads (PDFs, vídeos, minutas)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuração do Multer para uploads com nomes seguros
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'material-' + uniqueSuffix + ext);
  }
});

// Extensões permitidas: impede upload de .html/.svg/.js servidos no mesmo domínio (XSS)
const ALLOWED_UPLOAD_EXTS = ['.pdf', ...VIDEO_EXTS, '.doc', '.docx', '.txt', '.rtf',
  '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.zip'];

function extFilter(allowed) {
  return (req, file, cb) => {
    const ok = allowed.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Tipo de arquivo não permitido'), ok);
  };
}

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Até 50MB
  fileFilter: extFilter(ALLOWED_UPLOAD_EXTS)
});

// Aulas aceitam só vídeo, e maiores (são comprimidos depois)
const uploadVideo = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // Até 1GB
  fileFilter: extFilter(VIDEO_EXTS)
});

// Comprime em segundo plano e devolve a URL pública e o tamanho final
async function compressUpload(filename) {
  const result = await compressMedia(path.join(UPLOADS_DIR, filename));
  return { url: '/uploads/' + path.basename(result.filePath), size: result.size };
}

app.use(cors());
app.use(express.json());
// Servir uploads de forma estática
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

// Middleware de Autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = decoded;
    next();
  });
}

// Middleware opcional de autenticação (para saber se o visitante está logado)
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    req.user = err ? null : decoded;
    next();
  });
}

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO E PERFIL
// ==========================================

// Cadastro de novo membro
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, company, role, bio, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a,1e293b`;

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, company, role, avatar, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      company || 'Empresa Própria',
      role || 'Fundador(a)',
      defaultAvatar,
      bio || 'Membro do grupo Empreendedores do Brasil.'
    );

    const userId = Number(result.lastInsertRowid);
    const user = db.prepare('SELECT id, name, email, company, role, avatar, bio, created_at FROM users WHERE id = ?').get(userId);

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      created_at: user.created_at
    };

    res.json({ user: safeUser, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login' });
  }
});

// Dados do usuário atual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, company, role, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
  }
});

// Listagem de Membros da Comunidade
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.company, u.role, u.avatar, u.bio, u.created_at,
        (SELECT COUNT(*) FROM ideas WHERE author_id = u.id) as ideas_count,
        (SELECT COUNT(*) FROM event_attendees WHERE user_id = u.id) as events_attended_count
      FROM users u
      ORDER BY u.id ASC
    `).all();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar membros' });
  }
});

// ==========================================
// 2. ROTAS DO BANCO DE IDEIAS E COMENTÁRIOS
// ==========================================

// Listar ideias (com busca, filtros por tags e ordenação)
app.get('/api/ideas', optionalAuthenticate, (req, res) => {
  try {
    const { tag, search, sort } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        i.id, i.title, i.description, i.tags, i.category, i.status, i.created_at,
        u.id as author_id, u.name as author_name, u.company as author_company, u.role as author_role, u.avatar as author_avatar,
        (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) as votes_count,
        (SELECT COUNT(*) FROM comments WHERE idea_id = i.id) as comments_count
        ${currentUserId ? `, (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND user_id = ${currentUserId}) as has_voted` : ', 0 as has_voted'}
      FROM ideas i
      JOIN users u ON i.author_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      query += ` AND i.tags LIKE ?`;
      params.push(`%${tag}%`);
    }

    if (sort === 'popular') {
      query += ` ORDER BY votes_count DESC, i.id DESC`;
    } else if (sort === 'discussed') {
      query += ` ORDER BY comments_count DESC, i.id DESC`;
    } else {
      query += ` ORDER BY i.created_at DESC`;
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    const ideas = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      category: row.category,
      status: row.status,
      created_at: row.created_at,
      votes_count: Number(row.votes_count),
      comments_count: Number(row.comments_count),
      has_voted: Boolean(row.has_voted),
      author: {
        id: row.author_id,
        name: row.author_name,
        company: row.author_company,
        role: row.author_role,
        avatar: row.author_avatar
      }
    }));

    res.json(ideas);
  } catch (error) {
    console.error('Erro ao listar ideias:', error);
    res.status(500).json({ error: 'Erro ao buscar ideias' });
  }
});

// Detalhes de uma ideia específica com comentários
app.get('/api/ideas/:id', optionalAuthenticate, (req, res) => {
  try {
    const ideaId = Number(req.params.id);
    const currentUserId = req.user ? req.user.id : null;

    const row = db.prepare(`
      SELECT 
        i.id, i.title, i.description, i.tags, i.category, i.status, i.created_at,
        u.id as author_id, u.name as author_name, u.company as author_company, u.role as author_role, u.avatar as author_avatar,
        (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) as votes_count,
        (SELECT COUNT(*) FROM comments WHERE idea_id = i.id) as comments_count
        ${currentUserId ? `, (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND user_id = ${currentUserId}) as has_voted` : ', 0 as has_voted'}
      FROM ideas i
      JOIN users u ON i.author_id = u.id
      WHERE i.id = ?
    `).get(ideaId);

    if (!row) {
      return res.status(404).json({ error: 'Ideia não encontrada' });
    }

    // Comentários da ideia
    const commentsRows = db.prepare(`
      SELECT 
        c.id, c.content, c.created_at,
        u.id as user_id, u.name as user_name, u.company as user_company, u.role as user_role, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.idea_id = ?
      ORDER BY c.created_at ASC
    `).all(ideaId);

    const comments = commentsRows.map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user: {
        id: c.user_id,
        name: c.user_name,
        company: c.user_company,
        role: c.user_role,
        avatar: c.user_avatar
      }
    }));

    const idea = {
      id: row.id,
      title: row.title,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      category: row.category,
      status: row.status,
      created_at: row.created_at,
      votes_count: Number(row.votes_count),
      comments_count: Number(row.comments_count),
      has_voted: Boolean(row.has_voted),
      author: {
        id: row.author_id,
        name: row.author_name,
        company: row.author_company,
        role: row.author_role,
        avatar: row.author_avatar
      },
      comments
    };

    res.json(idea);
  } catch (error) {
    console.error('Erro ao buscar detalhes da ideia:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da ideia' });
  }
});

// Cadastrar nova ideia
app.post('/api/ideas', authenticateToken, (req, res) => {
  try {
    const { title, description, tags, category, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição da ideia são obrigatórios' });
    }

    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);

    const insert = db.prepare(`
      INSERT INTO ideas (title, description, tags, category, status, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      description.trim(),
      JSON.stringify(tagsArray),
      category || 'Geral',
      status || 'Em Discussão',
      req.user.id
    );

    const ideaId = Number(result.lastInsertRowid);
    const newIdea = db.prepare(`
      SELECT 
        i.id, i.title, i.description, i.tags, i.category, i.status, i.created_at,
        u.id as author_id, u.name as author_name, u.company as author_company, u.role as author_role, u.avatar as author_avatar
      FROM ideas i
      JOIN users u ON i.author_id = u.id
      WHERE i.id = ?
    `).get(ideaId);

    res.status(201).json({
      id: newIdea.id,
      title: newIdea.title,
      description: newIdea.description,
      tags: JSON.parse(newIdea.tags || '[]'),
      category: newIdea.category,
      status: newIdea.status,
      created_at: newIdea.created_at,
      votes_count: 0,
      comments_count: 0,
      has_voted: false,
      author: {
        id: newIdea.author_id,
        name: newIdea.author_name,
        company: newIdea.author_company,
        role: newIdea.author_role,
        avatar: newIdea.author_avatar
      }
    });
  } catch (error) {
    console.error('Erro ao criar ideia:', error);
    res.status(500).json({ error: 'Erro ao cadastrar ideia' });
  }
});

// Votar / retirar voto em ideia
app.post('/api/ideas/:id/vote', authenticateToken, (req, res) => {
  try {
    const ideaId = Number(req.params.id);
    const userId = req.user.id;

    const existingVote = db.prepare('SELECT id FROM idea_votes WHERE idea_id = ? AND user_id = ?').get(ideaId, userId);

    if (existingVote) {
      // Retira voto
      db.prepare('DELETE FROM idea_votes WHERE id = ?').run(existingVote.id);
    } else {
      // Adiciona voto
      db.prepare('INSERT INTO idea_votes (idea_id, user_id) VALUES (?, ?)').run(ideaId, userId);
    }

    const voteCount = db.prepare('SELECT COUNT(*) as count FROM idea_votes WHERE idea_id = ?').get(ideaId).count;

    res.json({
      has_voted: !existingVote,
      votes_count: Number(voteCount)
    });
  } catch (error) {
    console.error('Erro ao votar na ideia:', error);
    res.status(500).json({ error: 'Erro ao processar voto' });
  }
});

// Adicionar comentário na ideia
app.post('/api/ideas/:id/comments', authenticateToken, (req, res) => {
  try {
    const ideaId = Number(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'O comentário não pode ser vazio' });
    }

    const insert = db.prepare(`
      INSERT INTO comments (idea_id, user_id, content)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(ideaId, req.user.id, content.trim());
    const commentId = Number(result.lastInsertRowid);

    const comment = db.prepare(`
      SELECT 
        c.id, c.content, c.created_at,
        u.id as user_id, u.name as user_name, u.company as user_company, u.role as user_role, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(commentId);

    res.status(201).json({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        id: comment.user_id,
        name: comment.user_name,
        company: comment.user_company,
        role: comment.user_role,
        avatar: comment.user_avatar
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao enviar comentário' });
  }
});

// ==========================================
// 3. ROTAS DE REUNIÕES E PALESTRAS INTERNAS
// ==========================================

// Listar eventos (reuniões e palestras)
app.get('/api/events', optionalAuthenticate, (req, res) => {
  try {
    const { type } = req.query; // 'all', 'meeting', 'talk'
    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        e.*,
        creator.name as creator_name, creator.company as creator_company, creator.avatar as creator_avatar,
        speaker.name as speaker_user_name, speaker.company as speaker_user_company, speaker.avatar as speaker_user_avatar,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendees_count
        ${currentUserId ? `, (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND user_id = ${currentUserId}) as has_rsvp` : ', 0 as has_rsvp'}
      FROM events e
      JOIN users creator ON e.created_by = creator.id
      LEFT JOIN users speaker ON e.speaker_id = speaker.id
      WHERE 1=1
    `;

    const params = [];
    if (type && type !== 'all') {
      query += ` AND e.type = ?`;
      params.push(type);
    }

    query += ` ORDER BY e.date_time ASC`;

    const rows = db.prepare(query).all(...params);

    const events = rows.map(r => {
      // Buscar lista de participantes confirmados
      const attendees = db.prepare(`
        SELECT u.id, u.name, u.avatar, u.company, u.role
        FROM event_attendees ea
        JOIN users u ON ea.user_id = u.id
        WHERE ea.event_id = ?
        LIMIT 8
      `).all(r.id);

      return {
        id: r.id,
        title: r.title,
        type: r.type,
        description: r.description,
        date_time: r.date_time,
        duration_minutes: r.duration_minutes,
        location_type: r.location_type,
        meeting_link: r.meeting_link,
        speaker: {
          id: r.speaker_id,
          name: r.speaker_user_name || r.speaker_name,
          company: r.speaker_user_company,
          avatar: r.speaker_user_avatar,
          topic: r.speaker_topic
        },
        creator: {
          id: r.created_by,
          name: r.creator_name,
          company: r.creator_company,
          avatar: r.creator_avatar
        },
        attendees_count: Number(r.attendees_count),
        attendees,
        has_rsvp: Boolean(r.has_rsvp)
      };
    });

    res.json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

// Agendar nova Reunião ou Palestra Interna
app.post('/api/events', authenticateToken, (req, res) => {
  try {
    const {
      title,
      type, // 'meeting' ou 'talk'
      description,
      date_time,
      duration_minutes,
      location_type,
      meeting_link,
      speaker_id,
      speaker_name,
      speaker_topic
    } = req.body;

    if (!title || !type || !date_time) {
      return res.status(400).json({ error: 'Título, tipo de evento e data/hora são obrigatórios' });
    }

    if (!['meeting', 'talk'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de evento inválido. Use "meeting" ou "talk"' });
    }

    if (meeting_link && !isHttpUrl(meeting_link)) {
      return res.status(400).json({ error: 'O link da sala deve começar com http:// ou https://' });
    }

    const insert = db.prepare(`
      INSERT INTO events (
        title, type, description, date_time, duration_minutes,
        location_type, meeting_link, speaker_id, speaker_name, speaker_topic, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      type,
      description ? description.trim() : '',
      date_time,
      duration_minutes ? Number(duration_minutes) : 60,
      location_type || 'online',
      meeting_link ? meeting_link.trim() : '',
      speaker_id ? Number(speaker_id) : (type === 'talk' ? req.user.id : null),
      speaker_name || null,
      speaker_topic || null,
      req.user.id
    );

    const eventId = Number(result.lastInsertRowid);

    // O criador é automaticamente adicionado como participante confirmado
    db.prepare(`
      INSERT OR IGNORE INTO event_attendees (event_id, user_id, status)
      VALUES (?, ?, 'confirmed')
    `).run(eventId, req.user.id);

    res.status(201).json({ message: 'Evento agendado com sucesso', eventId });
  } catch (error) {
    console.error('Erro ao agendar evento:', error);
    res.status(500).json({ error: 'Erro ao agendar reunião ou palestra' });
  }
});

// Confirmar presença / Cancelar presença no evento (RSVP)
app.post('/api/events/:id/rsvp', authenticateToken, (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?').get(eventId, userId);

    if (existing) {
      db.prepare('DELETE FROM event_attendees WHERE id = ?').run(existing.id);
    } else {
      db.prepare(`
        INSERT INTO event_attendees (event_id, user_id, status)
        VALUES (?, ?, 'confirmed')
      `).run(eventId, userId);
    }

    const attendeesCount = db.prepare('SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?').get(eventId).count;
    const attendees = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.company, u.role
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ?
      LIMIT 8
    `).all(eventId);

    res.json({
      has_rsvp: !existing,
      attendees_count: Number(attendeesCount),
      attendees
    });
  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    res.status(500).json({ error: 'Erro ao registrar presença' });
  }
});

// ==========================================
// 4. ESTATÍSTICAS GERAIS DO GRUPO
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const membersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const ideasCount = db.prepare('SELECT COUNT(*) as count FROM ideas').get().count;
    const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const commentsCount = db.prepare('SELECT COUNT(*) as count FROM comments').get().count;
    const booksCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_books').get().count;
    const materialsCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_items').get().count;
    const lessonsCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get().count;

    res.json({
      members: Number(membersCount),
      ideas: Number(ideasCount),
      events: Number(eventsCount),
      comments: Number(commentsCount),
      books: Number(booksCount),
      materials: Number(materialsCount),
      lessons: Number(lessonsCount)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

// ==========================================
// 5. ROTAS DO ACERVO & BIBLIOTECA COLABORATIVA
// ==========================================

// Listar Dossiês / Livros da Biblioteca
app.get('/api/books', optionalAuthenticate, (req, res) => {
  try {
    const { category, search, sort, creator_id } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        b.id, b.title, b.description, b.category, b.tags, b.color_gradient, b.icon, b.is_collaborative, b.created_at,
        u.id as creator_id, u.name as creator_name, u.avatar as creator_avatar, u.company as creator_company, u.role as creator_role,
        (SELECT COUNT(*) FROM knowledge_items WHERE book_id = b.id) as items_count,
        (SELECT COUNT(*) FROM book_messages WHERE book_id = b.id) as messages_count,
        (SELECT COUNT(*) FROM book_likes WHERE book_id = b.id) as likes_count
      FROM knowledge_books b
      JOIN users u ON b.creator_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'Todas') {
      query += ` AND b.category = ?`;
      params.push(category);
    }

    if (creator_id) {
      query += ` AND b.creator_id = ?`;
      params.push(Number(creator_id));
    }

    if (search) {
      query += ` AND (b.title LIKE ? OR b.description LIKE ? OR b.tags LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sort === 'popular') {
      query += ` ORDER BY likes_count DESC, items_count DESC, b.created_at DESC`;
    } else if (sort === 'materials') {
      query += ` ORDER BY items_count DESC, b.created_at DESC`;
    } else {
      query += ` ORDER BY b.created_at DESC`;
    }

    const books = db.prepare(query).all(...params);

    const formattedBooks = books.map(book => {
      let parsedTags = [];
      try {
        parsedTags = typeof book.tags === 'string' ? JSON.parse(book.tags) : book.tags;
      } catch (e) {
        parsedTags = [];
      }

      const hasLiked = currentUserId ? !!db.prepare('SELECT id FROM book_likes WHERE book_id = ? AND user_id = ?').get(book.id, currentUserId) : false;

      // Colaboradores únicos (que subiram materiais neste livro)
      const contributors = db.prepare(`
        SELECT DISTINCT u.id, u.name, u.avatar, u.company
        FROM knowledge_items ki
        JOIN users u ON ki.uploader_id = u.id
        WHERE ki.book_id = ?
        LIMIT 5
      `).all(book.id);

      return {
        ...book,
        tags: parsedTags,
        has_liked: hasLiked,
        contributors
      };
    });

    res.json(formattedBooks);
  } catch (error) {
    console.error('Erro ao listar livros da biblioteca:', error);
    res.status(500).json({ error: 'Erro ao buscar livros do acervo' });
  }
});

// Detalhes completos de um Dossiê / Livro (com itens, mensagens do chat e colaboradores)
app.get('/api/books/:id', optionalAuthenticate, (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const currentUserId = req.user ? req.user.id : null;

    const book = db.prepare(`
      SELECT 
        b.id, b.title, b.description, b.category, b.tags, b.color_gradient, b.icon, b.is_collaborative, b.created_at,
        u.id as creator_id, u.name as creator_name, u.avatar as creator_avatar, u.company as creator_company, u.role as creator_role,
        (SELECT COUNT(*) FROM book_likes WHERE book_id = b.id) as likes_count
      FROM knowledge_books b
      JOIN users u ON b.creator_id = u.id
      WHERE b.id = ?
    `).get(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Dossiê não encontrado' });
    }

    let parsedTags = [];
    try {
      parsedTags = typeof book.tags === 'string' ? JSON.parse(book.tags) : book.tags;
    } catch (e) {
      parsedTags = [];
    }

    const hasLiked = currentUserId ? !!db.prepare('SELECT id FROM book_likes WHERE book_id = ? AND user_id = ?').get(book.id, currentUserId) : false;

    // Itens e Materiais do livro
    const items = db.prepare(`
      SELECT 
        ki.id, ki.title, ki.description, ki.file_type, ki.file_url, ki.original_name,
        ki.file_size_bytes, ki.compressed_size_bytes, ki.external_platform, ki.created_at,
        u.id as uploader_id, u.name as uploader_name, u.avatar as uploader_avatar, u.company as uploader_company
      FROM knowledge_items ki
      JOIN users u ON ki.uploader_id = u.id
      WHERE ki.book_id = ?
      ORDER BY ki.created_at ASC
    `).all(bookId);

    // Mensagens de discussão / chat
    const messages = db.prepare(`
      SELECT 
        bm.id, bm.message, bm.created_at,
        u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.company as user_company
      FROM book_messages bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.book_id = ?
      ORDER BY bm.created_at ASC
    `).all(bookId);

    // Colaboradores únicos
    const contributors = db.prepare(`
      SELECT DISTINCT u.id, u.name, u.avatar, u.company
      FROM knowledge_items ki
      JOIN users u ON ki.uploader_id = u.id
      WHERE ki.book_id = ?
    `).all(bookId);

    res.json({
      ...book,
      tags: parsedTags,
      has_liked: hasLiked,
      items,
      messages,
      contributors
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do livro:', error);
    res.status(500).json({ error: 'Erro ao carregar detalhes do dossiê' });
  }
});

// Criar novo Dossiê / Livro
app.post('/api/books', authenticateToken, (req, res) => {
  try {
    const { title, description, category, tags, color_gradient, icon, is_collaborative } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    const insert = db.prepare(`
      INSERT INTO knowledge_books (title, description, category, tags, color_gradient, icon, is_collaborative, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      description.trim(),
      category || 'Geral',
      tagsJson,
      color_gradient || 'gold',
      icon || 'BookOpen',
      is_collaborative !== undefined ? (is_collaborative ? 1 : 0) : 1,
      req.user.id
    );

    const bookId = Number(result.lastInsertRowid);
    res.status(201).json({ message: 'Dossiê criado com sucesso', bookId });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    res.status(500).json({ error: 'Erro ao criar dossiê' });
  }
});

// Adicionar material / capítulo ao livro (Upload de arquivo ou Link externo com compressão inteligente)
app.post('/api/books/:id/items', authenticateToken, upload.single('file'), (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const book = db.prepare('SELECT id, is_collaborative, creator_id FROM knowledge_books WHERE id = ?').get(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Dossiê não encontrado' });
    }

    if (!book.is_collaborative && book.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Este dossiê não aceita contribuições de outros membros' });
    }

    let { title, description, file_type, file_url, external_platform } = req.body;

    let originalName = '';
    let fileSizeBytes = 0;
    let compressedSizeBytes = 0;

    if (req.file) {
      // Arquivo enviado via upload
      originalName = req.file.originalname;
      fileSizeBytes = req.file.size;
      // Até a compressão terminar o tamanho "compactado" é o original; atualizado logo abaixo
      compressedSizeBytes = fileSizeBytes;
      file_url = `/uploads/${req.file.filename}`;

      const ext = path.extname(originalName).toLowerCase();
      if (!file_type) {
        if (ext === '.pdf') file_type = 'pdf';
        else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) file_type = 'video';
        else if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) file_type = 'doc';
        else file_type = 'doc';
      }
      external_platform = 'upload';
    } else {
      // Link externo ou documento web
      if (!file_url) {
        return res.status(400).json({ error: 'É necessário anexar um arquivo ou informar uma URL' });
      }
      if (!isHttpUrl(file_url)) {
        return res.status(400).json({ error: 'A URL deve começar com http:// ou https://' });
      }
      originalName = title || 'Recurso Web';
      if (!file_type) file_type = 'link';
      external_platform = external_platform || 'web';
    }

    if (!title) {
      title = originalName || 'Material Sem Título';
    }

    const insert = db.prepare(`
      INSERT INTO knowledge_items (
        book_id, title, description, file_type, file_url, original_name,
        file_size_bytes, compressed_size_bytes, external_platform, uploader_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      bookId,
      title.trim(),
      (description || '').trim(),
      file_type,
      file_url,
      originalName,
      fileSizeBytes,
      compressedSizeBytes,
      external_platform || 'web',
      req.user.id
    );

    const itemId = Number(result.lastInsertRowid);
    const newItem = db.prepare(`
      SELECT 
        ki.id, ki.title, ki.description, ki.file_type, ki.file_url, ki.original_name,
        ki.file_size_bytes, ki.compressed_size_bytes, ki.external_platform, ki.created_at,
        u.id as uploader_id, u.name as uploader_name, u.avatar as uploader_avatar, u.company as uploader_company
      FROM knowledge_items ki
      JOIN users u ON ki.uploader_id = u.id
      WHERE ki.id = ?
    `).get(itemId);

    res.status(201).json({ message: 'Material acrescentado ao dossiê com sucesso!', item: newItem });

    if (req.file) {
      compressUpload(req.file.filename).then(({ url, size }) => {
        db.prepare('UPDATE knowledge_items SET file_url = ?, compressed_size_bytes = ? WHERE id = ?').run(url, size, itemId);
      });
    }
  } catch (error) {
    console.error('Erro ao adicionar material:', error);
    res.status(500).json({ error: 'Erro ao anexar material ao dossiê' });
  }
});

// Enviar mensagem no chat / debate do dossiê
app.post('/api/books/:id/messages', authenticateToken, (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'A mensagem não pode estar vazia' });
    }

    const insert = db.prepare(`
      INSERT INTO book_messages (book_id, user_id, message)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(bookId, req.user.id, message.trim());
    const msgId = Number(result.lastInsertRowid);

    const newMsg = db.prepare(`
      SELECT 
        bm.id, bm.message, bm.created_at,
        u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.company as user_company
      FROM book_messages bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.id = ?
    `).get(msgId);

    res.status(201).json({ message: newMsg });
  } catch (error) {
    console.error('Erro ao enviar mensagem no chat:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem no chat do dossiê' });
  }
});

// Curtir / Descurtir Dossiê
app.post('/api/books/:id/like', authenticateToken, (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM book_likes WHERE book_id = ? AND user_id = ?').get(bookId, userId);

    if (existing) {
      db.prepare('DELETE FROM book_likes WHERE id = ?').run(existing.id);
    } else {
      db.prepare('INSERT INTO book_likes (book_id, user_id) VALUES (?, ?)').run(bookId, userId);
    }

    const likesCount = db.prepare('SELECT COUNT(*) as count FROM book_likes WHERE book_id = ?').get(bookId).count;

    res.json({
      has_liked: !existing,
      likes_count: Number(likesCount)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alternar curtida do livro' });
  }
});

// Acervo do Membro (Dossiês criados e Materiais contribuídos pelo usuário)
app.get('/api/users/:id/library', (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Livros criados pelo usuário
    const createdBooks = db.prepare(`
      SELECT 
        b.id, b.title, b.description, b.category, b.tags, b.color_gradient, b.icon, b.created_at,
        (SELECT COUNT(*) FROM knowledge_items WHERE book_id = b.id) as items_count,
        (SELECT COUNT(*) FROM book_likes WHERE book_id = b.id) as likes_count
      FROM knowledge_books b
      WHERE b.creator_id = ?
      ORDER BY b.created_at DESC
    `).all(userId);

    // Materiais enviados pelo usuário (em qualquer livro)
    const contributedItems = db.prepare(`
      SELECT 
        ki.id, ki.title, ki.description, ki.file_type, ki.file_url, ki.original_name,
        ki.file_size_bytes, ki.compressed_size_bytes, ki.created_at,
        b.id as book_id, b.title as book_title, b.category as book_category
      FROM knowledge_items ki
      JOIN knowledge_books b ON ki.book_id = b.id
      WHERE ki.uploader_id = ?
      ORDER BY ki.created_at DESC
    `).all(userId);

    res.json({
      created_books: createdBooks.map(b => ({
        ...b,
        tags: typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags
      })),
      contributed_items: contributedItems
    });
  } catch (error) {
    console.error('Erro ao buscar acervo do usuário:', error);
    res.status(500).json({ error: 'Erro ao carregar acervo do membro' });
  }
});

// ==========================================
// 6. AULAS EM VÍDEO
// ==========================================
app.get('/api/lessons', (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT l.*, u.name as uploader_name, u.avatar as uploader_avatar, u.company as uploader_company
      FROM lessons l
      JOIN users u ON l.uploader_id = u.id
    `;
    const params = [];
    if (category && category !== 'Todas') {
      query += ' WHERE l.category = ?';
      params.push(category);
    }
    query += ' ORDER BY l.created_at DESC';
    res.json(db.prepare(query).all(...params));
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({ error: 'Erro ao carregar aulas' });
  }
});

app.post('/api/lessons', authenticateToken, uploadVideo.single('video'), (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Envie um arquivo de vídeo' });
    }
    if (!title || !title.trim() || !category) {
      fs.rmSync(req.file.path, { force: true });
      return res.status(400).json({ error: 'Título e categoria são obrigatórios' });
    }

    const result = db.prepare(`
      INSERT INTO lessons (title, description, category, file_url, original_size_bytes, compressed_size_bytes, uploader_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title.trim(), (description || '').trim(), category, '/uploads/' + req.file.filename,
      req.file.size, req.file.size, req.user.id);
    const lessonId = Number(result.lastInsertRowid);

    res.status(201).json({ message: 'Aula enviada! Compactando o vídeo...', lessonId });

    compressUpload(req.file.filename).then(({ url, size }) => {
      db.prepare("UPDATE lessons SET file_url = ?, compressed_size_bytes = ?, status = 'ready' WHERE id = ?").run(url, size, lessonId);
    });
  } catch (error) {
    console.error('Erro ao enviar aula:', error);
    res.status(500).json({ error: 'Erro ao enviar aula' });
  }
});

// Erros de upload (tipo bloqueado, arquivo grande demais) voltam como JSON para o front exibir
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo grande demais' : err.message });
});

db.prepare("UPDATE lessons SET status = 'ready' WHERE status = 'processing'").run();

app.listen(PORT, () => {
  console.log(`\x1b[32m✓ Servidor Empreendedores do Brasil rodando na porta ${PORT}\x1b[0m`);
  console.log(`\x1b[34m→ API base: http://localhost:${PORT}/api\x1b[0m`);
});
