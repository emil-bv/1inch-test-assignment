import * as Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent')
    .allow(''),
  ETH_RPC_URL: Joi.string().uri().required(),
  CHAIN_ID: Joi.number(),
  UNISWAP_V2_FACTORY: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required(),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),
});
