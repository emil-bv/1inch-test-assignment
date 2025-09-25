import { bootstrap } from '@bootstrap/bootstrap';

bootstrap().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});
