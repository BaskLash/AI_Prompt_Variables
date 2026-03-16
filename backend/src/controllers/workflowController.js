const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to parse a workflow's steps and their prompts
function formatWorkflow(workflow) {
  return {
    ...workflow,
    steps: workflow.steps.map(s => ({
      ...s,
      prompt: s.prompt
        ? { ...s.prompt, variables: JSON.parse(s.prompt.variables) }
        : null,
    })),
  };
}

// GET /api/workflows
async function list(req, res) {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: { prompt: true },
        },
      },
    });
    res.json(workflows.map(formatWorkflow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/workflows/:id
async function get(req, res) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: { prompt: true },
        },
      },
    });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(formatWorkflow(workflow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/workflows
async function create(req, res) {
  try {
    const { name, description, steps = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || '',
        steps: {
          create: steps.map((s, i) => ({
            promptId: s.promptId,
            stepOrder: s.stepOrder ?? i + 1,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: { prompt: true },
        },
      },
    });

    res.status(201).json(formatWorkflow(workflow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/workflows/:id
async function update(req, res) {
  try {
    const { name, description, steps } = req.body;

    // Update basic fields
    await prisma.workflow.update({
      where: { id: req.params.id },
      data: { name, description },
    });

    // Replace steps if provided
    if (steps !== undefined) {
      await prisma.workflowStep.deleteMany({ where: { workflowId: req.params.id } });
      await prisma.workflowStep.createMany({
        data: steps.map((s, i) => ({
          workflowId: req.params.id,
          promptId: s.promptId,
          stepOrder: s.stepOrder ?? i + 1,
        })),
      });
    }

    const updated = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { stepOrder: 'asc' }, include: { prompt: true } },
      },
    });

    res.json(formatWorkflow(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/workflows/:id
async function remove(req, res) {
  try {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { list, get, create, update, remove };
