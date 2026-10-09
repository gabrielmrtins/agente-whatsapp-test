# Agente n8n API - Integração WhatsApp com IA

Uma implementação profissional de um assistente inteligente que integra sua conta pessoal do WhatsApp ao n8n, mantendo contexto de conversas e respondendo através de modelos de linguagem (Gemini, GPT-4, Claude ou similar).

## Visão Geral

Este projeto conecta seu WhatsApp a um agente de IA através do n8n, permitindo respostas automatizadas enquanto preserva o histórico de conversas. O sistema é composto por três componentes principais:

1. **Evolution API** (este repositório) - Camada de integração WhatsApp
2. **n8n Cloud** - Orquestração de fluxos e processamento de IA
3. **Modelo de Linguagem** - Gemini, GPT-4, Claude ou equivalente

## Arquitetura

```
┌─────────────────────────┐
│   WhatsApp (Pessoal)    │
└────────────┬────────────┘
             │
    ┌────────v────────┐
    │  Evolution API  │ (Servidor Node.js)
    │   (Este Repo)   │
    └────────┬────────┘
             │
    ┌────────v────────┐
    │   n8n Cloud     │ (Motor de Fluxos)
    └────────┬────────┘
             │
    ┌────────v────────┐
    │ Gemini / GPT-4  │ (Modelo de Linguagem)
    │   / Claude      │
    └────────┬────────┘
             │
    ┌────────v────────┐
    │ Histórico de    │ (Memória de Contexto)
    │   Mensagens     │
    └─────────────────┘
```

## Características Principais

- Integração WhatsApp sem verificação de API oficial da Meta
- Recepção e processamento de mensagens em tempo real
- Preservação de contexto de conversa (histórico de 5-10 mensagens)
- Suporte para múltiplos modelos de linguagem (Gemini, GPT-4, Claude, etc)
- Geração automática e entrega de respostas
- Operação 24/7 na infraestrutura Railway
- Implantação econômica (R$25-35/mês)

## Pré-requisitos

