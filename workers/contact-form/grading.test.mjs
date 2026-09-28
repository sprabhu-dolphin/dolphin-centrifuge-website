import assert from 'node:assert/strict';
import test from 'node:test';
import { autoGradeLead, gradeLead } from './grading.js';

test('low-fit words are passed to the AI as hints instead of forcing C', async () => {
  let prompt = '';
  const result = await autoGradeLead({
    first_name: 'Test',
    last_name: 'Lead',
    company: 'Personal',
    email: 'test@example.com',
    additional_details: 'I need a small centrifuge for home use in my garage.',
  }, {
    AI: { run: async (_model, input) => { prompt = input.messages[0].content; return { response: '{"grade":"C","reason":"Home garage use."}' }; } },
  });

  assert.equal(result.grade, 'C');
  assert.equal(result.stage, 'ai');
  assert.match(prompt, /low-fit words in the message: small, home/);
});

test('process wording like free water and a rental page URL does not force C', async () => {
  let aiCalls = 0;
  let prompt = '';
  const result = await autoGradeLead({
    company: 'Gulf Waste Oil Recovery',
    email: 'ops@gulfwor.example',
    fluid_type: 'Used oil with free water',
    capacity: '10,000 L/h',
    solids_percentage: 'small concentration',
    additional_details: 'Please feel free to call.',
    attribution_landing_page: '/centrifuge-rental/',
  }, {
    AI: { run: async (_model, input) => { aiCalls += 1; prompt = input.messages[0].content; return { response: '{"grade":"A","reason":"Industrial waste oil at 10,000 L/h."}' }; } },
  });

  assert.equal(aiCalls, 1);
  assert.equal(result.grade, 'A');
  assert.doesNotMatch(prompt, /low-fit words in the message: .*rent/);
});

test('strong industrial model signal can be graded A by AI', async () => {
  const result = await autoGradeLead({
    first_name: 'Maria',
    last_name: 'Buyer',
    company: 'Marine Diesel Services',
    email: 'maria@marinediesel.example',
    phone: '248-555-0100',
    additional_details: 'Need reconditioned MOPX 207 for marine diesel, 2000 L/h.',
    attribution_landing_page: '/disc-centrifuge-parts-glossary/',
    attribution_source: 'google',
    attribution_medium: 'cpc',
  }, {
    AI: {
      run: async () => ({
        response: { grade: 'A', reason: 'Industrial marine diesel MOPX request with flow rate.' },
      }),
    },
  });

  assert.equal(result.grade, 'A');
  assert.match(result.reason, /marine diesel/i);
});

test('thin generic freemail lead can be graded B by AI', async () => {
  const result = await autoGradeLead({
    first_name: 'Alex',
    last_name: 'Smith',
    company: 'Unknown',
    email: 'alex@gmail.com',
    additional_details: 'Please send info about centrifuges.',
  }, {
    AI: {
      run: async () => ({
        response: '{"grade":"B","reason":"Plausible inquiry but application and budget are unclear."}',
      }),
    },
  });

  assert.equal(result.grade, 'B');
});

test('invalid AI response fails open as ungraded', async () => {
  const result = await autoGradeLead({
    first_name: 'Alex',
    last_name: 'Smith',
    company: 'Unknown',
    email: 'alex@gmail.com',
    additional_details: 'Please send info about centrifuges.',
  }, {
    AI: { run: async () => ({ response: 'A lead for sure' }) },
  });

  assert.equal(result.grade, null);
  assert.equal(result.failed, true);
  assert.match(result.reason, /auto-grade failed/i);
});

test('gradeLead update keeps the manual override guard', async () => {
  const statements = [];
  const env = {
    AI: { run: async () => ({ response: { grade: 'B', reason: 'Plausible but unqualified.' } }) },
    DB: {
      prepare(sql) {
        statements.push(sql);
        if (/SELECT \*/i.test(sql)) {
          return { bind: () => ({ first: async () => ({ id: 101, company: 'Test Co', additional_details: 'Need centrifuge info.' }) }) };
        }
        return { bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }) };
      },
    },
  };

  const result = await gradeLead(env, 101);
  assert.equal(result.grade, 'B');
  const updateSql = statements.find((sql) => /UPDATE submissions/i.test(sql));
  assert.match(updateSql, /grade_source IS NULL OR grade_source != 'manual'/);
});
