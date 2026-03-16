const { PrismaClient } = require('@prisma/client');
const { extractVariables, renderPrompt } = require('../services/variableExtractor');

const prisma = new PrismaClient();

// GET /api/prompts — list all prompts
async function list(req, res) {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Parse variables JSON for each prompt before sending
    const result = prompts.map(p => ({ ...p, variables: JSON.parse(p.variables) }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/prompts/:id — get single prompt
async function get(req, res) {
  try {
    const prompt = await prisma.prompt.findUnique({ where: { id: req.params.id } });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ ...prompt, variables: JSON.parse(prompt.variables) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/prompts — create a new prompt
async function create(req, res) {
  try {
    const { title, description, promptText } = req.body;
    if (!title || !promptText) {
      return res.status(400).json({ error: 'title and promptText are required' });
    }

    // Auto-detect variables from the template text
    const variables = extractVariables(promptText);

    const prompt = await prisma.prompt.create({
      data: {
        title,
        description: description || '',
        promptText,
        variables: JSON.stringify(variables),
      },
    });

    res.status(201).json({ ...prompt, variables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/prompts/:id — update a prompt
async function update(req, res) {
  try {
    const { title, description, promptText } = req.body;
    const variables = extractVariables(promptText || '');

    const prompt = await prisma.prompt.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        promptText,
        variables: JSON.stringify(variables),
      },
    });

    res.json({ ...prompt, variables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/prompts/:id — delete a prompt
async function remove(req, res) {
  try {
    await prisma.prompt.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/prompts/:id/duplicate — duplicate a prompt
async function duplicate(req, res) {
  try {
    const source = await prisma.prompt.findUnique({ where: { id: req.params.id } });
    if (!source) return res.status(404).json({ error: 'Prompt not found' });

    const copy = await prisma.prompt.create({
      data: {
        title: `${source.title} (copy)`,
        description: source.description,
        promptText: source.promptText,
        variables: source.variables,
      },
    });

    res.status(201).json({ ...copy, variables: JSON.parse(copy.variables) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/prompts/:id/render — render prompt with variable values
async function render(req, res) {
  try {
    const prompt = await prisma.prompt.findUnique({ where: { id: req.params.id } });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });

    const rendered = renderPrompt(prompt.promptText, req.body.values || {});
    res.json({ rendered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { list, get, create, update, remove, duplicate, render };
