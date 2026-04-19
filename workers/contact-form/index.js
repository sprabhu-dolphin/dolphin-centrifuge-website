// =============================================================
// Dolphin Centrifuge — Contact Form Cloudflare Worker
// Routes:
//   POST /                       → Process form, save to D1, send email
//   GET  /admin/submissions      → Return all submissions as JSON (auth required)
//   DELETE /admin/submissions/:id → Soft-delete a submission (auth required)
// Secrets: RESEND_API_KEY, ADMIN_PASSWORD, TURNSTILE_SECRET_KEY (optional)
// =============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env, ctx) {

    // ── CORS preflight ───────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Route: GET /admin/submissions ────────────────────────
    if (request.method === 'GET' && path === '/admin/submissions') {
      return handleAdminGet(request, env);
    }

    // ── Route: DELETE /admin/submissions/:id ─────────────────
    if (request.method === 'DELETE' && path.startsWith('/admin/submissions/')) {
      const id = path.split('/').pop();
      return handleAdminDelete(request, env, id);
    }

    // ── Route: POST / (form submission) ─────────────────────
    if (request.method === 'POST') {
      return handleFormSubmit(request, env);
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: CORS_HEADERS }
    );
  },
};

// ── ADMIN: Get all submissions ───────────────────────────────
async function handleAdminGet(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM submissions WHERE deleted = 0 ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({ success: true, data: results }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin GET error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── ADMIN: Soft-delete a submission ─────────────────────────
async function handleAdminDelete(request, env, id) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: CORS_HEADERS,
    });
  }

  if (!id || isNaN(Number(id))) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), {
      status: 400, headers: CORS_HEADERS,
    });
  }

  try {
    await env.DB.prepare(
      `UPDATE submissions SET deleted = 1 WHERE id = ?`
    ).bind(Number(id)).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error('Admin DELETE error:', err.message);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: CORS_HEADERS,
    });
  }
}

// ── Check admin Authorization header ────────────────────────
function isAdminAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return token && env.ADMIN_PASSWORD && token === env.ADMIN_PASSWORD;
}

