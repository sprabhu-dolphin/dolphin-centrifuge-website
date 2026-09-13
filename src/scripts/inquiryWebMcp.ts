// Use the imperative API for form filling: available in agent browsers that do
// not yet expose declarative forms. Submit remains the existing visible action.
export function inquiryWebMcpTools() {
  const form = document.getElementById?.('centrifuge-contact-form') as HTMLFormElement | null;
  if (!form) return [];
  const names = ['first_name', 'last_name', 'company', 'email', 'email_confirm', 'phone',
    'contact_method', 'country', 'us_state', 'country_other', 'fluid_type',
    'required_flow_rate', 'solids_percentage', 'centrifuge_condition', 'additional_details'];
  type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const controls = new Map(names.map(name => [name, Array.from(form.querySelectorAll<Field>(`[name="${name}"]`))]));
  const properties = Object.fromEntries(names.map(name => {
    const fields = controls.get(name)!;
    const field = fields[0];
    const choices = field instanceof HTMLSelectElement
      ? Array.from(field.options).filter(option => option.value).map(option => option.value)
      : field instanceof HTMLInputElement && field.type === 'radio' ? fields.map(option => option.value) : undefined;
    const description = ({contact_method: 'Preferred contact method: Dolphin calls, visitor calls, or email.',
      centrifuge_condition: 'Whether new equipment is required or remanufactured equipment is acceptable.'}[name]) || field.getAttribute('toolparamdescription') ||
      (field.labels?.[0]?.textContent ?? name).trim().replace(/\s+/g, ' ');
    return [name, {type: 'string', maxLength: name === 'additional_details' ? 4000 : 254,
      description: description.slice(0, 150), ...(choices ? {enum: choices} : {})}];
  }));
  return [{
    name: 'prepare_centrifuge_inquiry',
    title: 'Prepare centrifuge inquiry',
    description: 'Fill supplied contact and process details in the visible Dolphin inquiry form. Omitted fields stay unchanged. Returns missing required fields. The visitor reviews the form and clicks Submit Application Details to send an inquiry for engineering follow-up.',
    inputSchema: {type: 'object', additionalProperties: false, properties},
    annotations: {readOnlyHint: false, untrustedContentHint: false, consequentialHint: false},
    execute: async (input: Record<string, unknown>, context?: {signal?: AbortSignal}) => {
      context?.signal?.throwIfAborted();
      if ((form.querySelector('#submit-btn') as HTMLButtonElement)?.disabled) {
        return {status: 'pending', message: 'An inquiry is currently being submitted.'};
      }
      for (const name of names) {
        if (!Object.hasOwn(input, name)) continue;
        const fields = controls.get(name)!;
        for (const field of fields) {
          if (field instanceof HTMLInputElement && field.type === 'radio') field.checked = field.value === input[name];
          else field.value = input[name] as string;
          field.dispatchEvent(new Event('input', {bubbles: true}));
          field.dispatchEvent(new Event('change', {bubbles: true}));
        }
      }
      const missing = names.filter(name => {
        const fields = controls.get(name)!;
        if (!fields.some(field => field.required)) return false;
        return fields[0] instanceof HTMLInputElement && fields[0].type === 'radio'
          ? !fields.some(field => (field as HTMLInputElement).checked)
          : !fields[0].value.trim();
      });
      form.scrollIntoView({block: 'start'});
      (controls.get(missing[0] ?? 'first_name')?.[0])?.focus();
      return {status: 'prepared', submitted: false, missingFields: missing,
        emailMatches: controls.get('email')![0].value === controls.get('email_confirm')![0].value,
        message: 'Review the visible form, complete missing fields, and use Submit Application Details to send the inquiry.'};
    },
  }];
}
