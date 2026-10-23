const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const seedDatabase = require('./seed');

// Garante que o banco tem os dados iniciais caso ainda não existam
seedDatabase();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'empreendedores_brasil_secret_key_2026';

app.use(cors());
app.use(express.json());

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

    res.json({
      members: Number(membersCount),
      ideas: Number(ideasCount),
      events: Number(eventsCount),
      comments: Number(commentsCount)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

app.listen(PORT, () => {
  console.log(`\x1b[32m✓ Servidor Empreendedores do Brasil rodando na porta ${PORT}\x1b[0m`);
  console.log(`\x1b[34m→ API base: http://localhost:${PORT}/api\x1b[0m`);
});