// ── FORM: Handle a contact form submission ───────────────────
async function handleFormSubmit(request, env) {
  try {
    // Parse form data
    const contentType = request.headers.get('Content-Type') || '';
    let fields = {};
    if (contentType.includes('application/json')) {
      fields = await request.json();
    } else {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        fields[key] = value;
      }
    }

    // Honeypot spam check
    if (fields['bot-field']) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot detected' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Turnstile verification (if keys present)
    const turnstileToken = fields['cf-turnstile-response'];
    if (turnstileToken && env.TURNSTILE_SECRET_KEY) {
      const verified = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, request);
      if (!verified) {
        return new Response(
          JSON.stringify({ success: false, error: 'Security verification failed. Please try again.' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Extract fields
    const firstName         = (fields['first_name'] || '').trim();
    const lastName          = (fields['last_name'] || '').trim();
    const company           = (fields['company'] || '').trim();
    const email             = (fields['email'] || '').trim();
    const phone             = (fields['phone'] || '').trim();
    const contactMethod     = (fields['contact_method'] || '').trim();
    const country           = (fields['country'] || '').trim();
    const usState           = (fields['us_state'] || '').trim();
    const fluidType         = (fields['fluid_type'] || '').trim();
    const capacity          = (fields['capacity'] || '').trim();
    const solidsPercentage  = (fields['solids_percentage'] || '').trim();
    const centrifugeCondition = (fields['centrifuge_condition'] || '').trim();
    const additionalDetails = (fields['additional_details'] || '').trim();
    const countryOther      = (fields['country_other'] || '').trim();
    const countryDisplay    = country === 'Other' && countryOther ? `Other — ${countryOther}` : country;

    // Basic validation
    if (!firstName || !lastName || !email || !company || !phone || !fluidType || !capacity) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please fill in all required fields.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid email address.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // ── Reconnect check ──────────────────────────────────────
    let isReconnect = 0;
    let reconnectMatchId = null;
    let reconnectMatch = null;

    if (env.DB) {
      try {
        const phoneStripped = phone.replace(/[\s\-().+]/g, '');
        const { results: matches } = await env.DB.prepare(`
          SELECT id, first_name, last_name, company, email, created_at
          FROM submissions
          WHERE deleted = 0 AND (
            LOWER(email) = LOWER(?)
            OR REPLACE(REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'(',''),')','') = ?
            OR LOWER(company) = LOWER(?)
          )
          ORDER BY created_at DESC
          LIMIT 1
        `).bind(email, phoneStripped, company).all();

        if (matches && matches.length > 0) {
          isReconnect = 1;
          reconnectMatch = matches[0];
          reconnectMatchId = reconnectMatch.id;
        }
      } catch (dbErr) {
        console.error('Reconnect check error:', dbErr.message);
        // Non-fatal — continue with submission
      }
    }

    // ── Format labels for email ──────────────────────────────
    const contactMethodMap = {
      'phone_dolphin_calls': 'Phone — Dolphin Centrifuge will call them',
      'phone_you_call':      'Phone — They will call Dolphin: (248) 522-2573',
      'email':               'Email',
    };
    const contactMethodLabel = contactMethodMap[contactMethod] || contactMethod;

    const conditionMap = {
      'new_required':      'New centrifuge required',
      'remanufactured_ok': 'Remanufactured acceptable',
    };
    const conditionLabel = conditionMap[centrifugeCondition] || centrifugeCondition;

    // ── Build standard inquiry email HTML ────────────────────
    const row = (label, value, shade) => `
      <tr style="background-color:${shade ? '#f0f0f0' : '#ffffff'}">
        <td style="padding:8px 12px; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; color:#333; border:1px solid #ddd; width:42%; vertical-align:top;">${label}</td>
        <td style="padding:8px 12px; font-family:Arial,sans-serif; font-size:13px; color:#333; border:1px solid #ddd;">${value}</td>
      </tr>`;

    const sectionHeader = (title) => `
      <tr>
        <td colspan="2" style="padding:10px 12px; font-family:Arial,sans-serif; font-size:14px; font-weight:bold; color:#333; background-color:#c8c8c8; border:1px solid #ddd;">${title}</td>
      </tr>`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Centrifuge Information Request</title></head>
<body style="margin:0; padding:20px; font-family:Arial,sans-serif; background-color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px;">
    ${sectionHeader('Customer Details')}
    ${row('Name', `${firstName} ${lastName}`, false)}
    ${row('Company Name', company, true)}
    ${row('Email', `<a href="mailto:${email}" style="color:#1155CC;">${email}</a>`, false)}
    ${row('Phone', phone, true)}
    ${row('Preferred method of contact:', contactMethodLabel, false)}
    ${row('Country', countryDisplay, true)}
    ${row('US State', usState || '—', false)}
    ${sectionHeader('Application Details')}
    ${row('Type of Fluid', fluidType, false)}
    ${row('Capacity Required', capacity, true)}
    ${row('Percentage of Solids by Volume', solidsPercentage || '—', false)}
    ${row('Do you require a New Centrifuge or is a Remanufactured centrifuge acceptable?', conditionLabel, true)}
    ${row('Additional Details', additionalDetails ? additionalDetails.replace(/\n/g, '<br>') : '—', false)}
  </table>
</body>
</html>`;

    // ── Send standard inquiry email ──────────────────────────
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `${firstName} ${lastName} <noreply@dolphincentrifuge.com>`,
        to:       ['sales@dolphincentrifuge.com'],
        reply_to: email,
        subject:  `Centrifuge Information Request | ${firstName} ${lastName}`,
        html:     emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend API error:', errorBody);
      throw new Error('Email delivery failed. Please call us at (248) 522-2573.');
    }

    // ── Send reconnect alert email if applicable ─────────────
    if (isReconnect && reconnectMatch && env.RESEND_API_KEY) {
      const reconnectHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Returning Customer Alert</title></head>
<body style="margin:0; padding:20px; font-family:Arial,sans-serif; background-color:#fff7e6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:640px;">
    <tr>
      <td style="padding:16px 20px; background-color:#e8c204; font-family:Arial,sans-serif; font-size:18px; font-weight:bold; color:#1a2a4a;">
        ⚡ Returning Customer Alert
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px; font-family:Arial,sans-serif; font-size:14px; color:#333; background-color:#fff7e6;">
        <p>A new form submission matches an existing entry in your database. This may be a high-value reconnection.</p>
        <table width="100%" style="border-collapse:collapse; margin-top:12px;">
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd; width:50%;">New Submission</td>
            <td style="padding:8px 12px; font-weight:bold; border:1px solid #ddd;">Previous Match</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${firstName} ${lastName}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.first_name} ${reconnectMatch.last_name}</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${company}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.company}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:8px 12px; border:1px solid #ddd;">${email}</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">${reconnectMatch.email}</td>
          </tr>
          <tr style="background:#ffffff;">
            <td style="padding:8px 12px; border:1px solid #ddd;">Submitted just now</td>
            <td style="padding:8px 12px; border:1px solid #ddd;">Previously: ${reconnectMatch.created_at?.substring(0, 10) || 'unknown'}</td>
          </tr>
        </table>
        <p style="margin-top:16px;">Review both entries in your <strong>Admin Dashboard</strong>.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Fire-and-forget — don't await, don't fail the main request
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Dolphin CRM <noreply@dolphincentrifuge.com>',
          to:      ['sales@dolphincentrifuge.com'],
          subject: `⚡ Returning Customer — ${firstName} ${lastName} | ${company}`,
          html:    reconnectHtml,
        }),
      }).catch(err => console.error('Reconnect email error:', err.message));
    }

    // ── Save to D1 ───────────────────────────────────────────
    if (env.DB) {
      try {
        const createdAt = new Date().toISOString();
        await env.DB.prepare(`
          INSERT INTO submissions (
            created_at, first_name, last_name, company, email, phone,
            contact_method, country, us_state,
            fluid_type, capacity, solids_percentage,
            centrifuge_condition, additional_details,
            is_reconnect, reconnect_match_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          createdAt, firstName, lastName, company, email, phone,
          contactMethod, country, usState,
          fluidType, capacity, solidsPercentage,
          centrifugeCondition, additionalDetails,
          isReconnect, reconnectMatchId
        ).run();
      } catch (dbErr) {
        // Log but don't fail — email already sent successfully
        console.error('D1 insert error:', dbErr.message);
      }
    }

    // ── Success ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your inquiry has been received! Our team will respond within a few business days.',
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('Worker error:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred. Please call us at (248) 522-2573.',
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ── Cloudflare Turnstile verification helper ─────────────────
async function verifyTurnstile(token, secretKey, request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: token, remoteip: ip }),
  });
  const result = await verifyResponse.json();
  return result.success === true;
}
