const bcrypt = require('bcryptjs');
const db = require('./db');

function seedDatabase() {
  console.log('Iniciando seed do banco de dados...');

  // Verifica se já existem usuários cadastrados
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log(`Banco já contém ${userCount} usuários. Pulando seed inicial.`);
    return;
  }

  const defaultPassword = bcrypt.hashSync('123456', 10);

  // 1. Inserir Usuários Empreendedores
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, company, role, avatar, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const usersData = [
    {
      name: 'Ana Paula Silveira',
      email: 'ana@omnipay.com.br',
      company: 'OmniPay Fintech',
      role: 'Founder & CEO',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Especialista em meios de pagamento, regulação de fintechs e expansão de mercado B2B.'
    },
    {
      name: 'Carlos Eduardo Ramos',
      email: 'carlos@agrotech.com.br',
      company: 'AgroTech Brasil',
      role: 'Co-founder & CTO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Engenheiro apaixonado por IoT e dados no agronegócio. Escalonando soluções no Centro-Oeste.'
    },
    {
      name: 'Mariana Botelho',
      email: 'mariana@logix.com.br',
      company: 'Logix Express',
      role: 'Head de Growth',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      bio: 'Estrategista de vendas inbound/outbound B2B, retenção de clientes e cultura de alta performance.'
    },
    {
      name: 'Lucas Mendonça',
      email: 'lucas@nexusia.com.br',
      company: 'Nexus IA Generativa',
      role: 'Fundador',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Criador de agentes e soluções de automação cognitiva para e-commerces e grandes varejistas.'
    },
    {
      name: 'Empreendedor Membro',
      email: 'demo@empreendedores.com.br',
      company: 'Sua Startup / Negócio',
      role: 'Fundador & Diretor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Membro ativo da rede Empreendedores do Brasil. Conectando negócios e gerando valor mútuo.'
    }
  ];

  const userIds = [];
  for (const u of usersData) {
    const res = insertUser.run(u.name, u.email, defaultPassword, u.company, u.role, u.avatar, u.bio);
    userIds.push(Number(res.lastInsertRowid));
  }

  console.log(`✓ ${userIds.length} empreendedores inseridos.`);

  // 2. Inserir Ideias Iniciais
  const insertIdea = db.prepare(`
    INSERT INTO ideas (title, description, tags, category, status, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const ideasData = [
    {
      title: 'Central Unificada de Compras Coletivas B2B para o Grupo',
      description: 'Muitos de nós compramos serviços de nuvem (AWS, GCP), licenças SaaS (HubSpot, Slack) e até frete com valores individuais altos. Se montarmos um comitê interno para negociar contratos corporativos sob o selo do grupo, poderíamos ter descontos de 30% a 50% em custos operacionais fixos.',
      tags: JSON.stringify(['Parcerias', 'B2B', 'Redução de Custos', 'Operações']),
      category: 'Parcerias & Custos',
      status: 'Em Discussão',
      author_id: userIds[0] // Ana Paula
    },
    {
      title: 'Hackathon Interno: Desenvolvendo Agentes de IA para Nossas Startups',
      description: 'Proponho um final de semana intensivo onde nossos times técnicos e nós mesmos nos juntamos para prototipar agentes autônomos de atendimento e inteligência financeira usando LLMs. Podemos trocar benchmarks e aprendizados práticos sem concorrência direta.',
      tags: JSON.stringify(['Inteligência Artificial', 'Inovação', 'Tech', 'Comunidade']),
      category: 'Tecnologia & IA',
      status: 'Validado',
      author_id: userIds[3] // Lucas Mendonça
    },
    {
      title: 'Rodada Trimestral de Pitch Reverso com Fundos de Investimento',
      description: 'Em vez de ficarmos enviando decks frios para VCs, convidamos 3 a 4 gestoras de Venture Capital e Investidores-Anjo renomados para apresentarem suas teses de investimento diretamente aos membros do grupo, abrindo canal direto para quem está captando Seed ou Série A.',
      tags: JSON.stringify(['Investimento', 'Venture Capital', 'Networking', 'Captação']),
      category: 'Finanças & Captação',
      status: 'Parceria Aberta',
      author_id: userIds[1] // Carlos Eduardo
    }
  ];

  const ideaIds = [];
  for (const idea of ideasData) {
    const res = insertIdea.run(idea.title, idea.description, idea.tags, idea.category, idea.status, idea.author_id);
    ideaIds.push(Number(res.lastInsertRowid));
  }

  console.log(`✓ ${ideaIds.length} ideias inseridas.`);

  // 3. Votos nas Ideias
  const insertVote = db.prepare(`
    INSERT OR IGNORE INTO idea_votes (idea_id, user_id) VALUES (?, ?)
  `);
  insertVote.run(ideaIds[0], userIds[1]);
  insertVote.run(ideaIds[0], userIds[2]);
  insertVote.run(ideaIds[0], userIds[4]);
  insertVote.run(ideaIds[1], userIds[0]);
  insertVote.run(ideaIds[1], userIds[2]);
  insertVote.run(ideaIds[1], userIds[3]);
  insertVote.run(ideaIds[1], userIds[4]);
  insertVote.run(ideaIds[2], userIds[0]);
  insertVote.run(ideaIds[2], userIds[3]);

  // 4. Inserir Comentários Iniciais
  const insertComment = db.prepare(`
    INSERT INTO comments (idea_id, user_id, content) VALUES (?, ?, ?)
  `);

  const commentsData = [
    {
      idea_id: ideaIds[0],
      user_id: userIds[1],
      content: 'Excelente iniciativa! Na AgroTech nós já gastamos bastante com servidores e serviços de mapa satelital. Se somarmos com outras empresas do grupo, o poder de barganha vai ser absurdo.'
    },
    {
      idea_id: ideaIds[0],
      user_id: userIds[2],
      content: 'Conte comigo para a negociação de ferramentas de CRM e plataformas de customer service. Tenho contato com o VP de parcerias de um grande player.'
    },
    {
      idea_id: ideaIds[1],
      user_id: userIds[0],
      content: 'Super apoio! Podemos usar as salas de reunião da OmniPay em SP ou fazer em formato híbrido. Gostaria de focar em automação de reconciliação financeira.'
    },
    {
      idea_id: ideaIds[1],
      user_id: userIds[4],
      content: 'Achei fantástica a proposta! Vou inscrever 2 desenvolvedores do meu time para somar nesse hackathon.'
    },
    {
      idea_id: ideaIds[2],
      user_id: userIds[3],
      content: 'O formato de pitch reverso é muito mais eficiente. Os VCs gostam porque filtram founders qualificados e a gente economiza meses de prospecção.'
    }
  ];

  for (const c of commentsData) {
    insertComment.run(c.idea_id, c.user_id, c.content);
  }
  console.log(`✓ ${commentsData.length} comentários inseridos.`);

  // 5. Inserir Eventos (Reuniões e Palestras Internas)
  const insertEvent = db.prepare(`
    INSERT INTO events (title, type, description, date_time, duration_minutes, location_type, meeting_link, speaker_id, speaker_name, speaker_topic, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const d1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Daqui a 2 dias
  d1.setHours(19, 0, 0, 0);

  const d2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // Daqui a 5 dias
  d2.setHours(18, 30, 0, 0);

  const d3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Daqui a 10 dias
  d3.setHours(20, 0, 0, 0);

  const eventsData = [
    {
      title: 'Palestra Interna: Playbook de Tração B2B — De 0 a R$ 1 Milhão em ARR',
      type: 'talk',
      description: 'Mariana Botelho vai abrir os bastidores das estratégias de prospecção outbound, qualificação de leads e ciclo de fechamento que funcionaram na prática na Logix. Sessão com espaço aberto para Q&A e análise de casos dos membros.',
      date_time: d1.toISOString(),
      duration_minutes: 75,
      location_type: 'online',
      meeting_link: 'https://meet.google.com/emp-br-talks',
      speaker_id: userIds[2],
      speaker_name: 'Mariana Botelho',
      speaker_topic: 'Growth & Vendas Enterprise B2B',
      created_by: userIds[2]
    },
    {
      title: 'Reunião Geral: Planejamento Trimestral e Oportunidades de Co-Marketing',
      type: 'meeting',
      description: 'Encontro oficial de alinhamento dos membros do grupo Empreendedores do Brasil. Pauta: balanço das parcerias ativas, apresentação dos novos integrantes, definição da agenda do próximo mês e rodada rápida de necessidades mútuas.',
      date_time: d2.toISOString(),
      duration_minutes: 60,
      location_type: 'online',
      meeting_link: 'https://zoom.us/j/9876543210',
      speaker_id: userIds[0],
      speaker_name: 'Ana Paula Silveira',
      speaker_topic: 'Alinhamento Estratégico',
      created_by: userIds[0]
    },
    {
      title: 'Palestra Interna: Engenharia de Prompts e Agentes de IA Aplicados aos Negócios',
      type: 'talk',
      description: 'Lucas Mendonça demonstrará casos práticos de arquitetura de agentes, automação de fluxos operacionais com Claude/GPT-4 e redução de custos operacionais em atendimento e backoffice.',
      date_time: d3.toISOString(),
      duration_minutes: 90,
      location_type: 'online',
      meeting_link: 'https://meet.google.com/nexus-ia-workshop',
      speaker_id: userIds[3],
      speaker_name: 'Lucas Mendonça',
      speaker_topic: 'IA Prática no Mundo Real',
      created_by: userIds[3]
    }
  ];

  const eventIds = [];
  for (const ev of eventsData) {
    const res = insertEvent.run(
      ev.title, ev.type, ev.description, ev.date_time,
      ev.duration_minutes, ev.location_type, ev.meeting_link,
      ev.speaker_id, ev.speaker_name, ev.speaker_topic, ev.created_by
    );
    eventIds.push(Number(res.lastInsertRowid));
  }

  // Presenças nos eventos
  const insertAttendee = db.prepare(`
    INSERT OR IGNORE INTO event_attendees (event_id, user_id, status) VALUES (?, ?, 'confirmed')
  `);
  insertAttendee.run(eventIds[0], userIds[0]);
  insertAttendee.run(eventIds[0], userIds[1]);
  insertAttendee.run(eventIds[0], userIds[3]);
  insertAttendee.run(eventIds[0], userIds[4]);

  insertAttendee.run(eventIds[1], userIds[0]);
  insertAttendee.run(eventIds[1], userIds[1]);
  insertAttendee.run(eventIds[1], userIds[2]);
  insertAttendee.run(eventIds[1], userIds[3]);
  insertAttendee.run(eventIds[1], userIds[4]);

  insertAttendee.run(eventIds[2], userIds[1]);
  insertAttendee.run(eventIds[2], userIds[2]);
  insertAttendee.run(eventIds[2], userIds[4]);

  console.log('✓ Presenças nos eventos registradas.');
  console.log('Seed concluído com sucesso!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
