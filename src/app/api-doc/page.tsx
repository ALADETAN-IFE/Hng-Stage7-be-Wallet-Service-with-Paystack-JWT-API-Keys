import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from './react-swagger';

export default async function IndexPage() {
  const spec: object = await getApiDocs();

  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}