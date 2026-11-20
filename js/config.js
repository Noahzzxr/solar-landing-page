/* =========================================================================
   CONFIGURAÇÃO CENTRAL DA LANDING PAGE
   -------------------------------------------------------------------------
   Troque aqui os dados de cada cliente. Tudo o que estiver neste arquivo
   é aplicado automaticamente na página (textos marcados com data-cfg,
   links de WhatsApp, telefone, e-mail, redes sociais, simulador,
   portfólio e depoimentos).

   Cores e fontes ficam no topo de css/styles.css (bloco :root).
   Meta tags de SEO / Open Graph / schema.org ficam no <head> do index.html
   (precisam estar no HTML estático para os buscadores).
   ========================================================================= */

window.SITE_CONFIG = {
  /* ---------- Marca ---------- */
  brand: {
    name: "SolarMax",          // parte principal do logo
    suffix: "Energia",         // parte secundária do logo
    fullName: "SolarMax Energia",
    logoUrl: "",               // opcional: "img/logo.svg". Vazio = logo em texto + ícone
  },

  /* ---------- Contato ---------- */
  contact: {
    whatsapp: "5511999999999",           // DDI + DDD + número, só dígitos
    phoneDisplay: "(11) 99999-9999",
    phoneTel: "+5511999999999",
    email: "contato@solarmaxenergia.com.br",
    address: "Av. Exemplo, 1000 – Sala 101, Centro, São Paulo – SP, 01000-000",
    hours: "Seg a Sex, 8h às 18h · Sáb, 8h às 12h",
    cnpj: "00.000.000/0001-00",
  },

  /* ---------- Redes sociais (deixe "" para esconder) ---------- */
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/",
    youtube: "https://youtube.com/",
  },

  /* ---------- Textos operacionais ---------- */
  texts: {
    installDays: "30",              // usado em "instalação em até X dias"
    warrantyYears: "25",
    whatsappDefault: "Olá! Vim pelo site e gostaria de um orçamento de energia solar.",
    whatsappTooltip: "Fale com um especialista",
  },

  /* ---------- Integração futura (webhook / planilha / CRM) ----------
     Cole aqui a URL de um webhook (Zapier, Make, n8n, Google Apps Script,
     RD Station etc.). Se preenchido, cada lead é enviado via POST JSON
     ANTES de abrir o WhatsApp. Vazio = só WhatsApp.                    */
  webhookUrl: "",

  /* =======================================================================
     PREMISSAS DO SIMULADOR — ajuste por região / cliente
     ======================================================================= */
  simulator: {
    TARIFA_KWH: 0.95,              // R$/kWh médio (com impostos)
    IRRADIACAO_MEDIA: 4.5,         // kWh/m²/dia (horas de sol pleno)
    POTENCIA_PAINEL_W: 550,        // potência de cada placa
    CUSTO_KWP: 4000,               // R$ por kWp instalado
    DIAS_MES: 30,
    EFICIENCIA_SISTEMA: 0.80,      // perdas (temperatura, cabos, inversor). 1 = sem perdas
    AREA_POR_PLACA_M2: 2.6,        // área ocupada por placa de 550 W (com espaçamento)
    PERCENTUAL_ECONOMIA: 0.90,     // fração da conta eliminada (sobra taxa mínima/fio B)
    REAJUSTE_TARIFA_ANUAL: 0.06,   // aumento médio da tarifa ao ano
    DEGRADACAO_ANUAL: 0.005,       // perda de eficiência das placas ao ano
    ANOS_PROJECAO: 25,
    FATOR_CO2_KG_KWH: 0.0426,      // fator médio do SIN (MCTI) — atualize anualmente
    CO2_POR_ARVORE_KG_ANO: 8,      // CO₂ absorvido por uma árvore ao ano (estimativa)
    CONTA_MIN: 100,
    CONTA_MAX: 10000,
    CONTA_PADRAO: 450,
    // true = usa a irradiação de cada estado (lista abaixo) em vez da média
    USAR_IRRADIACAO_POR_ESTADO: false,
  },

  /* Estados atendidos. hsp = horas de sol pleno aproximadas (kWh/m²/dia).
     Só é usado se USAR_IRRADIACAO_POR_ESTADO = true. Remova os que não atende. */
  states: [
    { uf: "AC", name: "Acre", hsp: 4.6 },          { uf: "AL", name: "Alagoas", hsp: 5.4 },
    { uf: "AP", name: "Amapá", hsp: 4.8 },         { uf: "AM", name: "Amazonas", hsp: 4.5 },
    { uf: "BA", name: "Bahia", hsp: 5.5 },         { uf: "CE", name: "Ceará", hsp: 5.6 },
    { uf: "DF", name: "Distrito Federal", hsp: 5.3 },{ uf: "ES", name: "Espírito Santo", hsp: 5.0 },
    { uf: "GO", name: "Goiás", hsp: 5.3 },         { uf: "MA", name: "Maranhão", hsp: 5.2 },
    { uf: "MT", name: "Mato Grosso", hsp: 5.2 },   { uf: "MS", name: "Mato Grosso do Sul", hsp: 5.1 },
    { uf: "MG", name: "Minas Gerais", hsp: 5.3 },  { uf: "PA", name: "Pará", hsp: 4.8 },
    { uf: "PB", name: "Paraíba", hsp: 5.6 },       { uf: "PR", name: "Paraná", hsp: 4.6 },
    { uf: "PE", name: "Pernambuco", hsp: 5.5 },    { uf: "PI", name: "Piauí", hsp: 5.7 },
    { uf: "RJ", name: "Rio de Janeiro", hsp: 4.9 },{ uf: "RN", name: "Rio Grande do Norte", hsp: 5.7 },
    { uf: "RS", name: "Rio Grande do Sul", hsp: 4.6 },{ uf: "RO", name: "Rondônia", hsp: 4.7 },
    { uf: "RR", name: "Roraima", hsp: 4.9 },       { uf: "SC", name: "Santa Catarina", hsp: 4.4 },
    { uf: "SP", name: "São Paulo", hsp: 4.9 },     { uf: "SE", name: "Sergipe", hsp: 5.4 },
    { uf: "TO", name: "Tocantins", hsp: 5.4 },
  ],
  defaultState: "SP",

  /* Tipos de imóvel. fatorTarifa ajusta a tarifa (ex.: 1.05 = 5% mais cara). */
  propertyTypes: [
    { id: "residencial", label: "Residencial", fatorTarifa: 1 },
    { id: "comercial",   label: "Comercial",   fatorTarifa: 1 },
    { id: "rural",       label: "Rural",       fatorTarifa: 1 },
    { id: "industrial",  label: "Industrial",  fatorTarifa: 1 },
  ],

  /* ---------- Portfólio (troque pelas fotos reais) ---------- */
  projects: [
    { cat: "residencial", title: "Residência Alto Padrão", city: "Campinas – SP", kwp: 8.8, saving: 1150,
      img: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a", alt: "Instalador posicionando placa solar no telhado de uma casa" },
    { cat: "comercial", title: "Centro Empresarial", city: "Ribeirão Preto – SP", kwp: 75.4, saving: 9800,
      img: "https://images.unsplash.com/photo-1611365892117-00ac5ef43c90", alt: "Painéis solares em frente a um prédio comercial ao entardecer" },
    { cat: "agro", title: "Fazenda Santa Luzia", city: "Rio Verde – GO", kwp: 112.2, saving: 14600,
      img: "https://images.unsplash.com/photo-1558449028-b53a39d100fc", alt: "Usina solar de solo em área rural com céu azul" },
    { cat: "industrial", title: "Galpão Logístico", city: "Jundiaí – SP", kwp: 248.6, saving: 31200,
      img: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d", alt: "Cobertura industrial com centenas de placas solares ao pôr do sol" },
    { cat: "residencial", title: "Casa de Campo", city: "Atibaia – SP", kwp: 5.5, saving: 690,
      img: "https://images.unsplash.com/photo-1566093097221-ac2335b09e70", alt: "Placas solares instaladas no jardim de uma residência" },
    { cat: "comercial", title: "Colégio Particular", city: "Sorocaba – SP", kwp: 46.2, saving: 6100,
      img: "https://images.unsplash.com/photo-1655300256486-4ec7251bf84e", alt: "Telhado de edifício coberto por painéis solares entre árvores" },
    { cat: "agro", title: "Sítio Boa Vista", city: "Uberaba – MG", kwp: 33, saving: 4300,
      img: "https://images.unsplash.com/photo-1592833159155-c62df1b65634", alt: "Painéis solares instalados em encosta com vegetação" },
    { cat: "industrial", title: "Metalúrgica Regional", city: "Sumaré – SP", kwp: 180.4, saving: 22900,
      img: "https://images.unsplash.com/photo-1509391366360-2e959784a276", alt: "Painéis solares de uma usina industrial sob céu azul" },
  ],

  /* ---------- Depoimentos (troque por clientes reais, com autorização) ---------- */
  testimonials: [
    { name: "Mariana Couto", city: "Campinas – SP", stars: 5, saving: "R$ 780/mês",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      text: "Minha conta era de R$ 860 e hoje pago a taxa mínima. A equipe explicou tudo, cumpriu o prazo e cuidou da homologação sem eu precisar me preocupar." },
    { name: "Ricardo Almeida", city: "Ribeirão Preto – SP", stars: 5, saving: "R$ 9.400/mês",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      text: "Para o nosso centro comercial, o investimento se pagou muito antes do previsto. O monitoramento pelo app mostra a geração em tempo real." },
    { name: "Juliana Ferraz", city: "Atibaia – SP", stars: 5, saving: "R$ 610/mês",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      text: "Financiei e a parcela ficou menor do que a conta que eu pagava. Ou seja, comecei a economizar desde o primeiro mês." },
    { name: "Carlos Mendes", city: "Rio Verde – GO", stars: 5, saving: "R$ 14.200/mês",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      text: "Os pivôs de irrigação consumiam muito. Com a usina na fazenda, a energia deixou de ser o maior custo da operação." },
    { name: "André Souza", city: "Sumaré – SP", stars: 5, saving: "R$ 22.000/mês",
      photo: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617",
      text: "Projeto técnico impecável, documentação completa e suporte rápido. Recomendo para qualquer indústria que queira reduzir custo fixo." },
  ],
};
