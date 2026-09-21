import { Client } from '@gradio/client';

const SPACE='hysts/SDXL';
const app = await Client.connect(SPACE);
const api = await app.view_api();
console.log('API', JSON.stringify(api));
const named = api.named_endpoints || {};
const endpoint = Object.keys(named).find(k => named[k]?.parameters?.some(p => p.parameter_name === 'prompt')) || Object.keys(named)[0];
if (!endpoint) throw new Error('No callable endpoint');
console.log('ENDPOINT', endpoint);

const meta=named[endpoint];
const payload={};
for (const p of meta.parameters || []) {
  if (p.parameter_has_default) payload[p.parameter_name]=p.parameter_default;
}
payload.prompt='clean blackwork tattoo design of a raven and crescent moon, tattoo flash sheet, white background, high contrast linework, centered composition, no skin, no mockup';
if ('negative_prompt' in payload) payload.negative_prompt='photo, skin, body, text, watermark, blurry, low quality';
if ('use_negative_prompt' in payload) payload.use_negative_prompt=true;
if ('width' in payload) payload.width=768;
if ('height' in payload) payload.height=768;
if ('apply_refiner' in payload) payload.apply_refiner=false;
if ('num_inference_steps_base' in payload) payload.num_inference_steps_base=20;
if ('randomize_seed' in payload) payload.randomize_seed=true;
console.log('PAYLOAD', JSON.stringify(payload));

const result = await app.predict(endpoint, payload);
console.log('RESULT', JSON.stringify(result));
if (!result?.data?.length) throw new Error('No image returned');
console.log('HF_SDXL_TEST_OK');
