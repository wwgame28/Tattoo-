import { Client } from '@gradio/client';

const app = await Client.connect('ByteDance/SDXL-Lightning');
const api = await app.view_api();
console.log('API', JSON.stringify(api));

const named = Object.keys(api.named_endpoints || {});
const unnamed = Object.keys(api.unnamed_endpoints || {});
const endpoint = named[0] || unnamed[0] || '/predict';
console.log('ENDPOINT', endpoint);

const payload = endpoint === '/generate_image'
  ? { prompt: 'clean blackwork tattoo design of a raven and crescent moon, white background, tattoo flash, high contrast linework', ckpt: '4-Step' }
  : ['clean blackwork tattoo design of a raven and crescent moon, white background, tattoo flash, high contrast linework', '4-Step'];

const result = await app.predict(endpoint, payload);
console.log('RESULT', JSON.stringify(result));
if (!result?.data?.length) throw new Error('No image returned');
console.log('HF_SDXL_TEST_OK');