- Conta Railway (https://railway.app)
- Conta n8n Cloud (https://n8n.cloud)
- API key de um provedor LLM (Google Gemini, OpenAI, Anthropic, etc)
- Conta WhatsApp pessoal (qualquer número)
- Git instalado no sistema

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/agente-n8n-api.git
cd agente-n8n-api
```

### 2. Fazer Push para Railway

```bash
git push origin main
```

Railway detecta automaticamente `package.json` e inicia o deployment. Geralmente completa em 5 minutos.

### 3. Configurar Variáveis de Ambiente

No painel do Railway:

Navegue até seu serviço → Variables → Adicione:

```
WEBHOOK_URL=https://sua-instancia-n8n.app/webhook/whatsapp-webhook
```

### 4. Obter URL Pública

Railway gera uma URL pública no formato:
```
https://agente-n8n-api-production.up.railway.app
```

Salve esta URL para as próximas etapas.

### 5. Configurar Fluxo no n8n

1. Acesse sua instância n8n Cloud
2. Crie novo fluxo ou importe `n8n-workflow-com-memoria.json`
3. Configure credenciais do seu provedor LLM (Gemini, OpenAI, Anthropic, etc)
4. Defina a URL do webhook para o endpoint da Evolution API do passo 4
5. Configure o nó de IA com instruções do sistema apropriadas
6. Ative o fluxo

### 6. Autenticação WhatsApp

1. Abra a URL pública da Evolution API em seu navegador
2. Escaneie o código QR exibido usando o app WhatsApp no seu celular
3. Confirme o pareamento nas configurações do WhatsApp (Configurações → Dispositivos Vinculados)
4. Aguarde mensagem de confirmação: "WhatsApp conectado com sucesso"

### 7. Verificação

Envie uma mensagem de teste via WhatsApp. Você deve receber uma resposta gerada por IA em 2-3 segundos.

## Estrutura do Projeto

```
agente-n8n-api/
├── evolution-api-setup.js     # Implementação principal do servidor
├── package.json               # Dependências do projeto
├── package-lock.json          # Arquivo de lock das dependências
├── Dockerfile                 # Configuração de container
├── .env.example               # Template de variáveis de ambiente
├── .gitignore                 # Regras de ignore do Git
└── README.md                  # Este arquivo
```

## Detalhes dos Componentes

### Evolution API (evolution-api-setup.js)

Implementa a integração WhatsApp usando a biblioteca `whatsapp-web.js`:

- Simula cliente WhatsApp Web usando Puppeteer
- Estabelece conexão persistente com servidores WhatsApp
- Gerencia geração de código QR para autenticação
- Processa mensagens recebidas e confirmações de entrega
- Fornece endpoints HTTP para transmissão de mensagens

### Fluxo n8n

Orquestra a camada de inteligência:

1. Recebe mensagens via webhook
2. Recupera histórico de conversa do armazenamento persistente
3. Constrói prompt com contexto completo da conversa
4. Invoca modelo de linguagem (Gemini, GPT-4, Claude, etc) com contexto
5. Armazena resposta no histórico de mensagens
6. Retorna resposta para Evolution API para entrega

### Armazenamento

O histórico de mensagens é mantido através de:

- **Armazenamento local** (memória RAM) - Implementação simples, dados perdidos ao reiniciar
- **PostgreSQL** - Opção de armazenamento persistente para produção

## Configuração

### Personalização do Prompt do Sistema

Modifique o comportamento do agente editando o prompt do sistema no n8n:

```javascript
// Exemplo: Assistente de programação
"Você é um especialista em Python e JavaScript. Forneça soluções de código 
claras e concisas com explicações."

// Exemplo: Atendimento ao cliente
"Você é um representante de atendimento ao cliente profissional. Responda 
com cortesia e eficiência às dúvidas dos clientes."

// Exemplo: Tutor educacional
"Você é um tutor especializado. Explique conceitos de forma clara e 
forneça exemplos práticos."
```

### Tamanho da Janela de Contexto

Ajuste a profundidade do histórico de conversa na configuração do webhook do n8n:

```javascript
.slice(-10)   // Padrão: últimas 10 mensagens
.slice(-20)   // Estendido: últimas 20 mensagens
.slice(-5)    // Mínimo: últimas 5 mensagens
```

### Seleção do Modelo de Linguagem

O projeto suporta qualquer provedor LLM através do n8n:

**Google Gemini:**
1. Obtenha API key em Google AI Studio
2. Crie credencial Gemini no n8n
3. Selecione modelo Gemini no nó de IA

**OpenAI GPT-4:**
1. Obtenha API key em platform.openai.com
2. Crie credencial OpenAI no n8n
3. Selecione modelo GPT-4 ou GPT-4 Turbo

**Anthropic Claude:**
1. Obtenha API key em console.anthropic.com
2. Crie credencial Anthropic no n8n
3. Selecione modelo Claude 3 ou equivalente

**Outros provedores:**
- Cohere
- HuggingFace
- Ollama (local)
- Qualquer API compatível com HTTP

## Custos Operacionais

| Serviço | Custo Mensal | Observações |
|---------|-------------|-------------|
| Railway | R$25 | Recursos do servidor |
| n8n Cloud | Grátis | Incluído no plano gratuito |
| API LLM | R$5-20 | Uso real de tokens |
| **Total** | **R$30-45** | Gasto típico mensal |

Railway fornece crédito de R$25 para novas contas, permitindo até 30 dias de operação gratuita para um único serviço.

## Considerações de Segurança

- Variáveis de ambiente armazenadas com segurança no Railway (criptografadas em repouso)
- Chaves de API nunca commitadas no controle de versão
- HTTPS obrigatório para todas as comunicações de webhook
- Dados de sessão WhatsApp armazenados localmente (não compartilhados)
- Dados de mensagens não persistidos a menos que explicitamente configurado

## Resolução de Problemas

### Falhas no Lançamento do Container

Erro: "Failed to launch browser process"

Solução: Garanta que o Dockerfile inclui todas as bibliotecas de sistema necessárias:
```dockerfile
RUN apt-get install -y chromium libglib2.0-0 libx11-6 libpangocairo-1.0-0
```

### Problemas de Configuração de Webhook

Erro: "WEBHOOK_URL está vazio"

Solução: Verifique se a variável de ambiente está configurada no painel Railway:
1. Serviço → Variables
2. Adicione WEBHOOK_URL apontando para o endpoint webhook do n8n
3. Dispare um novo deployment

### Atrasos na Entrega de Mensagens

Causa: Tempo de processamento do modelo de linguagem ou limites de taxa

Solução:
- Verifique créditos da conta e quota de API
- Verifique conectividade de rede
- Aumente valores de timeout no fluxo n8n

### Desconexão WhatsApp

Causa: Expiração de sessão ou reinicialização do container

Solução:
1. Acesse a URL pública da Evolution API
2. Escaneie o código QR novamente
3. Verifique se o app WhatsApp no celular está atualizado

## Desenvolvimento

### Testes Locais

Para executar localmente:

```bash
npm install
node evolution-api-setup.js
```

Acesse em `http://localhost:3000`

### Construir Imagem Docker

```bash
docker build -t agente-n8n-api .
docker run -p 3000:8080 agente-n8n-api
```

## Métricas de Desempenho

Tempos de resposta típicos:

- Recepção de mensagem: <100ms
- Processamento n8n: 500-1000ms
- Geração do modelo de linguagem: 1000-3000ms
- Entrega de mensagem: <100ms
- **Latência total ponta-a-ponta: 2-5 segundos**

## Limitações

- Automação WhatsApp Web não é oficialmente suportada pela Meta
- Risco de suspensão de conta se detectada atividade de bot
- Disponibilidade 24/7 depende do uptime do Railway
- Limitações de armazenamento baseadas na camada de persistência selecionada
- Limites de taxa (rate limits) aplicam-se ao uso da API LLM

## Referências

- [Documentação whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [Documentação n8n](https://docs.n8n.io)
- [Guia de Deployment Railway](https://docs.railway.app)
- [Referência API Google Gemini](https://ai.google.dev/docs)
- [Referência API OpenAI](https://platform.openai.com/docs)
- [Documentação Anthropic Claude](https://docs.anthropic.com)

## Contribuições

Issues e pull requests são bem-vindos. Garanta:

- Código segue boas práticas de Node.js
- Alterações estão documentadas
- Mudanças quebrantes são claramente anotadas

## Licença

Licença MIT - Ver arquivo LICENSE para detalhes

## Aviso Legal

Este projeto utiliza automação WhatsApp Web, que não é oficialmente suportada pela Meta Platforms. Os usuários são responsáveis pela conformidade com os Termos de Serviço do WhatsApp. Suspensão ou banimento permanente da conta pode ocorrer se a automação for detectada. Use por sua conta e risco.

---

**Mantido para uso pessoal e fins educacionais.**

Para dúvidas ou problemas, abra uma issue no GitHub.
